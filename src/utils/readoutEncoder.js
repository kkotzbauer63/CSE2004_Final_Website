/**
 * readoutEncoder.js — Encodes numeric readouts into Anduril-style flash sequences.
 *
 * Anduril uses three flash primitives to blink out numbers:
 *
 *   quick flash  (100 ms @ level 90)                          → digit 0
 *   long flash   (500 ms @ level 90, repeated N times)        → digit N (1–9)
 *   buzz         (fast 100 ms alternation between 90 and 20)  → section separator
 *
 * Public API:
 *   encodeVoltage(volts)        e.g. 4.16  → whole, tenths, hundredths groups
 *   encodeTemperature(celsius)  e.g. 25    → tens, units groups
 *   encodeVersion(versionStr)   e.g. "359.2024-01-15" → model, year, month, day groups
 *
 * Each returns a flat array of { level, duration } frames that can be fed
 * directly to the useReadout hook.
 */

// ── Timing (milliseconds) ─────────────────────────────────────────────────
export const FLASH_TIMING = {
  QUICK_ON:        200,  // on-time for a zero flash
  QUICK_AFTER:     800,  // off gap after a zero flash
  LONG_ON:         500,  // on-time for each tally flash
  LONG_AFTER:      500,  // off gap after each tally flash
  INTER_DIGIT:     300,  // extra off gap between adjacent digits in the same group
  BUZZ_BRIGHT:     100,  // bright half of each buzz cycle
  BUZZ_DIM:        100,  // dim half of each buzz cycle
  BUZZ_CYCLES:       3,  // how many bright+dim cycles per buzz separator
  AFTER_BUZZ:      400,  // silence after buzz before next digit group begins
  AFTER_SEQUENCE:  800,  // trailing silence at the end of the full readout
};

// ── Brightness levels (Anduril 1–150 scale) ───────────────────────────────
export const READOUT_LEVEL = {
  BRIGHT: 90,
  DIM:    20,
  OFF:     0,
};

// ── Primitives ────────────────────────────────────────────────────────────

/** A single quick flash — represents the digit 0. */
function quickFlash() {
  return [
    { level: READOUT_LEVEL.BRIGHT, duration: FLASH_TIMING.QUICK_ON },
    { level: READOUT_LEVEL.OFF,    duration: FLASH_TIMING.QUICK_AFTER },
  ];
}

/** A single long flash — one tally mark. Repeat N times for digit N. */
function longFlash() {
  return [
    { level: READOUT_LEVEL.BRIGHT, duration: FLASH_TIMING.LONG_ON },
    { level: READOUT_LEVEL.OFF,    duration: FLASH_TIMING.LONG_AFTER },
  ];
}

/** A buzz separator — used between digit groups (whole/tenths/hundredths, etc.). */
function buzzSeparator() {
  const frames = [];
  for (let i = 0; i < FLASH_TIMING.BUZZ_CYCLES; i++) {
    frames.push({ level: READOUT_LEVEL.BRIGHT, duration: FLASH_TIMING.BUZZ_BRIGHT });
    frames.push({ level: READOUT_LEVEL.DIM,    duration: FLASH_TIMING.BUZZ_DIM });
  }
  frames.push({ level: READOUT_LEVEL.OFF, duration: FLASH_TIMING.AFTER_BUZZ });
  return frames;
}

// ── Digit encoder ─────────────────────────────────────────────────────────

/**
 * Encode a single digit (0–9) as flash frames.
 *   0 → one quick flash
 *   N → N long flashes
 */
export function encodeDigit(n) {
  const digit = Math.max(0, Math.min(9, Math.round(n)));
  if (digit === 0) return quickFlash();
  const frames = [];
  for (let i = 0; i < digit; i++) frames.push(...longFlash());
  return frames;
}

// ── Sequence builder ──────────────────────────────────────────────────────

/**
 * Build a complete flash sequence from an array of digit groups.
 *
 * Each group is an array of individual digits. Digits within a group are
 * separated by a short INTER_DIGIT pause. Groups are separated by a buzz.
 *
 *   buildSequence([[4], [1], [6]])        // 4.16 V
 *   buildSequence([[2], [5]])             // 25 °C
 *   buildSequence([[3,5,9],[2,0,2,4]])    // model 359, year 2024
 *
 * @param   {number[][]} groups
 * @returns {{ level: number, duration: number }[]}
 */
export function buildSequence(groups) {
  const frames = [];

  groups.forEach((group, gi) => {
    group.forEach((digit, di) => {
      frames.push(...encodeDigit(digit));
      // Small extra gap between digits within the same group
      if (di < group.length - 1) {
        frames.push({ level: READOUT_LEVEL.OFF, duration: FLASH_TIMING.INTER_DIGIT });
      }
    });
    // Buzz between groups (not after the last one)
    if (gi < groups.length - 1) {
      frames.push(...buzzSeparator());
    }
  });

  // Trailing silence
  frames.push({ level: READOUT_LEVEL.OFF, duration: FLASH_TIMING.AFTER_SEQUENCE });
  return frames;
}

// ── Public encoders ───────────────────────────────────────────────────────

/**
 * Encode battery voltage as a flash sequence.
 *
 * Splits into three digit groups — whole volts, tenths, hundredths —
 * separated by buzz separators.
 *
 *   encodeVoltage(4.16)  →  4 longs  ·buzz·  1 long  ·buzz·  6 longs
 *   encodeVoltage(4.00)  →  4 longs  ·buzz·  quick   ·buzz·  quick
 *
 * @param {number} volts  e.g. 4.16
 */
export function encodeVoltage(volts) {
  const v         = Math.round(Math.max(0, volts) * 100);
  const whole     = Math.floor(v / 100);
  const tenths    = Math.floor((v % 100) / 10);
  const hundredths = v % 10;
  return buildSequence([[whole], [tenths], [hundredths]]);
}

/**
 * Encode temperature in °C as a flash sequence.
 *
 * Two digit groups — tens place, units place — separated by a buzz.
 * Single-digit temperatures (< 10) use one group.
 *
 *   encodeTemperature(25)  →  2 longs  ·buzz·  5 longs
 *   encodeTemperature(7)   →  7 longs
 *
 * @param {number} celsius  e.g. 25
 */
export function encodeTemperature(celsius) {
  const t = Math.round(celsius);
  if (t < 10) return buildSequence([[Math.max(0, t)]]);
  const tens  = Math.floor(t / 10);
  const units = t % 10;
  return buildSequence([[tens], [units]]);
}

/**
 * Encode a firmware version string as a flash sequence.
 *
 * Splits on "." and "-" to extract components; each component's characters
 * become individual digits in that group, separated by INTER_DIGIT pauses.
 * Groups are separated by buzz separators.
 *
 *   encodeVersion("359.2024-01-15")
 *     → group [3,5,9]  ·buzz·  group [2,0,2,4]  ·buzz·  group [0,1]  ·buzz·  group [1,5]
 *
 * Non-digit characters in a component are silently ignored.
 *
 * @param {string} versionStr  e.g. "359.2024-01-15"
 */
export function encodeVersion(versionStr) {
  const parts  = String(versionStr).split(/[.\-]/);
  const groups = parts
    .filter(p => p.length > 0)
    .map(p => Array.from(p).map(Number).filter(n => !Number.isNaN(n)));
  return buildSequence(groups.filter(g => g.length > 0));
}
