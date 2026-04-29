// useStateMachine.js — Thin bridge between the state machine engine and React
import { useState, useCallback, useRef, useMemo } from "react";
import {
  processInput,
  getAvailableTransitions,
  getStateInfo,
} from "../stateMachine/engine.js";

// Aux LED patterns (cycle order matches Anduril firmware)
export const AUX_PATTERNS = ["off", "low", "high", "blinking"];

// Aux LED colors (cycle order matches Anduril firmware)
export const AUX_COLORS = [
  "red", "yellow", "green", "cyan", "blue", "purple", "white", "disco", "rainbow", "voltage",
];

// Hex representation used for the button indicator in the simulator
const AUX_COLOR_HEX = {
  red:     "#ff3333",
  yellow:  "#ffaa00",
  green:   "#33ff33",
  cyan:    "#00dddd",
  blue:    "#3388ff",
  purple:  "#cc44ff",
  white:   "#ffffff",
  disco:   "#ff88dd",   // magenta-ish representative
  rainbow: "#88ddff",   // sky-blue representative
  voltage: "#9955ee",   // purple = full-battery representative
};

// Anduril brightness: levels 1–150
// Full ramp takes ~2.5s → 150 levels / 2500ms = 1 level per ~16.7ms
const MAX_LEVEL = 150;
const MIN_LEVEL = 1;
const RAMP_INTERVAL_MS = 17; // ~60fps, 1 level per tick ≈ 2.5s full ramp

// Convert Anduril level (1-150) to a 0-100 percentage for the visual
export function levelToPercent(level) {
  return ((level - 1) / (MAX_LEVEL - 1)) * 100;
}

export function useStateMachine(initialState = "off") {
  const [currentState, setCurrentState] = useState(initialState);
  const [uiMode, setUiMode] = useState("simple"); // "simple" or "full"
  const [lastAction, setLastAction] = useState(null);
  const [history, setHistory] = useState([]);
  const [level, setLevel] = useState(0); // 0 = off, 1-150 = on
  const rampTimer = useRef(null);
  const rampDirection = useRef(null); // "up" or "down"

  // Aux LED state — off mode and lockout mode are configured independently.
  // Defaults match common Anduril out-of-box settings.
  const [auxOff,     setAuxOff]     = useState({ pattern: 2, color: 9 }); // high, voltage
  const [auxLockout, setAuxLockout] = useState({ pattern: 1, color: 0 }); // low,  red

  // Brightness hints mapped to Anduril levels
  const LEVEL_HINTS = {
    moon: 1,
    floor: 1,
    ceiling: 120,
    turbo: 150,
  };

  const handleInput = useCallback(
    (input) => {
      const result = processInput(currentState, input, uiMode);
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

        // Switch UI mode if the transition calls for it
        if (result.transition?.setsUiMode) {
          setUiMode(result.transition.setsUiMode);
        }

        // Aux LED pattern/color cycling — affects the mode we were IN, not the target
        if (result.transition?.auxEffect) {
          const setter = currentState === "lockout" ? setAuxLockout : setAuxOff;
          if (result.transition.auxEffect === "nextPattern") {
            setter((prev) => ({ ...prev, pattern: (prev.pattern + 1) % AUX_PATTERNS.length }));
          } else if (result.transition.auxEffect === "nextColor") {
            setter((prev) => ({ ...prev, color: (prev.color + 1) % AUX_COLORS.length }));
          }
        }

        // Update level based on transition type
        const targetInfo = getStateInfo(result.state);
        if (result.transition?.rampEffect) {
          // Single-press ramp: nudge by 10 levels
          setLevel((prev) => {
            const cur = prev || 75; // if was off, start mid
            if (result.transition.rampEffect === "up") {
              return Math.min(cur + 10, MAX_LEVEL);
            } else {
              return Math.max(cur - 10, MIN_LEVEL);
            }
          });
        } else if (result.transition?.brightnessHint) {
          setLevel(LEVEL_HINTS[result.transition.brightnessHint] ?? 75);
        } else if (targetInfo.brightness === 0) {
          setLevel(0);
        } else {
          // Map the state's default brightness (0-100) to a level
          setLevel((prev) => {
            // If already on and staying in ramp, keep current level
            if (result.state === "ramp" && prev > 0) return prev;
            return Math.round((targetInfo.brightness / 100) * MAX_LEVEL) || 1;
          });
        }
      }
      return result;
    },
    [currentState, uiMode]
  );

  // Start continuous ramping (called on hold-start)
  const startRamp = useCallback(
    (direction) => {
      stopRamp();
      rampDirection.current = direction;
      rampTimer.current = setInterval(() => {
        setLevel((prev) => {
          const cur = prev || 75;
          if (rampDirection.current === "up") {
            return Math.min(cur + 1, MAX_LEVEL);
          } else {
            return Math.max(cur - 1, MIN_LEVEL);
          }
        });
      }, RAMP_INTERVAL_MS);
    },
    []
  );

  // Stop continuous ramping (called on hold-end)
  const stopRamp = useCallback(() => {
    if (rampTimer.current) {
      clearInterval(rampTimer.current);
      rampTimer.current = null;
    }
    rampDirection.current = null;
  }, []);

  const goToState = useCallback(
    (stateId) => {
      const info = getStateInfo(stateId);
      if (info) {
        setCurrentState(stateId);
        setLastAction(`Jumped to ${info.name}`);
        setLevel(info.brightness === 0 ? 0 : Math.round((info.brightness / 100) * MAX_LEVEL) || 1);
        setHistory((prev) => [
          ...prev.slice(-19),
          {
            from: currentState,
            input: "jump",
            to: stateId,
            action: `Jumped to ${info.name}`,
            timestamp: Date.now(),
          },
        ]);
      }
    },
    [currentState]
  );

  const availableTransitions = getAvailableTransitions(currentState, uiMode);
  const stateInfo = getStateInfo(currentState);
  const brightness = level === 0 ? 0 : levelToPercent(level);

  // Resolved aux LED display for the current state.
  // Only active when main emitters are off (off/lockout modes).
  const auxDisplay = useMemo(() => {
    if (currentState !== "off" && currentState !== "lockout") return null;
    const settings    = currentState === "lockout" ? auxLockout : auxOff;
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
    availableTransitions,
    handleInput,
    startRamp,
    stopRamp,
    goToState,
    history,
    auxDisplay,
  };
}
