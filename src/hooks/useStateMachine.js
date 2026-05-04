// useStateMachine.js — Thin bridge between the state machine engine and React
import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  processInput,
  getAvailableTransitions,
  getStateInfo,
} from "../stateMachine/engine.js";
import { nodeMap } from "../data/graph.js";
import { NODE_TYPE } from "../data/constants.js";

// Aux LED patterns (cycle order matches Anduril firmware)
export const AUX_PATTERNS = ["off", "low", "high", "blinking"];

// Aux LED colors (cycle order matches Anduril firmware)
export const AUX_COLORS = [
  "red", "yellow", "green", "cyan", "blue", "magenta", "white", "disco", "rainbow", "voltage",
];

// Hex representation used for the button indicator in the simulator
export const AUX_COLOR_HEX = {
  red:     "#ff3333",
  yellow:  "#ffaa00",
  green:   "#33ff33",
  cyan:    "#00dddd",
  blue:    "#3388ff",
  magenta: "#dd22cc",
  white:   "#ffffff",
  disco:   "#ff44dd",   // representative magenta-pink
  rainbow: "#88ddff",   // representative sky-blue
  voltage: "#9955ee",   // representative purple-full-battery
};

// Colors that cycle during disco / rainbow animations
export const DISCO_CYCLE_HEX = ["#ff3333", "#ffaa00", "#33ff33", "#00dddd", "#3388ff", "#dd22cc"];

// Anduril brightness: levels 1–150
const MAX_LEVEL = 150;
const MIN_LEVEL = 1;
const RAMP_INTERVAL_MS = 17; // ~60fps, 1 level per tick ≈ 2.5s full ramp

// Convert Anduril level (1–150) to a 0–100 percentage for the visual
export function levelToPercent(level) {
  return ((level - 1) / (MAX_LEVEL - 1)) * 100;
}

// States where auxOff settings should be displayed (same as off mode)
const AUX_OFF_STATES = new Set(["OFF", "AUX_PATTERN_CONFIG", "AUX_COLOR_CONFIG"]);

// States where brightness should be preserved on navigation
const RAMP_LIKE_STATES = new Set(["RAMP", "SUNSET_TIMER"]);

