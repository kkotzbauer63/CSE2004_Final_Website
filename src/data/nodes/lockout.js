import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";

export const LOCKOUT = {
  id: "LOCKOUT",
  name: "Lockout",
  ui: UI.ANY,
  type: NODE_TYPE.STATE,
  parent: null,
  description: "Button locked. Prevents accidental activation. Momentary moon available while held.",
  exitMethod: null,
  group: "core",
  brightness: 0,

  transitions: [
    { action: "1H",  target: "_self",         ui: UI.ANY,  kind: TRANSITION_KIND.MOMENTARY, description: "Momentary moon (lowest floor level)",           condition: null, brightnessHint: "moon", momentary: true },
    { action: "2H",  target: "_self",         ui: UI.ANY,  kind: TRANSITION_KIND.MOMENTARY, description: "Momentary moon (highest floor / manual mem)",   condition: null, brightnessHint: "moon", momentary: true },
    { action: "3C",  target: "OFF",           ui: UI.ANY,  kind: TRANSITION_KIND.NAVIGATE,  description: "Unlock → go to Off mode",                       condition: null },
    { action: "3H",  target: "_self",         ui: UI.ANY,  kind: TRANSITION_KIND.INTERNAL,  description: "Next channel mode",                             condition: null },
    { action: "4C",  target: "RAMP",          ui: UI.ANY,  kind: TRANSITION_KIND.NAVIGATE,  description: "Unlock → turn on at memorized level",           condition: null },
    { action: "4H",  target: "RAMP",          ui: UI.ANY,  kind: TRANSITION_KIND.NAVIGATE,  description: "Unlock → turn on at floor level",               condition: null, brightnessHint: "floor" },
    { action: "5C",  target: "RAMP",          ui: UI.ANY,  kind: TRANSITION_KIND.NAVIGATE,  description: "Unlock → turn on at ceiling level",             condition: null, brightnessHint: "ceiling" },
    { action: "7C",  target: "_self",         ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL,  description: "Aux LEDs: next pattern (lockout pattern)",      condition: null, auxEffect: "nextPattern" },
    { action: "7H",  target: "_self",         ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL,  description: "Aux LEDs: next color (lockout color)",          condition: null, auxEffect: "nextColor" },
    { action: "10H", target: "AUTO_LOCK_CONFIG", ui: UI.FULL, kind: TRANSITION_KIND.CONFIG, description: "Auto-lock config menu",                         condition: null },
  ],
};
