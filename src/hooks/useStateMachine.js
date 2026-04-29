// useStateMachine.js — Thin bridge between the state machine engine and React
import { useState, useCallback, useRef } from "react";
import {
  processInput,
  getAvailableTransitions,
  getStateInfo,
} from "../stateMachine/engine.js";

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
  };
}
