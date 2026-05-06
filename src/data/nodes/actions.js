import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";

// VERSION_CHECK is now a persistent state (not auto-returning).
// The readout loops until the user presses 1C to exit.
export const VERSION_CHECK = {
  id: "VERSION_CHECK",
  name: "Version Check",
  ui: UI.ANY,
  type: NODE_TYPE.STATE,
  parent: null,
  description: "Blinks out firmware version (MODEL-YYYY-MM-DD-SINCE-DIRTY). Loops until 1C.",
  exitMethod: null,
  group: "special",
  brightness: 10,
  transitions: [
    { action: "1C", target: "OFF", ui: UI.ANY, kind: TRANSITION_KIND.NAVIGATE, description: "Exit version check (return to Off)", condition: null },
  ],
};

// The hook performs the reset on entry, then returns to Off after the reset window.
export const FACTORY_RESET = {
  id: "FACTORY_RESET",
  name: "Factory Reset",
  ui: UI.ANY,
  type: NODE_TYPE.STATE,
  parent: null,
  description: "Resets all settings to defaults. Simple UI is re-enabled, then returns to Off.",
  exitMethod: null,
  group: "special",
  brightness: 0,
  transitions: [
    { action: "1C", target: "OFF", ui: UI.ANY, kind: TRANSITION_KIND.NAVIGATE, description: "Return to Off", condition: null },
  ],
};
