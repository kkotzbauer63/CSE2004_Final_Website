import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";

export const TACTICAL_MODE = {
  id: "TACTICAL_MODE",
  name: "Tactical",
  ui: UI.FULL,
  type: NODE_TYPE.CONTAINER,
  parent: null,
  description: "Three configurable momentary slots. Hold for on, release for off. Entered via Off → 6C.",
  exitMethod: null,
  group: "special",
  brightness: 100,

  entryPoint: "TACTICAL_SLOT_1",
  childIds: ["TACTICAL_SLOT_1", "TACTICAL_SLOT_2", "TACTICAL_SLOT_3"],

  sharedTransitions: [
    { action: "1H", target: "TACTICAL_SLOT_1", ui: UI.FULL, kind: TRANSITION_KIND.MOMENTARY, description: "Slot 1 (default: High) while held",   condition: null, momentary: true, brightnessHint: "turbo" },
    { action: "2H", target: "TACTICAL_SLOT_2", ui: UI.FULL, kind: TRANSITION_KIND.MOMENTARY, description: "Slot 2 (default: Low) while held",    condition: null, momentary: true, brightnessHint: "floor" },
    { action: "3H", target: "TACTICAL_SLOT_3", ui: UI.FULL, kind: TRANSITION_KIND.MOMENTARY, description: "Slot 3 (default: Strobe) while held", condition: null, momentary: true },
    { action: "6C", target: "OFF",             ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE,  description: "Exit tactical mode → Off",            condition: null },
    { action: "7C", target: "_self",           ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL,  description: "Aux LEDs: next pattern",              condition: null, auxEffect: "nextPattern" },
    { action: "7H", target: "TACTICAL_CONFIG", ui: UI.FULL, kind: TRANSITION_KIND.CONFIG,    description: "Tactical config menu",                condition: null },
  ],
  transitions: [],
};

export const TACTICAL_SLOT_1 = {
  id: "TACTICAL_SLOT_1",
  name: "Tactical Slot 1",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "TACTICAL_MODE",
  description: "Default: High brightness. Configurable to any ramp level (1–150) or strobe mode (0, 151+).",
  exitMethod: null,
  group: "special",
  brightness: 100,
  transitions: [],
};

export const TACTICAL_SLOT_2 = {
  id: "TACTICAL_SLOT_2",
  name: "Tactical Slot 2",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "TACTICAL_MODE",
  description: "Default: Low brightness. Configurable to any ramp level (1–150) or strobe mode (0, 151+).",
  exitMethod: null,
  group: "special",
  brightness: 10,
  transitions: [],
};

export const TACTICAL_SLOT_3 = {
  id: "TACTICAL_SLOT_3",
  name: "Tactical Slot 3",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "TACTICAL_MODE",
  description: "Default: Last-used strobe. Configurable to any ramp level (1–150) or strobe mode (0, 151+).",
  exitMethod: null,
  group: "special",
  brightness: 100,
  transitions: [],
};
