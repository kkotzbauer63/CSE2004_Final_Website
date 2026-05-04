/**
 * useConfigMenu — React hook that drives an Anduril config menu interaction.
 *
 * Manages the blink/buzz animations, hold-detection, value accumulation, and
 * inactivity timeout.  Callers route raw button press/release events here
 * while a config menu state is active; the hook handles all timing internally.
 *
 * Usage in App.jsx:
 *
 *   const {
 *     configLevel, isActive, phase, itemIndex, currentValue,
 *     start, onPress, onRelease,
 *   } = useConfigMenu();
 *
 *   // When entering a config menu state (e.g. VOLTAGE_CONFIG):
 *   start(itemCount, (results) => goToState(node.returnsTo), isButtonAlreadyHeld);
 *
 *   // Route raw button events here (instead of the normal state machine):
 *   const handlers = isActive
 *     ? { onPointerDown: onPress, onPointerUp: onRelease, onPointerLeave: onRelease }
 *     : normalHandlers;
 *
 * configLevel     — current brightness level (CM_LEVEL value or null when idle)
 * isActive        — true while a menu session is running
 * phase           — current CM_PHASE value
 * itemIndex       — 0-based index of the item being presented / accepted
 * currentValue    — accumulated value for the current item
 */

import { useState, useRef, useCallback } from 'react';
import { createConfigSession, CM_PHASE, CM_LEVEL, CM_TIMING } from '../utils/configMenuEngine.js';

