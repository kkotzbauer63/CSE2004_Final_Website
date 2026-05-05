import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";
import {
  STROBE_MODE_DEFINITIONS,
  STROBE_MODE_ORDER,
  buildStrobeModeTransitions,
} from "../../utils/strobeModes.js";

// ─── Container ───────────────────────────────────────────────────────────────

export const STROBE_GROUP = {
  id: "STROBE_GROUP",
  name: "Strobe / Mood",
  ui: UI.FULL,
  type: NODE_TYPE.CONTAINER,
  parent: null,
  description: "Special lighting effects. Entered via Off → 3H. Remembers last-used mode.",
  exitMethod: null,
  group: "strobe",
  brightness: 100,

  entryPoint: "last_used",  // Defaults to PARTY_STROBE in the engine
  childIds: STROBE_MODE_ORDER,
  cycleAction: { forward: "2C", backward: "4C" },

  sharedTransitions: [
    { action: "1C", target: "OFF",          ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Off",                            condition: null },
    { action: "2C", target: "_next",        ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next strobe / mood mode",        condition: null },
    { action: "4C", target: "_prev",        ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Previous strobe / mood mode",    condition: null },
    { action: "5C", target: "MOMENTARY_MODE", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Momentary mode (current strobe)", condition: null },
  ],

  transitions: [],
};

// ─── Children ────────────────────────────────────────────────────────────────

export const PARTY_STROBE = {
  id: "PARTY_STROBE",
  name: "Party Strobe",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: STROBE_MODE_DEFINITIONS.PARTY_STROBE.description,
  exitMethod: null,
  group: "strobe",
  brightness: STROBE_MODE_DEFINITIONS.PARTY_STROBE.brightness,

  transitions: buildStrobeModeTransitions("PARTY_STROBE"),
};

export const TACTICAL_STROBE = {
  id: "TACTICAL_STROBE",
  name: "Tactical Strobe",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: STROBE_MODE_DEFINITIONS.TACTICAL_STROBE.description,
  exitMethod: null,
  group: "strobe",
  brightness: STROBE_MODE_DEFINITIONS.TACTICAL_STROBE.brightness,

  transitions: buildStrobeModeTransitions("TACTICAL_STROBE"),
};

export const POLICE_STROBE = {
  id: "POLICE_STROBE",
  name: "Police Strobe",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: STROBE_MODE_DEFINITIONS.POLICE_STROBE.description,
  exitMethod: null,
  group: "strobe",
  brightness: STROBE_MODE_DEFINITIONS.POLICE_STROBE.brightness,

  transitions: buildStrobeModeTransitions("POLICE_STROBE"),
};

export const LIGHTNING = {
  id: "LIGHTNING",
  name: "Lightning",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: STROBE_MODE_DEFINITIONS.LIGHTNING.description,
  exitMethod: null,
  group: "strobe",
  brightness: STROBE_MODE_DEFINITIONS.LIGHTNING.brightness,

  transitions: buildStrobeModeTransitions("LIGHTNING"),
};

export const CANDLE = {
  id: "CANDLE",
  name: "Candle",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: STROBE_MODE_DEFINITIONS.CANDLE.description,
  exitMethod: null,
  group: "strobe",
  brightness: STROBE_MODE_DEFINITIONS.CANDLE.brightness,

  transitions: buildStrobeModeTransitions("CANDLE"),
};

export const BIKE_FLASHER = {
  id: "BIKE_FLASHER",
  name: "Bike Flasher",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: STROBE_MODE_DEFINITIONS.BIKE_FLASHER.description,
  exitMethod: null,
  group: "strobe",
  brightness: STROBE_MODE_DEFINITIONS.BIKE_FLASHER.brightness,

  transitions: buildStrobeModeTransitions("BIKE_FLASHER"),
};