export function useStateMachine(initialState = "OFF") {
  const [currentState, setCurrentState] = useState(initialState);
  const [uiMode, setUiMode] = useState("simple"); // "simple" | "full"
  const [lastAction, setLastAction] = useState(null);
  const [history, setHistory] = useState([]);
  const [level, setLevel] = useState(0); // 0 = off, 1-150 = on
  const [rampStyle, setRampStyle] = useState("smooth"); // "smooth" | "stepped"
  const rampTimer = useRef(null);
  const rampDirection = useRef(null); // "up" | "down"

  // Track last-used strobe child so STROBE_GROUP resolves correctly on re-entry
  const lastUsedStrobe = useRef(null);

  // Aux LED state — off mode and lockout mode are configured independently.
  const [auxOff,     setAuxOff]     = useState({ pattern: 2, color: 9 }); // high, voltage
  const [auxLockout, setAuxLockout] = useState({ pattern: 1, color: 0 }); // low,  red

  // Brightness hints mapped to Anduril levels
  const LEVEL_HINTS = {
    moon:    1,
    floor:   1,
    ceiling: 120,
    turbo:   150,
  };

  // Strobe state IDs — track last-used for STROBE_GROUP entry resolution
  const STROBE_IDS = new Set([
    "PARTY_STROBE", "TACTICAL_STROBE", "POLICE_STROBE",
    "LIGHTNING", "CANDLE", "BIKE_FLASHER",
  ]);

  // Perform factory reset side-effects when entering FACTORY_RESET state.
  // The state itself (type STATE) does not auto-return — user must press 1C.
  useEffect(() => {
    if (currentState !== "FACTORY_RESET") return;
    setUiMode("simple");
    setRampStyle("smooth");
    setAuxOff({ pattern: 2, color: 9 });
    setAuxLockout({ pattern: 1, color: 0 });
    // Level is already 0 since FACTORY_RESET.brightness === 0
  }, [currentState]);

  const handleInput = useCallback(
    (input) => {
      const result = processInput(currentState, input, uiMode, lastUsedStrobe.current);
      if (result.action) {
        setHistory((prev) => [
          ...prev.slice(-19),
          {
            from: currentState,
            input,
            to: result.state,
            action: result.action,
            timestamp: Date.now(),
          },
        ]);
        setCurrentState(result.state);
        setLastAction(result.action);

        // Track last-used strobe state for re-entry
        if (STROBE_IDS.has(result.state)) {
          lastUsedStrobe.current = result.state;
        }

        // Switch UI mode if the transition calls for it
        if (result.transition?.setsUiMode) {
          setUiMode(result.transition.setsUiMode);
        }

        // Toggle ramp style (smooth ↔ stepped)
        if (result.transition?.toggleEffect === "rampStyle") {
          setRampStyle((prev) => (prev === "smooth" ? "stepped" : "smooth"));
        }

        // Aux LED pattern/color cycling — affects the mode we were IN, not the target.
        // Also works when already in the AUX_PATTERN_CONFIG / AUX_COLOR_CONFIG states.
        if (result.transition?.auxEffect) {
          const setter = currentState === "LOCKOUT" ? setAuxLockout : setAuxOff;
          if (result.transition.auxEffect === "nextPattern") {
            setter((prev) => ({ ...prev, pattern: (prev.pattern + 1) % AUX_PATTERNS.length }));
          } else if (result.transition.auxEffect === "nextColor") {
            setter((prev) => ({ ...prev, color: (prev.color + 1) % AUX_COLORS.length }));
          }
        }

        // Update brightness level based on transition metadata
        const targetInfo = getStateInfo(result.state);
        if (result.transition?.rampEffect) {
          // Single-press ramp: nudge by 10 levels
          setLevel((prev) => {
            const cur = prev || 75;
            return result.transition.rampEffect === "up"
              ? Math.min(cur + 10, MAX_LEVEL)
              : Math.max(cur - 10, MIN_LEVEL);
          });
        } else if (result.transition?.brightnessHint) {
          setLevel(LEVEL_HINTS[result.transition.brightnessHint] ?? 75);
        } else if (targetInfo?.brightness === 0) {
          setLevel(0);
        } else {
          setLevel((prev) => {
            // Preserve brightness when staying in ramp-like states
            if (RAMP_LIKE_STATES.has(result.state) && prev > 0) return prev;
            return Math.round((targetInfo.brightness / 100) * MAX_LEVEL) || 1;
          });
        }

        // Bump sunset timer to ≥3 min when brightness changes while active
        if (currentState === "SUNSET_TIMER") {
          const ss = sunsetRef.current;
          if (ss.remaining > 0 && ss.remaining < 3 &&
              (result.transition?.rampEffect || result.transition?.brightnessHint)) {
            ss.remaining = 3;
            setSunsetMinutes(3);
          }
        }
      }
      return result;
    },
    [currentState, uiMode]
  );

  // Start continuous ramping (called on hold-start)
  const startRamp = useCallback((direction) => {
    stopRamp();
    rampDirection.current = direction;
    rampTimer.current = setInterval(() => {
      setLevel((prev) => {
        const cur = prev || 75;
        return direction === "up"
          ? Math.min(cur + 1, MAX_LEVEL)
          : Math.max(cur - 1, MIN_LEVEL);
      });
    }, RAMP_INTERVAL_MS);
  }, []);

  // Stop continuous ramping (called on hold-end)
  const stopRamp = useCallback(() => {
    if (rampTimer.current) {
      clearInterval(rampTimer.current);
      rampTimer.current = null;
    }
    rampDirection.current = null;
  }, []);

  // ── Sunset timer ─────────────────────────────────────────────────────────
  // Simulator scale: 1 "minute" = 1 real second so the demo is observable.
  const [sunsetMinutes, setSunsetMinutes] = useState(0);
  const sunsetRef = useRef({ remaining: 0, total: 0, startLevel: 75, intervalId: null });

  const addSunsetMinutes = useCallback((minutes, capturedLevel) => {
    const ss = sunsetRef.current;
    const wasInactive = ss.remaining === 0;
    ss.remaining += minutes;
    ss.total = Math.max(ss.total, ss.remaining);
    if (wasInactive) ss.startLevel = capturedLevel;
    setSunsetMinutes(ss.remaining);
    if (!ss.intervalId) {
      ss.intervalId = setInterval(() => {
        ss.remaining = Math.max(0, ss.remaining - 1);
        if (ss.remaining <= 0) {
          clearInterval(ss.intervalId);
          ss.intervalId = null;
          setSunsetMinutes(0);
          setCurrentState("OFF");
          setLevel(0);
          setLastAction("Sunset timer complete");
        } else {
          const progress = ss.remaining / ss.total;
          setLevel(Math.max(1, Math.round(ss.startLevel * progress)));
          setSunsetMinutes(ss.remaining);
        }
      }, 1000);
    }
  }, []);

  // Clear timer whenever we leave SUNSET_TIMER
  useEffect(() => {
    if (currentState === "SUNSET_TIMER") return;
    const ss = sunsetRef.current;
    if (ss.intervalId) { clearInterval(ss.intervalId); ss.intervalId = null; }
    ss.remaining = 0;
    ss.total = 0;
    setSunsetMinutes(0);
  }, [currentState]);

  const goToState = useCallback(
    (nodeId) => {
      const info = getStateInfo(nodeId);
      if (info) {
        setCurrentState(nodeId);
        setLastAction(`Jumped to ${info.name}`);
        setLevel(info.brightness === 0 ? 0 : Math.round((info.brightness / 100) * MAX_LEVEL) || 1);
        setHistory((prev) => [
          ...prev.slice(-19),
          {
            from: currentState,
            input: "jump",
            to: nodeId,
            action: `Jumped to ${info.name}`,
            timestamp: Date.now(),
          },
        ]);
        if (STROBE_IDS.has(nodeId)) {
          lastUsedStrobe.current = nodeId;
        }
      }
    },
    [currentState]
  );

  const availableTransitions = getAvailableTransitions(currentState, uiMode);
  const stateInfo = getStateInfo(currentState);
  const brightness = level === 0 ? 0 : levelToPercent(level);

  // Resolved aux LED display — active in off-like states and lockout
  const auxDisplay = useMemo(() => {
    const isOffLike = AUX_OFF_STATES.has(currentState);
    if (!isOffLike && currentState !== "LOCKOUT") return null;
    const settings    = currentState === "LOCKOUT" ? auxLockout : auxOff;
    const patternName = AUX_PATTERNS[settings.pattern];
    if (patternName === "off") return { color: null, colorName: null, pattern: "off" };
    const colorName   = AUX_COLORS[settings.color];
    return {
      color:     AUX_COLOR_HEX[colorName],
      colorName,
      pattern:   patternName,
    };
  }, [currentState, auxOff, auxLockout]);

  return {
    currentState,
    stateInfo,
    uiMode,
    setUiMode,
    lastAction,
    brightness,
    level,
    rampStyle,
    availableTransitions,
    handleInput,
    startRamp,
    stopRamp,
    goToState,
    history,
    auxDisplay,
    // Aux settings exposed for state map expanded views
    auxPatternIndex: auxOff.pattern,
    auxColorIndex:   auxOff.color,
    // Sunset timer
    sunsetMinutes,
    addSunsetMinutes,
  };
}
