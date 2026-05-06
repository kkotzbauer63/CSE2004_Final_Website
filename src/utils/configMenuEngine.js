/**
 * configMenuEngine.js — Pure JS state machine for Anduril-style config menus.
 *
 * Every Anduril config menu follows the same interaction pattern regardless of
 * which settings it controls:
 *
 *   For each menu item:
 *     1. PRESENTING — Light flashes once at level 90 for each option.
 *        • User releases the held button or clicks → select the currently indicated option.
 *        • If the user does not click, the menu advances to the next option.
 *     2. ACCEPTING  — Light buzzes between level 20 and level 90.
 *        • Click (<500 ms)        → add 1 to accumulated value.
 *        • Hold                  → light goes off and adds 10 once per second, flashing at level 90 for each +10.
 *        • No input for 3 s       → confirm value and exit to the previous state.
 *
 * This module is framework-free.  It provides:
 *   • CM_PHASE    — phase name constants
 *   • CM_LEVEL    — brightness levels (Anduril 1–150 scale)
 *   • CM_TIMING   — all durations in ms
 *   • createConfigSession(itemCount) — a pure state tracker; no timers, no React
 *
 * Different config menus can call createConfigSession with their item count
 * and drive it via the returned session object.  The companion hook
 * useConfigMenu wraps this in React for animation and event handling.
 */

// ── Phase constants ───────────────────────────────────────────────────────────
export const CM_PHASE = Object.freeze({
  IDLE:       'idle',        // not currently in a config menu
  PRESENTING: 'presenting',  // showing item blink+steady; awaiting skip or enter decision
  ACCEPTING:  'accepting',   // buzzing; accumulating a value from user input
  DONE:       'done',        // all items processed; ready to exit
});

// ── Brightness levels (Anduril 1–150 scale) ───────────────────────────────────
export const CM_LEVEL = Object.freeze({
  BLINK:    90,   // brief blink at item presentation start
  ITEM:     0,    // between option flashes while awaiting selection
  BUZZ_HI:  90,   // high phase of the value-entry buzz
  BUZZ_LO:  20,   // low phase of the value-entry buzz
  OFF:       0,
});

// ── Timing (milliseconds) ─────────────────────────────────────────────────────
export const CM_TIMING = Object.freeze({
  ENTRY_OFF:       200,   // brief off dip before the first entry flash
  BLINK_ON:        100,   // on-time of each option presentation flash
  FIRST_BLINK_GAP: 2500,  // gap after option 1 flash before option 2
  BLINK_GAP:       1500,  // gap after later option flashes
  BUZZ_HALF:       100,   // duration of each hi/lo phase of the accepting buzz
  HOLD_THRESHOLD:  500,   // press duration that counts as a hold (skip / +10)
  HOLD_REPEAT:    1000,   // while held in value entry, add +10 every second
  INPUT_TIMEOUT:  3000,   // inactivity duration before auto-confirming the current value
});

// ── Session factory ───────────────────────────────────────────────────────────

/**
 * Create a new config menu session.
 *
 * A session is a pure state tracker: it records which item is active, the
 * accumulated value, and completed results.  It has no timers — callers are
 * responsible for calling its methods at the correct moments.
 *
 * @param {number} itemCount   Total number of configurable options in this menu.
 * @returns {ConfigSession}
 *
 * @example
 *   const session = createConfigSession(3);
 *
 *   // Item 0: user enters a value
 *   session.enterItem();        // PRESENTING → ACCEPTING
 *   session.addValue(1);        // click → +1
 *   session.addValue(10);       // hold  → +10
 *   session.confirm();          // timeout fires → save, advance to item 1
 *
 *   // Item 1: user skips
 *   session.skip();             // PRESENTING → skip, advance to item 2
 *
 *   // Item 2: user enters 0
 *   session.enterItem();
 *   session.confirm();          // immediately → save 0, advance → DONE
 *
 *   session.isDone();           // true
 *   session.results;
 *   // [
 *   //   { itemIndex: 0, value: 11 },
 *   //   { itemIndex: 1, skipped: true },
 *   //   { itemIndex: 2, value: 0 },
 *   // ]
 */
export function createConfigSession(itemCount) {
  let _phase     = CM_PHASE.PRESENTING;
  let _itemIndex = 0;
  let _value     = 0;
  const _results = [];

  /** Advance to the next item, or to DONE if this was the last. */
  function _advance() {
    _itemIndex++;
    _value = 0;
    _phase = _itemIndex >= itemCount ? CM_PHASE.DONE : CM_PHASE.PRESENTING;
  }

  /** True when all items have been processed. */
  function isDone() {
    return _phase === CM_PHASE.DONE;
  }

  /**
   * Skip the current item (user held the button through the presentation blink).
   * Records a skipped result and advances to the next item.
   * No-op if not in PRESENTING phase.
   */
  function skip() {
    if (_phase !== CM_PHASE.PRESENTING) return;
    _results.push({ itemIndex: _itemIndex, skipped: true });
    _advance();
  }

  /**
   * Transition from PRESENTING to ACCEPTING for the current item.
   * Called when the user releases the button during the presentation.
   * No-op if not in PRESENTING phase.
   */
  function enterItem() {
    if (_phase !== CM_PHASE.PRESENTING) return;
    _phase = CM_PHASE.ACCEPTING;
  }

  /**
   * Add to the accumulated value for the current item.
   * @param {number} n  Amount to add — 1 for a click, 10 for a hold.
   * No-op if not in ACCEPTING phase.
   */
  function addValue(n) {
    if (_phase !== CM_PHASE.ACCEPTING) return;
    _value = Math.max(0, _value + n);
  }

  /**
   * Confirm the current item's value (called when the input timeout fires)
   * and advance to the next item.
   * No-op if not in ACCEPTING phase.
   */
  function confirm() {
    if (_phase !== CM_PHASE.ACCEPTING) return;
    _results.push({ itemIndex: _itemIndex, value: _value });
    _advance();
  }

  return {
    /** Current phase (one of CM_PHASE). */
    get phase()     { return _phase;        },
    /** 0-based index of the item currently being presented or accepted. */
    get itemIndex() { return _itemIndex;    },
    /** Accumulated value for the current item. */
    get value()     { return _value;        },
    /** Snapshot of completed results so far. */
    get results()   { return [..._results]; },
    isDone,
    skip,
    enterItem,
    addValue,
    confirm,
  };
}
