// useButtonInput.js — React hook that bridges the button handler to the state machine
import { useRef, useCallback, useState } from 'react';
import { createButtonHandler } from '../stateMachine/buttonHandler.js';

/**
 * Wires up physical button press/release events to the state machine.
 *
 * @param {Object} params
 * @param {function} params.handleInput  — from useStateMachine
 * @param {function} params.startRamp    — from useStateMachine
 * @param {function} params.stopRamp     — from useStateMachine
 *
 * @returns {{
 *   buttonHandlers: { onPointerDown, onPointerUp, onPointerLeave },
 *   isButtonPressed: boolean,
 *   pendingInput: { clickCount: number, isDown: boolean, holdDetected: boolean }
 * }}
 */
export function useButtonInput({ handleInput, startRamp, stopRamp }) {
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [pendingInput, setPendingInput] = useState({
    clickCount: 0,
    isDown: false,
    holdDetected: false,
  });

  // Stable refs so the button handler (created once) always reads the latest callbacks
  const handleInputRef = useRef(handleInput);
  handleInputRef.current = handleInput;
  const startRampRef = useRef(startRamp);
  startRampRef.current = startRamp;
  const stopRampRef = useRef(stopRamp);
  stopRampRef.current = stopRamp;

  // Create the handler exactly once for the lifetime of this hook instance
  const handler = useRef(null);
  if (!handler.current) {
    handler.current = createButtonHandler({
      onInput: (inputStr) => {
        const result = handleInputRef.current(inputStr);
        // If the matched transition has a ramp direction, start continuous ramping
        if (result?.transition?.rampEffect) {
          startRampRef.current(result.transition.rampEffect);
        }
      },
      onHoldEnd: () => {
        stopRampRef.current();
      },
      onPendingUpdate: (pending) => {
        setPendingInput(pending);
      },
    });
  }

  // Track pressed state in a ref too so pointer-leave logic doesn't need stale closure
  const isPressedRef = useRef(false);

  const onPointerDown = useCallback((e) => {
    e.preventDefault(); // prevent drag, text selection, context menu on long-press
    isPressedRef.current = true;
    setIsButtonPressed(true);
    handler.current.handlePress();
  }, []);

  const onPointerUp = useCallback((e) => {
    e.preventDefault();
    if (!isPressedRef.current) return;
    isPressedRef.current = false;
    setIsButtonPressed(false);
    handler.current.handleRelease();
  }, []);

  // If the pointer leaves the button area while pressed, treat as a cancel
  // (avoids stuck-pressed state if user slides off)
  const onPointerLeave = useCallback(() => {
    if (!isPressedRef.current) return;
    isPressedRef.current = false;
    setIsButtonPressed(false);
    handler.current.cancel();
  }, []);

  return {
    buttonHandlers: { onPointerDown, onPointerUp, onPointerLeave },
    isButtonPressed,
    pendingInput,
  };
}
