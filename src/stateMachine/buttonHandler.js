// buttonHandler.js — Pure JS button timing logic (no React)
//
// Resolves physical button press/release events into Anduril input notation:
//   nC  = n consecutive short presses
//   nH  = (n-1) short presses then a hold
//
// Timing constants match real Anduril firmware defaults:
//   HOLD_THRESHOLD:  500ms — if still held after this, it's a "hold"
//   CLICK_SPACING:   300ms — if no new press within this after release, sequence is done

const HOLD_THRESHOLD_MS = 500;
const CLICK_SPACING_MS = 300;

/**
 * Creates a stateful button handler instance.
 *
 * @param {Object} callbacks
 * @param {function(string)} callbacks.onInput        — called with resolved input string ("2C", "1H", etc.)
 * @param {function()}       callbacks.onHoldEnd      — called when button is released after a hold
 * @param {function(Object)} callbacks.onPendingUpdate — called with { clickCount, isDown, holdDetected }
 *                                                       for live UI feedback during input building
 */
export function createButtonHandler({ onInput, onHoldEnd, onPendingUpdate }) {
  let clickCount = 0;       // completed short presses in current sequence
  let isHeld = false;       // true while a hold is active (threshold already crossed)
  let holdTimer = null;     // fires after HOLD_THRESHOLD_MS to detect a hold
  let sequenceTimer = null; // fires after CLICK_SPACING_MS to resolve a click sequence

  function emitPending(isDown, holdDetected) {
    onPendingUpdate?.({ clickCount, isDown, holdDetected });
  }

  function handlePress() {
    // A new press cancels any running sequence timer (still building the sequence)
    if (sequenceTimer) {
      clearTimeout(sequenceTimer);
      sequenceTimer = null;
    }

    isHeld = false;
    emitPending(true, false);

    // After HOLD_THRESHOLD_MS, this press counts as a hold
    holdTimer = setTimeout(() => {
      isHeld = true;
      const n = clickCount + 1; // completed clicks + this held press = nH
      emitPending(true, true);
      onInput?.(`${n}H`);
    }, HOLD_THRESHOLD_MS);
  }

  function handleRelease() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }

    if (isHeld) {
      // Button was held past threshold and then released — end of hold
      isHeld = false;
      clickCount = 0;
      onHoldEnd?.();
      emitPending(false, false);
      return;
    }

    // Short press — register as a completed click
    clickCount++;
    emitPending(false, false);

    // Wait CLICK_SPACING_MS for another press; if none comes, resolve the sequence
    sequenceTimer = setTimeout(() => {
      const n = clickCount;
      clickCount = 0;
      emitPending(false, false);
      onInput?.(n >= 15 ? '15+C' : `${n}C`);
    }, CLICK_SPACING_MS);
  }

  // Cancel all in-flight timers and reset state (e.g. pointer left the button)
  function cancel() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    if (sequenceTimer) {
      clearTimeout(sequenceTimer);
      sequenceTimer = null;
    }
    if (isHeld) {
      onHoldEnd?.();
    }
    isHeld = false;
    clickCount = 0;
    emitPending(false, false);
  }

  return { handlePress, handleRelease, cancel };
}
