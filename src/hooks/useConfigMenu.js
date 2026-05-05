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
  const blinkTimerRef  = useRef(null);   // timeout for the option presentation flash
  const presentTimerRef = useRef(null);  // auto-advance timeout between option flashes
  const buzzTimerRef   = useRef(null);   // timeout chain for the accepting-phase buzz
  const holdTimerRef   = useRef(null);   // 500 ms hold-detection timer
  const holdVisualTimerRef = useRef(null); // switches value entry from buzz to off while held
  const holdRepeatTimerRef = useRef(null); // repeat +10 timer while held in value entry
  const inputTimerRef  = useRef(null);   // 3 s inactivity timer in ACCEPTING
  const isHeldRef      = useRef(false);  // true after hold threshold crossed
  const buzzHighRef    = useRef(true);   // alternates hi/lo each buzz tick
  const addTenFlashTimerRef = useRef(null);

  // ── Animation helpers ─────────────────────────────────────────────────────

  const stopBuzz = useCallback(() => {
    clearTimeout(buzzTimerRef.current);
    buzzTimerRef.current = null;
    clearTimeout(addTenFlashTimerRef.current);
    addTenFlashTimerRef.current = null;
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
    clearTimeout(holdVisualTimerRef.current);
    clearTimeout(holdRepeatTimerRef.current);
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
  function startPresenting(session) {
    clearTimeout(blinkTimerRef.current);
    clearTimeout(presentTimerRef.current);
    clearTimeout(holdTimerRef.current);
    clearTimeout(holdVisualTimerRef.current);
    clearTimeout(holdRepeatTimerRef.current);
    stopBuzz();

    setPhase(CM_PHASE.PRESENTING);
    setItemIndex(session.itemIndex);
    setCurrentValue(0);

    // One quick flash per option. Clicking during the following gap selects it.
    setConfigLevel(CM_LEVEL.BLINK);

    blinkTimerRef.current = setTimeout(() => {
      if (sessionRef.current?.phase !== CM_PHASE.PRESENTING) return;
      setConfigLevel(CM_LEVEL.ITEM);
      blinkTimerRef.current = null;

      const gap = session.itemIndex === 0 ? CM_TIMING.FIRST_BLINK_GAP : CM_TIMING.BLINK_GAP;
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
      }, gap);
    }, CM_TIMING.BLINK_ON);
  }

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
      finish();
    }, CM_TIMING.INPUT_TIMEOUT);
  }, [finish]);

  /** Switch from PRESENTING to ACCEPTING for the current item. */
  const startAccepting = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;
    // User chose this option — cancel the presentation timers.
    clearTimeout(blinkTimerRef.current);
    clearTimeout(presentTimerRef.current);
    s.enterItem();
    isHeldRef.current = false;
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
    clearTimeout(holdVisualTimerRef.current);
    clearTimeout(holdRepeatTimerRef.current);
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

    // Reset held flag for this new press.
    isHeldRef.current = false;
    clearTimeout(holdTimerRef.current);
    clearTimeout(holdVisualTimerRef.current);
    clearTimeout(holdRepeatTimerRef.current);

    if (s.phase === CM_PHASE.PRESENTING) {
      // Freeze the current option while the click is in progress.
      clearTimeout(presentTimerRef.current);

    } else if (s.phase === CM_PHASE.ACCEPTING) {
      const addTen = () => {
        const active = sessionRef.current;
        if (!active || active.phase !== CM_PHASE.ACCEPTING) return;
        isHeldRef.current = true;
        active.addValue(10);
        setCurrentValue(active.value);
        stopBuzz();
        setConfigLevel(CM_LEVEL.BLINK);
        addTenFlashTimerRef.current = setTimeout(() => {
          if (sessionRef.current?.phase === CM_PHASE.ACCEPTING && isHeldRef.current) {
            setConfigLevel(CM_LEVEL.OFF);
          }
        }, CM_TIMING.BLINK_ON);
        resetInputTimeout();
        holdRepeatTimerRef.current = setTimeout(addTen, CM_TIMING.HOLD_REPEAT);
      };

      holdVisualTimerRef.current = setTimeout(() => {
        if (sessionRef.current?.phase !== CM_PHASE.ACCEPTING) return;
        isHeldRef.current = true;
        stopBuzz();
        setConfigLevel(CM_LEVEL.OFF);
      }, CM_TIMING.HOLD_THRESHOLD);
      holdTimerRef.current = setTimeout(addTen, CM_TIMING.HOLD_REPEAT);
    }
  }, [resetInputTimeout, stopBuzz]);

  /**
   * Call on pointerup / touchend / pointerleave while the config menu is active.
   */
  const onRelease = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;

    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
    clearTimeout(holdVisualTimerRef.current);
    holdVisualTimerRef.current = null;
    clearTimeout(holdRepeatTimerRef.current);
    holdRepeatTimerRef.current = null;

    if (s.phase === CM_PHASE.PRESENTING) {
      // Releasing the held button selects the currently flashed option.
      startAccepting();

    } else if (s.phase === CM_PHASE.ACCEPTING) {
      if (!isHeldRef.current) {
        // Quick release (hold timer didn't fire) → +1
        s.addValue(1);
        setCurrentValue(s.value);
        resetInputTimeout();
      } else {
        startBuzz();
        resetInputTimeout();
      }
      isHeldRef.current = false;
    }
  }, [startAccepting, resetInputTimeout, startBuzz]);

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
