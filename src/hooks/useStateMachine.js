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
const STEPPED_INTERVAL_MS = 500; // 0.5s between steps in stepped mode
const SMOOTH_STEP_SPEED = 6;
const RAMP_REVERSE_WINDOW_MS = 1000;
const SIMULATED_BATTERY_VOLTAGE = 4.16;
const BUTTON_AUX_COLOR = "#D4A84B";

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
const MEMORIZED_BLINKY_STATES = new Set(["BEACON", "SOS"]);
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

function rampIntervalMs(cfg) {
  const floor = Math.max(1, Math.min(MAX_LEVEL, cfg.floorLevel));
  const ceil = Math.max(floor, Math.min(MAX_LEVEL, cfg.ceilLevel));
  const levels = Math.max(1, ceil - floor);
  const durationMs = Math.max(1, Math.min(4, cfg.rampSpeed || 1)) * 2500;
  return Math.max(1, durationMs / levels);
}

function applyRampConfigUpdates(prev, updates) {
  const next = { ...prev };

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;

    if (key === "floorLevel") {
      if (value > next.ceilLevel || value > next.turboLevel) continue;
    } else if (key === "ceilLevel") {
      if (value < next.floorLevel || value > next.turboLevel) continue;
    } else if (key === "turboLevel") {
      if (value < next.floorLevel || value < next.ceilLevel) continue;
    }

    next[key] = value;
  }

  return next;
}

function voltageToAuxColor(voltage) {
  if (voltage < 3.3) return "#ff3333";
  if (voltage < 3.6) return "#ffaa00";
  if (voltage < 3.95) return "#33cc55";
  if (voltage < 4.1) return "#3388ff";
  return "#9955ee";
}

function resolveAuxColor(colorName) {
  return colorName === "voltage"
    ? voltageToAuxColor(SIMULATED_BATTERY_VOLTAGE)
    : AUX_COLOR_HEX[colorName];
}

