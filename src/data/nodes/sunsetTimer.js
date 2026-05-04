import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";

export const SUNSET_TIMER = {
  id: "SUNSET_TIMER",
  name: "Sunset Timer",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: null,
  description: "Ramp mode with active sunset timer. Light slowly dims to floor then shuts off. While in ramp, 5H activates; hold longer — each blink adds 5 minutes. You can still change brightness; if changed in the final minutes, the timer resets to at least 3 minutes.",
  exitMethod: null,
  group: "core",
  brightness: 50,
  transitions: [
    { action: "1C",  target: "OFF",     ui: UI.ANY,  kind: TRANSITION_KIND.NAVIGATE, description: "Off (cancels timer)",                                        condition: null },
    { action: "1H",  target: "_self",   ui: UI.ANY,  kind: TRANSITION_KIND.INTERNAL, description: "Ramp up",                                                   condition: null, rampEffect: "up" },
    { action: "2H",  target: "_self",   ui: UI.ANY,  kind: TRANSITION_KIND.INTERNAL, description: "Ramp down",                                                  condition: null, rampEffect: "down" },
    { action: "2C",  target: "_self",   ui: UI.ANY,  kind: TRANSITION_KIND.INTERNAL, description: "Go to/from ceiling",                                        condition: null, brightnessHint: "ceiling" },
    { action: "4C",  target: "LOCKOUT", ui: UI.ANY,  kind: TRANSITION_KIND.NAVIGATE, description: "Lockout mode",                                               condition: null },
    { action: "5H",  target: "_self",   ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Add 5 minutes per blink (hold — each blink = +5 min)",       condition: null },
  ],
};
