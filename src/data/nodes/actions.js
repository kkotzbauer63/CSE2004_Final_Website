import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";

export const VERSION_CHECK = {
  id: "VERSION_CHECK",
  name: "Version Check",
  ui: UI.ANY,
  type: NODE_TYPE.ACTION,
  parent: null,
  description: "Blinks out firmware version (MODEL.YYYY-MM-DD). Returns to Off automatically.",
  exitMethod: null,
  group: "special",
  brightness: 10,
  returnsTo: "OFF",
  transitions: [],
};

export const FACTORY_RESET = {
  id: "FACTORY_RESET",
  name: "Factory Reset",
  ui: UI.ANY,
  type: NODE_TYPE.ACTION,
  parent: null,
  description: "Resets all settings to defaults, calibrates temperature sensor. Simple UI is re-enabled. Returns to Off.",
  exitMethod: null,
  group: "special",
  brightness: 10,
  returnsTo: "OFF",
  transitions: [],
};
