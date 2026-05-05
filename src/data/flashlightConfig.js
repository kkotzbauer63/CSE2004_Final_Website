/**
 * flashlightConfig.js — Centralized configuration store for the Anduril flashlight simulator.
 *
 * OOP Design (Encapsulation + Strategy pattern):
 *   - FlashlightConfig class encapsulates all configurable state
 *   - Separate configs for Advanced UI and Simple UI (mirrors Anduril firmware behavior)
 *   - CONFIG_SCHEMA objects define how config menu results map to config keys (Strategy)
 *   - TURBO_STYLE enum for the 3-way turbo behavior setting
 *
 * Usage:
 *   import { DEFAULT_ADVANCED_CONFIG, DEFAULT_SIMPLE_CONFIG, TURBO_STYLE,
 *            RAMP_CONFIG_SCHEMA, RAMP_EXTRAS_SCHEMA, SIMPLE_UI_CONFIG_SCHEMA,
 *            computeStepLevels } from './flashlightConfig.js';
 */

// ── Turbo style enum ─────────────────────────────────────────────────────────
export const TURBO_STYLE = Object.freeze({
  NONE: 0,  // No turbo: 2C → CEIL; TURBO line hidden in state map
  A1:   1,  // A1 style: 2C always → TURBO, from any ramp position or from OFF
  A2:   2,  // A2 style (default): 2C → CEIL; if already at CEIL, 2C → TURBO
});

// ── Default configurations ───────────────────────────────────────────────────
// These mirror Anduril 2 firmware defaults.
export const DEFAULT_ADVANCED_CONFIG = Object.freeze({
  floorLevel:  1,           // Anduril level 1–150: lowest output
  ceilLevel:   120,         // Anduril level 1–150: highest ramping output
  turboLevel:  150,         // Anduril level 1–150: turbo output (above ceiling)
  turboStyle:  TURBO_STYLE.A2,
  rampSpeed:   1,           // smooth ramp: 1=fastest (~2.5s), 4=slowest (~10s)
  stepCount:   7,           // stepped ramp: number of discrete steps
});

export const DEFAULT_SIMPLE_CONFIG = Object.freeze({
  floorLevel:  20,          // Simple UI default floor is slightly above minimum
  ceilLevel:   120,
  turboLevel:  150,
  turboStyle:  TURBO_STYLE.NONE,  // Simple UI hides turbo by default
  stepCount:   5,
});

// ── Config menu result schemas (Strategy pattern) ────────────────────────────
// Each schema is an array indexed by 0-based itemIndex from useConfigMenu.
// null entries mean that menu item does not affect the config store.
// compute(v) converts the raw click-count accumulated in the menu to the actual value.

export const RAMP_CONFIG_SCHEMA = {
  smooth: [
    // Position 1: Floor level — direct ramp level (clicks = level)
    { key: 'floorLevel', compute: (v) => Math.max(1, Math.min(150, v || 1)) },
    // Position 2: Ceiling level — "clicks down from max" (Anduril convention)
    { key: 'ceilLevel',  compute: (v) => Math.max(1, Math.min(150, 151 - Math.max(1, v))) },
    // Position 3: Ramp speed (smooth only) — 1=fastest, 4=slowest
    { key: 'rampSpeed',  compute: (v) => Math.max(1, Math.min(4, v || 1)) },
  ],
  stepped: [
    { key: 'floorLevel', compute: (v) => Math.max(1, Math.min(150, v || 1)) },
    { key: 'ceilLevel',  compute: (v) => Math.max(1, Math.min(150, 151 - Math.max(1, v))) },
    // Position 3: Number of steps (stepped only)
    { key: 'stepCount',  compute: (v) => Math.max(1, Math.min(150, v || 7)) },
  ],
};

export const RAMP_EXTRAS_SCHEMA = [
  null,  // itemIndex 0 (position 1): disable manual memory — no config store effect
  null,  // itemIndex 1 (position 2): manual memory timer — no config store effect
  null,  // itemIndex 2 (position 3): ramp-after-moon style — no config store effect
  // itemIndex 3 (position 4): turbo style
  { key: 'turboStyle', compute: (v) => Math.max(0, Math.min(2, v)) },
  null,  // itemIndex 4 (position 5): smooth steps — no config store effect
];

export const SIMPLE_UI_CONFIG_SCHEMA = [
  // itemIndex 0 (position 1): floor level
  { key: 'floorLevel', compute: (v) => Math.max(1, Math.min(150, v || 1)) },
  // itemIndex 1 (position 2): ceiling level — "clicks down from max"
  { key: 'ceilLevel',  compute: (v) => Math.max(1, Math.min(150, 151 - Math.max(1, v))) },
  // itemIndex 2 (position 3): step count
  { key: 'stepCount',  compute: (v) => Math.max(1, Math.min(150, v || 5)) },
  // itemIndex 3 (position 4): turbo style
  { key: 'turboStyle', compute: (v) => Math.max(0, Math.min(2, v)) },
];

// ── Utility: compute step level values ───────────────────────────────────────
/**
 * Compute the Anduril level (1–150) for each step in a stepped ramp.
 * Steps are evenly spaced from floorLevel to ceilLevel, inclusive.
 *
 * @param {number} floorLevel
 * @param {number} ceilLevel
 * @param {number} stepCount
 * @returns {number[]} Array of length stepCount
 */
export function computeStepLevels(floorLevel, ceilLevel, stepCount) {
  const n = Math.max(1, stepCount);
  if (n === 1) return [floorLevel];
  const steps = [];
  for (let i = 0; i < n; i++) {
    steps.push(Math.round(floorLevel + (ceilLevel - floorLevel) * (i / (n - 1))));
  }
  return steps;
}
