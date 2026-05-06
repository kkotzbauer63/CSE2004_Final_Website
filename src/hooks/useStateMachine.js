// useStateMachine.js — Thin bridge between the state machine engine and React
import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  processInput,
  getAvailableTransitions,
  getStateInfo,
} from "../stateMachine/engine.js";
import { TRANSITION_KIND } from "../data/constants.js";
import {
  TURBO_STYLE,
  DEFAULT_ADVANCED_CONFIG,
  DEFAULT_SIMPLE_CONFIG,
  computeStepLevels,
} from "../data/flashlightConfig.js";
import { STROBE_MODE_ORDER } from "../utils/strobeModes.js";

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
const RAMP_INTERVAL_MS    = 17;  // ~60fps smooth ramp
const STEPPED_INTERVAL_MS = 500; // 0.5s between steps in stepped mode

// Convert Anduril level (1–150) to a 0–100 percentage for the visual
export function levelToPercent(level) {
  if (level <= 0) return 0;
  const clamped = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, level));
  return 1 + ((clamped - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL)) * 99;
}

// States where auxOff settings should be displayed (same as off mode)
const AUX_OFF_STATES = new Set(["OFF", "AUX_PATTERN_CONFIG", "AUX_COLOR_CONFIG"]);
const AUX_LOCKOUT_STATES = new Set(["LOCKOUT", "LOCKOUT_AUX_PATTERN_CONFIG", "LOCKOUT_AUX_COLOR_CONFIG", "TACTICAL_MODE"]);

// States where brightness should be preserved on navigation
const RAMP_LIKE_STATES = new Set(["RAMP", "SUNSET_TIMER"]);
const TACTICAL_SLOT_IDS = ["TACTICAL_SLOT_1", "TACTICAL_SLOT_2", "TACTICAL_SLOT_3"];
const DEFAULT_TACTICAL_SLOTS = [120, 60, 152];

/** Resolve a brightnessHint string to an Anduril level using the active config. */
function resolveHint(hint, cfg) {
  switch (hint) {
    case "moon":    return MIN_LEVEL;
    case "floor":   return cfg.floorLevel;
    case "ceiling": return cfg.ceilLevel;
    case "turbo":   return cfg.turboLevel;
    default:        return 75;
  }
}

function closestStepLevel(level, cfg) {
  const steps = computeStepLevels(cfg.floorLevel, cfg.ceilLevel, cfg.stepCount);
  return steps.reduce((closest, step) => (
    Math.abs(step - level) < Math.abs(closest - level) ? step : closest
  ), steps[0] ?? cfg.floorLevel);
}

function tacticalSlotIndexFromState(stateId) {
  const index = TACTICAL_SLOT_IDS.indexOf(stateId);
  return index === -1 ? null : index;
}

function tacticalValueToStrobeId(value, lastUsedStrobeId) {
  if (value === 0) return lastUsedStrobeId ?? STROBE_MODE_ORDER[0];
  if (value < 151) return null;
  return STROBE_MODE_ORDER[value - 151] ?? STROBE_MODE_ORDER[STROBE_MODE_ORDER.length - 1];
}