export function useConfigMenu() {
  const [configLevel,  setConfigLevel]  = useState(null);
  const [phase,        setPhase]        = useState(CM_PHASE.IDLE);
  const [itemIndex,    setItemIndex]    = useState(0);
  const [currentValue, setCurrentValue] = useState(0);

  // All mutable state lives in refs so stable [] callbacks always see fresh values.
  const sessionRef     = useRef(null);   // current ConfigSession
  const onCompleteRef  = useRef(null);   // callback for when the menu finishes
  const blinkTimerRef  = useRef(null);   // timeouts for the item presentation blink
  const presentTimerRef = useRef(null);  // auto-skip timeout while held at ITEM level
  const buzzTimerRef   = useRef(null);   // timeout chain for the accepting-phase buzz
  const holdTimerRef   = useRef(null);   // 500 ms hold-detection timer
  const inputTimerRef  = useRef(null);   // 3 s inactivity timer in ACCEPTING
  const isHeldRef      = useRef(false);  // true after hold threshold crossed
  const buzzHighRef    = useRef(true);   // alternates hi/lo each buzz tick

  // ── Animation helpers ─────────────────────────────────────────────────────

  const stopBuzz = useCallback(() => {
    clearTimeout(buzzTimerRef.current);
    buzzTimerRef.current = null;
  }, []);

  const startBuzz = useCallback(() => {
    stopBuzz();
    buzzHighRef.current = true;

    function tick() {
      if (sessionRef.current?.phase !== CM_PHASE.ACCEPTING) return;
      setConfigLevel(buzzHighRef.current ? CM_LEVEL.BUZZ_HI : CM_LEVEL.BUZZ_LO);
      buzzHighRef.current = !buzzHighRef.current;
      buzzTimerRef.current = setTimeout(tick, CM_TIMING.BUZZ_HALF);
    }

    tick();
  }, [stopBuzz]);

  // ── Phase transitions ─────────────────────────────────────────────────────

  /** Tear down the session and invoke the onComplete callback. */
  const finish = useCallback(() => {
    clearTimeout(holdTimerRef.current);
    clearTimeout(inputTimerRef.current);
    clearTimeout(blinkTimerRef.current);
    clearTimeout(presentTimerRef.current);
    stopBuzz();
    const results = sessionRef.current?.results ?? [];
    sessionRef.current = null;
    isHeldRef.current = false;
    setConfigLevel(null);
    setPhase(CM_PHASE.IDLE);
    onCompleteRef.current?.(results);
  }, [stopBuzz]);

  /**
   * Show the item presentation blink for `session`, then hold at ITEM level.
   * After PRESENT_TIMEOUT ms of inactivity at ITEM level, auto-skips the item.
   * Called when starting the menu, skipping an item, or after confirming a value.
   */
  const startPresenting = useCallback((session) => {
    clearTimeout(blinkTimerRef.current);
    clearTimeout(presentTimerRef.current);
    stopBuzz();

    setPhase(CM_PHASE.PRESENTING);
    setItemIndex(session.itemIndex);
    setCurrentValue(0);

    // Blink: BLINK level → brief off → ITEM level
    setConfigLevel(CM_LEVEL.BLINK);

    blinkTimerRef.current = setTimeout(() => {
      if (sessionRef.current?.phase !== CM_PHASE.PRESENTING) return;
      setConfigLevel(CM_LEVEL.OFF);

      blinkTimerRef.current = setTimeout(() => {
        if (sessionRef.current?.phase !== CM_PHASE.PRESENTING) return;
        setConfigLevel(CM_LEVEL.ITEM);
        blinkTimerRef.current = null;

        // After the blink settles, start the idle timeout.
        // If the user doesn't interact within PRESENT_TIMEOUT ms, auto-skip
        // this item and advance — or exit the menu if it was the last item.
        presentTimerRef.current = setTimeout(() => {
          const s = sessionRef.current;
          if (!s || s.phase !== CM_PHASE.PRESENTING) return;
          s.skip();
          setItemIndex(s.itemIndex);
          if (s.isDone()) {
            finish();
          } else {
            startPresenting(s);
          }
        }, CM_TIMING.PRESENT_TIMEOUT);
      }, CM_TIMING.BLINK_OFF);
    }, CM_TIMING.BLINK_ON);
  }, [stopBuzz, finish]);

  /**
   * Arm the 3-second inactivity timer.  Resets each time the user inputs.
   * When it fires, confirms the current value and advances.
   */
  const resetInputTimeout = useCallback(() => {
    clearTimeout(inputTimerRef.current);
    inputTimerRef.current = setTimeout(() => {
      const s = sessionRef.current;
      if (!s || s.phase !== CM_PHASE.ACCEPTING) return;
      s.confirm();
      if (s.isDone()) {
        finish();
      } else {
        stopBuzz();
        startPresenting(s);
      }
    }, CM_TIMING.INPUT_TIMEOUT);
  }, [finish, stopBuzz, startPresenting]);

  /** Switch from PRESENTING to ACCEPTING for the current item. */
  const startAccepting = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;
    // User chose to enter a value — cancel the auto-skip timer
    clearTimeout(presentTimerRef.current);
    s.enterItem();
    setPhase(CM_PHASE.ACCEPTING);
    startBuzz();
    resetInputTimeout();
  }, [startBuzz, resetInputTimeout]);

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Begin a config menu session.
   *
   * @param {number}   itemCount
   *   Number of configurable options in this menu.
   * @param {function} onComplete
   *   Called with the results array when the menu exits.
   *   Each element is either { itemIndex, value } or { itemIndex, skipped: true }.
   * @param {boolean}  [buttonAlreadyHeld=false]
   *   Pass true when entering the menu via a hold action (e.g. 7H) so that
   *   the ongoing hold is correctly treated as a potential skip of item 0.
   */
  const start = useCallback((itemCount, onComplete, buttonAlreadyHeld = false) => {
    clearTimeout(holdTimerRef.current);
    clearTimeout(inputTimerRef.current);
    clearTimeout(presentTimerRef.current);
    stopBuzz();

    onCompleteRef.current = onComplete;
    isHeldRef.current = buttonAlreadyHeld;
    const session = createConfigSession(itemCount);
    sessionRef.current = session;

    startPresenting(session);
  }, [stopBuzz, startPresenting]);

  /**
   * Call on pointerdown / touchstart while the config menu is active.
   */
  const onPress = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;

    // User is interacting — cancel the auto-skip timer for this item
    clearTimeout(presentTimerRef.current);

    // Reset held flag for this new press
    isHeldRef.current = false;
    clearTimeout(holdTimerRef.current);

    if (s.phase === CM_PHASE.PRESENTING) {
      // Hold threshold: user wants to skip this item
      holdTimerRef.current = setTimeout(() => {
        isHeldRef.current = true;
        // No visual change here — just mark skip intent; acted on release
      }, CM_TIMING.HOLD_THRESHOLD);

    } else if (s.phase === CM_PHASE.ACCEPTING) {
      // Hold threshold: user is entering +10
      holdTimerRef.current = setTimeout(() => {
        isHeldRef.current = true;
        s.addValue(10);
        setCurrentValue(s.value);
        resetInputTimeout();
      }, CM_TIMING.HOLD_THRESHOLD);
    }
  }, [resetInputTimeout]);

  /**
   * Call on pointerup / touchend / pointerleave while the config menu is active.
   */
  const onRelease = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;

    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;

    if (s.phase === CM_PHASE.PRESENTING) {
      if (isHeldRef.current) {
        // Held past threshold → skip this item
        isHeldRef.current = false;
        s.skip();
        setItemIndex(s.itemIndex);
        if (s.isDone()) {
          finish();
        } else {
          startPresenting(s);
        }
      } else {
        // Quick release → enter value for this item
        startAccepting();
      }

    } else if (s.phase === CM_PHASE.ACCEPTING) {
      if (!isHeldRef.current) {
        // Quick release (hold timer didn't fire) → +1
        s.addValue(1);
        setCurrentValue(s.value);
        resetInputTimeout();
      }
      isHeldRef.current = false;
    }
  }, [finish, startPresenting, startAccepting, resetInputTimeout]);

  return {
    configLevel,
    isActive: phase !== CM_PHASE.IDLE,
    phase,
    itemIndex,
    currentValue,
    start,
    onPress,
    onRelease,
  };
}