function buttonAuxPatternForLevel(level, cfg) {
  const lowLevel = Math.max(0, Math.min(MAX_LEVEL, cfg.auxLowRampLevel ?? 1));
  const highLevel = Math.max(0, Math.min(MAX_LEVEL, cfg.auxHighRampLevel ?? 75));

  if (lowLevel <= 0 || level < lowLevel) return "off";
  if (highLevel > 0 && level >= highLevel) return "high";
  return "low";
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
  const [beaconSeconds, setBeaconSeconds] = useState(10);
  const [postOffVoltageActive, setPostOffVoltageActive] = useState(false);

  // ── Per-UI config state ────────────────────────────────────────────────────
  const [advancedConfig, setAdvancedConfig] = useState(() => ({ ...DEFAULT_ADVANCED_CONFIG }));
  const [simpleConfig,   setSimpleConfig]   = useState(() => ({ ...DEFAULT_SIMPLE_CONFIG }));

  // ── Refs for fresh access inside timers / stable callbacks ────────────────
  const levelRef      = useRef(0);
  const rampStyleRef  = useRef("smooth");
  const tacticalSlotsRef = useRef(DEFAULT_TACTICAL_SLOTS);
  const rampTimer     = useRef(null);
  const rampDirection = useRef(null); // "up" | "down"
  const smoothStepTimer = useRef(null);
  const rampStartDelayTimer = useRef(null);
  const lastRampReleaseAt = useRef(0);
  const lastOnLevelRef = useRef(75);
  const previousStateRef = useRef(initialState);
  const postOffVoltageTimer = useRef(null);

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
    setAdvancedConfig((prev) => applyRampConfigUpdates(prev, updates));
  }, []);

  const updateSimpleConfig = useCallback((updates) => {
    setSimpleConfig((prev) => applyRampConfigUpdates(prev, updates));
  }, []);

  const updateTacticalSlot = useCallback((slotIndex, value) => {
    setTacticalSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = Math.max(0, Math.min(156, Math.round(value)));
      return next;
    });
  }, []);

  const updateBeaconSeconds = useCallback((seconds) => {
    const next = Math.max(1, Math.min(255, Math.round(seconds || 1)));
    setBeaconSeconds(next);
    setLastAction(`Beacon interval set to ${next}s`);
  }, []);

  const clearPostOffVoltage = useCallback(() => {
    if (postOffVoltageTimer.current) {
      clearTimeout(postOffVoltageTimer.current);
      postOffVoltageTimer.current = null;
    }
    setPostOffVoltageActive(false);
  }, []);

  const stopSmoothStep = useCallback(() => {
    if (smoothStepTimer.current) {
      clearTimeout(smoothStepTimer.current);
      smoothStepTimer.current = null;
    }
  }, []);

  const setLevelSmooth = useCallback((targetLevel) => {
    stopSmoothStep();
    const target = Math.max(0, Math.min(MAX_LEVEL, Math.round(targetLevel)));
    const cfg = rampBoundsRef.current;

    if (!cfg.smoothSteps) {
      setLevel(target);
      return;
    }

    setLevel((start) => {
      let actual = Math.max(0, Math.min(MAX_LEVEL, Math.round(start)));
      const smoothStart = actual;

      if (actual === target) return target;

      const tick = () => {
        if (actual === target) {
          smoothStepTimer.current = null;
          setLevel(target);
          return;
        }

        if (target > actual) {
          const diff = target - actual;
          actual += Math.max(1, Math.floor(diff / SMOOTH_STEP_SPEED));
          if (actual > target) actual = target;
          setLevel(actual);
          smoothStepTimer.current = setTimeout(tick, 10);
        } else {
          const diff = Math.max(1, smoothStart - target);
          const delay = 1 + (30 * SMOOTH_STEP_SPEED / diff);
          actual -= 1;
          if (actual < target) actual = target;
          setLevel(actual);
          smoothStepTimer.current = setTimeout(tick, delay);
        }
      };

      smoothStepTimer.current = setTimeout(tick, 10);
      return actual;
    });
  }, [stopSmoothStep]);

  // ── Factory reset side-effects ────────────────────────────────────────────
  useEffect(() => {
    if (currentState !== "FACTORY_RESET") return;
    clearPostOffVoltage();
    stopSmoothStep();
    setUiMode("simple");
    setRampStyle("smooth");
    setAuxOff({ pattern: 2, color: 9 });
    setAuxLockout({ pattern: 1, color: 0 });
    setAdvancedConfig({ ...DEFAULT_ADVANCED_CONFIG });
    setSimpleConfig({ ...DEFAULT_SIMPLE_CONFIG });
    setTacticalSlots([...DEFAULT_TACTICAL_SLOTS]);
    setBeaconSeconds(10);
    memorizedLevelRef.current = 75;
    const id = setTimeout(() => {
      setCurrentState("OFF");
      setLevel(0);
      setLastAction("Factory reset complete");
    }, 3000);

    return () => clearTimeout(id);
  }, [clearPostOffVoltage, currentState, stopSmoothStep]);

  useEffect(() => {
    if (currentState !== "OFF" && level > 0) {
      lastOnLevelRef.current = level;
    }
  }, [currentState, level]);

  useEffect(() => {
    const previousState = previousStateRef.current;
    previousStateRef.current = currentState;

    if (currentState !== "OFF") {
      clearPostOffVoltage();
      return;
    }

    const seconds = advancedConfig.postOffVoltageSeconds ?? 4;
    if (previousState === "OFF" || seconds <= 0) {
      clearPostOffVoltage();
      return;
    }

    const pattern = buttonAuxPatternForLevel(lastOnLevelRef.current, advancedConfig);
    if (pattern === "off") {
      clearPostOffVoltage();
      return;
    }

    setPostOffVoltageActive(true);
    if (postOffVoltageTimer.current) clearTimeout(postOffVoltageTimer.current);
    postOffVoltageTimer.current = setTimeout(() => {
      postOffVoltageTimer.current = null;
      setPostOffVoltageActive(false);
    }, seconds * 1000);
  }, [
    advancedConfig.auxHighRampLevel,
    advancedConfig.auxLowRampLevel,
    advancedConfig.postOffVoltageSeconds,
    clearPostOffVoltage,
    currentState,
  ]);

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

        if (result.transition?.beaconEffect) {
          // Beacon timing is configured by holding the physical button.

        } else if (result.transition?.rampEffect && !result.transition?.rampAfterMoon) {
          // Stepped mode: skip nudge — startRamp will jump to the first step immediately
          if (rampStyleRef.current !== "stepped") {
            const requestedDirection = result.transition.rampEffect;
            const shouldReverseUp =
              requestedDirection === "up" &&
              (
                levelRef.current >= cfg.ceilLevel ||
                Date.now() - lastRampReleaseAt.current < RAMP_REVERSE_WINDOW_MS
              );
            const rampEffect = shouldReverseUp ? "down" : requestedDirection;
            stopSmoothStep();
            setLevel((prev) => {
              const cur = prev || 75;
              return rampEffect === "up"
                ? Math.min(cur + 10, cfg.ceilLevel)
                : Math.max(cur - 10, cfg.floorLevel);
            });
          }
        } else if (result.transition?.tacticalSlot !== undefined) {
          const tacticalValue = tacticalSlotsRef.current[result.transition.tacticalSlot] ?? 0;
          setLevelSmooth(tacticalValue >= 1 && tacticalValue <= 150 ? tacticalValue : 75);
        } else if (result.transition?.brightnessHint) {
          let targetLevel = resolveHint(result.transition.brightnessHint, cfg);

          if (input === "1H" && currentState === "LOCKOUT") {
            targetLevel = Math.min(advancedConfig.floorLevel, simpleConfig.floorLevel);

          // Turbo-style overrides for specific inputs
          } else if (input === "2C" && currentState === "RAMP") {
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

          if (result.transition?.rampAfterMoon) {
            stopSmoothStep();
            setLevel(targetLevel);
          } else {
            setLevelSmooth(targetLevel);
          }
        } else if (targetInfo?.brightness === 0) {
          setLevelSmooth(0);
        } else if (MEMORIZED_BLINKY_STATES.has(result.state)) {
          setLevelSmooth(memorizedLevelRef.current ?? cfg.floorLevel);
        } else if (RAMP_LIKE_STATES.has(result.state) && !RAMP_LIKE_STATES.has(currentState)) {
          // Entering ramp from outside (e.g. 1C from OFF): use memorized level
          setLevelSmooth(memorizedLevelRef.current ?? cfg.floorLevel);
        } else {
          stopSmoothStep();
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
    [advancedConfig.floorLevel, currentState, setLevelSmooth, simpleConfig.floorLevel, stopSmoothStep, uiMode]
  );

  // ── Continuous ramping ─────────────────────────────────────────────────────
  const stopRamp = useCallback((recordRelease = true) => {
    if (rampStartDelayTimer.current) {
      clearTimeout(rampStartDelayTimer.current);
      rampStartDelayTimer.current = null;
    }
    if (rampTimer.current) {
      clearInterval(rampTimer.current);
      rampTimer.current = null;
    }
    stopSmoothStep();
    rampDirection.current = null;
    if (recordRelease) {
      lastRampReleaseAt.current = Date.now();
    }
  }, [stopSmoothStep]);

  const startRamp = useCallback((direction, transition = {}) => {
    stopRamp(false);

    if (transition.rampAfterMoon && !rampBoundsRef.current.rampAfterMoon) {
      return;
    }

    const begin = () => {
      rampStartDelayTimer.current = null;
      const cfg = rampBoundsRef.current;
      const shouldReverseFromCeiling = levelRef.current >= cfg.ceilLevel;
      const shouldReverseFromRecentRelease =
        !transition.rampAfterMoon && Date.now() - lastRampReleaseAt.current < RAMP_REVERSE_WINDOW_MS;
      const activeDirection =
        direction === "up" && (shouldReverseFromCeiling || shouldReverseFromRecentRelease)
          ? "down"
          : direction;
      rampDirection.current = activeDirection;

      if (rampStyleRef.current === "stepped") {
        // Stepped mode: jump to the next step, then repeat every 500ms
        const doStep = () => {
          const stepCfg = rampBoundsRef.current;
          const steps = computeStepLevels(stepCfg.floorLevel, stepCfg.ceilLevel, stepCfg.stepCount);
          const cur = levelRef.current || stepCfg.floorLevel;
          const next = activeDirection === "up"
            ? steps.find((s) => s > cur)
            : [...steps].reverse().find((s) => s < cur);
          setLevelSmooth(next !== undefined ? next : activeDirection === "up" ? stepCfg.ceilLevel : stepCfg.floorLevel);
        };
        doStep(); // Immediate first step
        rampTimer.current = setInterval(doStep, STEPPED_INTERVAL_MS);
      } else {
        // Smooth mode: configured full-range duration from floor to ceiling.
        rampTimer.current = setInterval(() => {
          setLevel((prev) => {
            const cur = prev || 75;
            const smoothCfg = rampBoundsRef.current;
            return activeDirection === "up"
              ? Math.min(cur + 1, smoothCfg.ceilLevel)
              : Math.max(cur - 1, smoothCfg.floorLevel);
          });
        }, rampIntervalMs(rampBoundsRef.current));
      }
    };

    const delayMs = Math.max(0, transition.rampDelayMs || 0);
    if (delayMs > 0) {
      rampStartDelayTimer.current = setTimeout(begin, delayMs);
    } else {
      begin();
    }
  }, [setLevelSmooth, stopRamp]);

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
        const targetLevel = MEMORIZED_BLINKY_STATES.has(nodeId)
          ? (memorizedLevelRef.current ?? rampBoundsRef.current.floorLevel)
          : info.brightness === 0 ? 0 : Math.round((info.brightness / 100) * MAX_LEVEL) || 1;
        if (info.brightness === 0) {
          setLevelSmooth(0);
        } else {
          setLevelSmooth(targetLevel);
        }
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
    [currentState, setLevelSmooth, stopSmoothStep]
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

    if (currentState === "OFF" && postOffVoltageActive) {
      const pattern = buttonAuxPatternForLevel(lastOnLevelRef.current, advancedConfig);
      return {
        color: resolveAuxColor("voltage"),
        colorName: "voltage",
        pattern,
      };
    }

    const settings    = isLockoutLike ? auxLockout : auxOff;
    const patternName = AUX_PATTERNS[settings.pattern];
    if (patternName === "off") return { color: null, colorName: null, pattern: "off" };
    const colorName   = AUX_COLORS[settings.color];
    return {
      color:     resolveAuxColor(colorName),
      colorName,
      pattern:   patternName,
    };
  }, [
    advancedConfig,
    auxOff,
    auxLockout,
    currentState,
    postOffVoltageActive,
  ]);

  const buttonAuxDisplay = useMemo(() => {
    if (level <= 0) return null;
    const pattern = buttonAuxPatternForLevel(level, advancedConfig);
    if (pattern === "off") return null;
    return {
      color: BUTTON_AUX_COLOR,
      colorName: "button",
      pattern,
    };
  }, [advancedConfig, level]);

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
    buttonAuxDisplay,
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
    beaconSeconds,
    updateBeaconSeconds,
    // Sunset timer
    sunsetSeconds,
    addSunsetMinutes,
    sunsetSpeedMultiplier,
    toggleSunsetSpeed,
  };
}