export function useStateMachine(initialState = "OFF") {
  const [currentState, setCurrentState] = useState(initialState);
  const [uiMode, setUiMode] = useState("simple"); // "simple" | "full"
  const [lastAction, setLastAction] = useState(null);
  const [history, setHistory] = useState([]);
  const [level, setLevel] = useState(0); // 0 = off, 1-150 = on
  const [rampStyle, setRampStyle] = useState("smooth"); // "smooth" | "stepped"
  const [tacticalSlots, setTacticalSlots] = useState(() => [...DEFAULT_TACTICAL_SLOTS]);

  // ── Per-UI config state ────────────────────────────────────────────────────
  const [advancedConfig, setAdvancedConfig] = useState(() => ({ ...DEFAULT_ADVANCED_CONFIG }));
  const [simpleConfig,   setSimpleConfig]   = useState(() => ({ ...DEFAULT_SIMPLE_CONFIG }));

  // ── Refs for fresh access inside timers / stable callbacks ────────────────
  const levelRef      = useRef(0);
  const rampStyleRef  = useRef("smooth");
  const tacticalSlotsRef = useRef(DEFAULT_TACTICAL_SLOTS);
  const rampTimer     = useRef(null);
  const rampDirection = useRef(null); // "up" | "down"

  // Active config ref — updated every render so intervals always read fresh values
  const rampBoundsRef = useRef({ ...DEFAULT_SIMPLE_CONFIG });

  // Momentary-state tracking: when a momentary transition fires, store the return point
  const momentaryReturnRef = useRef(null); // { state: string, level: number } | null

  // Memory: level recalled by 1C from OFF. Anduril's default memorized level is mid-ramp.
  const memorizedLevelRef = useRef(75);

  // Track last-used strobe child so STROBE_GROUP resolves correctly on re-entry
  const lastUsedStrobe = useRef(null);

  // ── Keep refs in sync with state (updated in render body, not effects) ────
  levelRef.current     = level;
  rampStyleRef.current = rampStyle;
  tacticalSlotsRef.current = tacticalSlots;
  const _activeCfg     = uiMode === "full" ? advancedConfig : simpleConfig;
  rampBoundsRef.current = _activeCfg;

  // ── Aux LED state ──────────────────────────────────────────────────────────
  const [auxOff,     setAuxOff]     = useState({ pattern: 2, color: 9 }); // high, voltage
  const [auxLockout, setAuxLockout] = useState({ pattern: 1, color: 0 }); // low,  red

  // ── Config update helpers ──────────────────────────────────────────────────
  const updateAdvancedConfig = useCallback((updates) => {
    setAdvancedConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSimpleConfig = useCallback((updates) => {
    setSimpleConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateTacticalSlot = useCallback((slotIndex, value) => {
    setTacticalSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = Math.max(0, Math.min(156, Math.round(value)));
      return next;
    });
  }, []);

  // ── Factory reset side-effects ────────────────────────────────────────────
  useEffect(() => {
    if (currentState !== "FACTORY_RESET") return;
    setUiMode("simple");
    setRampStyle("smooth");
    setAuxOff({ pattern: 2, color: 9 });
    setAuxLockout({ pattern: 1, color: 0 });
    setAdvancedConfig({ ...DEFAULT_ADVANCED_CONFIG });
    setSimpleConfig({ ...DEFAULT_SIMPLE_CONFIG });
    setTacticalSlots([...DEFAULT_TACTICAL_SLOTS]);
    memorizedLevelRef.current = 75;
    const id = setTimeout(() => {
      setCurrentState("OFF");
      setLevel(0);
      setLastAction("Factory reset complete");
    }, 3000);

    return () => clearTimeout(id);
  }, [currentState]);

  // ── Main input handler ────────────────────────────────────────────────────
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

        // Clear momentary return on any explicit navigation away
        if (
          result.transition?.kind === TRANSITION_KIND.NAVIGATE &&
          !result.transition?.momentary
        ) {
          momentaryReturnRef.current = null;
        }

        // Track momentary transitions so stopMomentary can restore state+level
        if (result.transition?.momentary) {
          momentaryReturnRef.current = {
            state: currentState,
            level: levelRef.current,
          };
        }

        // Track last-used strobe state for re-entry
        const STROBE_IDS = new Set([
          "PARTY_STROBE", "TACTICAL_STROBE", "POLICE_STROBE",
          "LIGHTNING", "CANDLE", "BIKE_FLASHER",
        ]);
        if (STROBE_IDS.has(result.state)) {
          lastUsedStrobe.current = result.state;
        }

        // Switch UI mode if the transition calls for it
        if (result.transition?.setsUiMode) {
          setUiMode(result.transition.setsUiMode);
        }

        // Toggle ramp style (smooth ↔ stepped)
        if (result.transition?.toggleEffect === "rampStyle") {
          if (rampStyleRef.current === "smooth") {
            setLevel((cur) => cur > 0 ? closestStepLevel(cur, rampBoundsRef.current) : cur);
            setRampStyle("stepped");
          } else {
            setRampStyle("smooth");
          }
        }

        // Aux LED cycling — affects the mode we were IN, not the target
        if (result.transition?.auxEffect) {
          const setter = result.transition.auxContext === "lockout" || AUX_LOCKOUT_STATES.has(currentState)
            ? setAuxLockout
            : setAuxOff;
          if (result.transition.auxEffect === "nextPattern") {
            setter((prev) => ({ ...prev, pattern: (prev.pattern + 1) % AUX_PATTERNS.length }));
          } else if (result.transition.auxEffect === "nextColor") {
            setter((prev) => ({ ...prev, color: (prev.color + 1) % AUX_COLORS.length }));
          }
        }

        // ── Brightness level update ──────────────────────────────────────
        const cfg         = rampBoundsRef.current;
        const targetInfo  = getStateInfo(result.state);

        // Auto-memory: save level whenever leaving ramp mode
        if (
          cfg.memoryMode === "auto" &&
          RAMP_LIKE_STATES.has(currentState) &&
          result.state !== currentState &&
          !RAMP_LIKE_STATES.has(result.state)
        ) {
          memorizedLevelRef.current = levelRef.current;
        }

        // Manual memory: 10C from RAMP saves current level and switches to manual mode
        if (result.transition?.memoryEffect === "save") {
          memorizedLevelRef.current = levelRef.current;
          if (uiMode === "full") {
            setAdvancedConfig((prev) => ({ ...prev, memoryMode: "manual" }));
          } else {
            setSimpleConfig((prev) => ({ ...prev, memoryMode: "manual" }));
          }
        }

        if (result.transition?.rampEffect) {
          // Stepped mode: skip nudge — startRamp will jump to the first step immediately
          if (rampStyleRef.current !== "stepped") {
            setLevel((prev) => {
              const cur = prev || 75;
              return result.transition.rampEffect === "up"
                ? Math.min(cur + 10, cfg.ceilLevel)
                : Math.max(cur - 10, cfg.floorLevel);
            });
          }
        } else if (result.transition?.tacticalSlot !== undefined) {
          const tacticalValue = tacticalSlotsRef.current[result.transition.tacticalSlot] ?? 0;
          setLevel(tacticalValue >= 1 && tacticalValue <= 150 ? tacticalValue : 75);
        } else if (result.transition?.brightnessHint) {
          let targetLevel = resolveHint(result.transition.brightnessHint, cfg);

          // Turbo-style overrides for specific inputs
          if (input === "2C" && currentState === "RAMP") {
            if (levelRef.current >= cfg.turboLevel) {
              // Already at turbo: toggle back to ceil
              targetLevel = cfg.ceilLevel;
            } else if (cfg.turboStyle === TURBO_STYLE.A1) {
              // A1: always jump to turbo
              targetLevel = cfg.turboLevel;
            } else if (cfg.turboStyle === TURBO_STYLE.A2 && levelRef.current >= cfg.ceilLevel) {
              // A2: at ceil → turbo
              targetLevel = cfg.turboLevel;
            } else {
              targetLevel = cfg.ceilLevel;
            }
          } else if (input === "2C" && currentState === "OFF") {
            // A1: OFF → 2C jumps to turbo; others: go to ceil
            targetLevel = cfg.turboStyle === TURBO_STYLE.A1 ? cfg.turboLevel : cfg.ceilLevel;
          } else if (input === "2H" && currentState === "OFF" && uiMode === "full") {
            // Full UI momentary: turbo normally; no-turbo style → ceil instead
            if (cfg.turboStyle === TURBO_STYLE.NONE) {
              targetLevel = cfg.ceilLevel;
            }
          }

          setLevel(targetLevel);
        } else if (targetInfo?.brightness === 0) {
          setLevel(0);
        } else if (RAMP_LIKE_STATES.has(result.state) && !RAMP_LIKE_STATES.has(currentState)) {
          // Entering ramp from outside (e.g. 1C from OFF): use memorized level
          setLevel(memorizedLevelRef.current ?? cfg.floorLevel);
        } else {
          setLevel((prev) => {
            if (RAMP_LIKE_STATES.has(result.state) && prev > 0) return prev;
            return Math.round((targetInfo.brightness / 100) * MAX_LEVEL) || 1;
          });
        }

        // Bump sunset timer to ≥3 min when brightness changes while active
        if (currentState === "SUNSET_TIMER") {
          const ss = sunsetRef.current;
          if (
            ss.remaining > 0 && ss.remaining < 180 &&
            (result.transition?.rampEffect || result.transition?.brightnessHint)
          ) {
            ss.remaining = 180;
            setSunsetSeconds(180);
          }
        }
      }
      return result;
    },
    [currentState, uiMode]
  );

  // ── Continuous ramping ─────────────────────────────────────────────────────
  const stopRamp = useCallback(() => {
    if (rampTimer.current) {
      clearInterval(rampTimer.current);
      rampTimer.current = null;
    }
    rampDirection.current = null;
  }, []);

  const startRamp = useCallback((direction) => {
    stopRamp();
    rampDirection.current = direction;

    if (rampStyleRef.current === "stepped") {
      // Stepped mode: jump to the next step, then repeat every 500ms
      const doStep = () => {
        setLevel((prev) => {
          const cfg   = rampBoundsRef.current;
          const steps = computeStepLevels(cfg.floorLevel, cfg.ceilLevel, cfg.stepCount);
          const cur   = prev || cfg.floorLevel;
          if (direction === "up") {
            const next = steps.find((s) => s > cur);
            return next !== undefined ? next : cfg.ceilLevel;
          } else {
            const next = [...steps].reverse().find((s) => s < cur);
            return next !== undefined ? next : cfg.floorLevel;
          }
        });
      };
      doStep(); // Immediate first step
      rampTimer.current = setInterval(doStep, STEPPED_INTERVAL_MS);
    } else {
      // Smooth mode: increment by 1 every ~17ms, clamped to floor/ceil
      rampTimer.current = setInterval(() => {
        setLevel((prev) => {
          const cur = prev || 75;
          const cfg = rampBoundsRef.current;
          return direction === "up"
            ? Math.min(cur + 1, cfg.ceilLevel)
            : Math.max(cur - 1, cfg.floorLevel);
        });
      }, RAMP_INTERVAL_MS);
    }
  }, [stopRamp]);

  // ── Momentary-state return ─────────────────────────────────────────────────
  // Called by useButtonInput on hold-end, restoring state+level for momentary transitions.
  const stopMomentary = useCallback(() => {
    if (!momentaryReturnRef.current) return;
    const { state: retState, level: retLevel } = momentaryReturnRef.current;
    momentaryReturnRef.current = null;
    setCurrentState(retState);
    setLevel(retLevel);
  }, []);

  // ── Sunset timer ───────────────────────────────────────────────────────────
  const [sunsetSeconds, setSunsetSeconds] = useState(0);
  const sunsetRef      = useRef({ remaining: 0, total: 0, startLevel: 75, intervalId: null });
  const sunsetSpeedRef = useRef(1);
  const [sunsetSpeedMultiplier, setSunsetSpeedMultiplier] = useState(1);

  const toggleSunsetSpeed = useCallback(() => {
    const next = sunsetSpeedRef.current === 1 ? 10 : 1;
    sunsetSpeedRef.current = next;
    setSunsetSpeedMultiplier(next);
  }, []);

  const addSunsetMinutes = useCallback((minutes, capturedLevel) => {
    const ss = sunsetRef.current;
    const wasInactive = ss.remaining === 0;
    ss.remaining += minutes * 60;
    ss.total = Math.max(ss.total, ss.remaining);
    if (wasInactive) ss.startLevel = capturedLevel;
    setSunsetSeconds(Math.ceil(ss.remaining));
    if (!ss.intervalId) {
      ss.intervalId = setInterval(() => {
        ss.remaining = Math.max(0, ss.remaining - 0.5 * sunsetSpeedRef.current);
        if (ss.remaining <= 0) {
          clearInterval(ss.intervalId);
          ss.intervalId = null;
          setSunsetSeconds(0);
          setCurrentState("OFF");
          setLevel(0);
          setLastAction("Sunset timer complete");
        } else {
          const progress = ss.remaining / ss.total;
          setLevel(Math.max(1, Math.round(ss.startLevel * progress)));
          setSunsetSeconds(Math.ceil(ss.remaining));
        }
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (currentState === "SUNSET_TIMER") return;
    const ss = sunsetRef.current;
    if (ss.intervalId) { clearInterval(ss.intervalId); ss.intervalId = null; }
    ss.remaining = 0;
    ss.total = 0;
    setSunsetSeconds(0);
  }, [currentState]);

  // ── Jump to state (state-map clicks) ──────────────────────────────────────
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
        const STROBE_IDS = new Set([
          "PARTY_STROBE", "TACTICAL_STROBE", "POLICE_STROBE",
          "LIGHTNING", "CANDLE", "BIKE_FLASHER",
        ]);
        if (STROBE_IDS.has(nodeId)) {
          lastUsedStrobe.current = nodeId;
        }
      }
    },
    [currentState]
  );

  const availableTransitions = getAvailableTransitions(currentState, uiMode);
  const stateInfo            = getStateInfo(currentState);
  const brightness           = level === 0 ? 0 : levelToPercent(level);
  const activeTacticalSlotIndex = tacticalSlotIndexFromState(currentState);
  const activeTacticalStrobeId = activeTacticalSlotIndex === null
    ? null
    : tacticalValueToStrobeId(tacticalSlots[activeTacticalSlotIndex], lastUsedStrobe.current);

  // Resolved aux LED display
  const auxDisplay = useMemo(() => {
    const isOffLike = AUX_OFF_STATES.has(currentState);
    const isLockoutLike = AUX_LOCKOUT_STATES.has(currentState);
    if (!isOffLike && !isLockoutLike) return null;
    const settings    = isLockoutLike ? auxLockout : auxOff;
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
    stopMomentary,
    goToState,
    history,
    auxDisplay,
    auxPatternIndex: auxOff.pattern,
    auxColorIndex:   auxOff.color,
    lockoutAuxPatternIndex: auxLockout.pattern,
    lockoutAuxColorIndex:   auxLockout.color,
    // Per-UI config state + updaters
    advancedConfig,
    simpleConfig,
    updateAdvancedConfig,
    updateSimpleConfig,
    tacticalSlots,
    updateTacticalSlot,
    activeTacticalStrobeId,
    // Sunset timer
    sunsetSeconds,
    addSunsetMinutes,
    sunsetSpeedMultiplier,
    toggleSunsetSpeed,
  };
}
