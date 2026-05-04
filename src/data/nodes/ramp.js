import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";

export const RAMP = {
  id: "RAMP",
  name: "Ramp",
  ui: UI.ANY,
  type: NODE_TYPE.STATE,
  parent: null,
  description: "Light is on. Smooth or stepped brightness ramping. Main operating state.",
  exitMethod: null,
  group: "core",
  brightness: 50,

  transitions: [
    { action: "1C",  target: "OFF",               ui: UI.ANY,  kind: TRANSITION_KIND.NAVIGATE,  description: "Off",                                              condition: null },
    { action: "1H",  target: "_self",             ui: UI.ANY,  kind: TRANSITION_KIND.INTERNAL,  description: "Ramp up (reverses direction if at ceiling)",       condition: null, rampEffect: "up" },
    { action: "2H",  target: "_self",             ui: UI.ANY,  kind: TRANSITION_KIND.INTERNAL,  description: "Ramp down",                                        condition: null, rampEffect: "down" },
    { action: "2C",  target: "_self",             ui: UI.ANY,  kind: TRANSITION_KIND.INTERNAL,  description: "Go to/from ceiling or turbo (configurable)",       condition: null, brightnessHint: "ceiling" },
    { action: "3C",  target: "_self",             ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL,  description: "Toggle ramp style (smooth ↔ stepped)",             condition: null },
    { action: "3H",  target: "_self",             ui: UI.FULL, kind: TRANSITION_KIND.MOMENTARY, description: "Momentary turbo",                                  condition: null, brightnessHint: "turbo", momentary: true },
    { action: "4C",  target: "LOCKOUT",           ui: UI.ANY,  kind: TRANSITION_KIND.NAVIGATE,  description: "Lockout mode",                                     condition: null },
    { action: "5C",  target: "MOMENTARY_MODE",    ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE,  description: "Momentary mode (steady at current brightness)",    condition: null },
    { action: "5H",  target: "_self",             ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL,  description: "Sunset timer: start / add 5 minutes",              condition: null },
    { action: "7H",  target: "RAMP_CONFIG",       ui: UI.FULL, kind: TRANSITION_KIND.CONFIG,    description: "Ramp config menu (floor, ceiling, speed/steps)",   condition: null },
    { action: "10C", target: "_self",             ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL,  description: "Save manual memory (current brightness)",          condition: null },
    { action: "10H", target: "RAMP_EXTRAS_CONFIG",ui: UI.FULL, kind: TRANSITION_KIND.CONFIG,    description: "Ramp extras config menu",                          condition: null },
  ],
};
