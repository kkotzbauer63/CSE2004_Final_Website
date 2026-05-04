import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";

export const AUX_PATTERN_CONFIG = {
  id: "AUX_PATTERN_CONFIG",
  name: "Aux Pattern (Off)",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: null,
  description: "Configure aux LED pattern in off mode. 7C cycles: Off → Low → High → Blinking. Press 1C to return.",
  exitMethod: null,
  group: "config",
  brightness: 0,
  transitions: [
    { action: "7C", target: "_self", ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Next pattern (Off → Low → High → Blinking)", condition: null, auxEffect: "nextPattern" },
    { action: "1C", target: "OFF",   ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Exit (return to Off)",                       condition: null },
  ],
};

export const AUX_COLOR_CONFIG = {
  id: "AUX_COLOR_CONFIG",
  name: "Aux Color (Off)",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: null,
  description: "Configure aux LED color in off mode. 7H cycles: Red → Yellow → Green → Cyan → Blue → Magenta → White → Disco → Rainbow → Voltage. Disco cycles colors every 0.25 s; Rainbow every 1 s. Press 1C to return.",
  exitMethod: null,
  group: "config",
  brightness: 0,
  transitions: [
    { action: "7H", target: "_self", ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Next color (cycles through all options)", condition: null, auxEffect: "nextColor" },
    { action: "1C", target: "OFF",   ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Exit (return to Off)",                    condition: null },
  ],
};
