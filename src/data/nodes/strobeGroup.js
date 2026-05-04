import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";

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
  childIds: ["PARTY_STROBE", "TACTICAL_STROBE", "POLICE_STROBE", "LIGHTNING", "CANDLE", "BIKE_FLASHER"],
  cycleAction: { forward: "2C", backward: "4C" },

  sharedTransitions: [
    { action: "1C", target: "OFF",          ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Off",                            condition: null },
    { action: "2C", target: "_next",        ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next strobe / mood mode",        condition: null },
    { action: "4C", target: "_prev",        ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Previous strobe / mood mode",    condition: null },
    { action: "5C", target: "MOMENTARY_MODE", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Momentary mode (current strobe)", condition: null },
    { action: "3C", target: "_self",        ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Next channel mode",              condition: null },
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
  description: "Rapid consistent strobe. Hold to adjust speed.",
  exitMethod: null,
  group: "strobe",
  brightness: 100,

  transitions: [
    { action: "1H", target: "_self",          ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Faster",                              condition: null, rampEffect: "up" },
    { action: "2H", target: "_self",          ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Slower",                              condition: null, rampEffect: "down" },
    { action: "2C", target: "TACTICAL_STROBE", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next strobe mode (Tactical Strobe)", condition: null },
    { action: "4C", target: "BIKE_FLASHER",   ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Prev strobe mode (Bike Flasher)",    condition: null },
  ],
};

export const TACTICAL_STROBE = {
  id: "TACTICAL_STROBE",
  name: "Tactical Strobe",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: "High-speed disorienting strobe. Hold to adjust speed.",
  exitMethod: null,
  group: "strobe",
  brightness: 100,

  transitions: [
    { action: "1H", target: "_self",       ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Faster",                              condition: null, rampEffect: "up" },
    { action: "2H", target: "_self",       ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Slower",                              condition: null, rampEffect: "down" },
    { action: "2C", target: "POLICE_STROBE", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next strobe mode (Police Strobe)", condition: null },
    { action: "4C", target: "PARTY_STROBE", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Prev strobe mode (Party Strobe)",  condition: null },
  ],
};

export const POLICE_STROBE = {
  id: "POLICE_STROBE",
  name: "Police Strobe",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: "Alternating high/low strobe. No speed adjustment. Requires 2+ LED colors.",
  exitMethod: null,
  group: "strobe",
  brightness: 100,

  transitions: [
    { action: "2C", target: "LIGHTNING",       ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next strobe mode (Lightning)",        condition: null },
    { action: "4C", target: "TACTICAL_STROBE", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Prev strobe mode (Tactical Strobe)", condition: null },
  ],
};

export const LIGHTNING = {
  id: "LIGHTNING",
  name: "Lightning",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: "Random lightning storm simulation. WARNING: may reach full power suddenly.",
  exitMethod: null,
  group: "strobe",
  brightness: 100,

  transitions: [
    { action: "1H", target: "_self",      ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Interrupt / start new flash",         condition: null },
    { action: "2C", target: "CANDLE",     ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next strobe mode (Candle)",           condition: null },
    { action: "4C", target: "POLICE_STROBE", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Prev strobe mode (Police Strobe)", condition: null },
  ],
};

export const CANDLE = {
  id: "CANDLE",
  name: "Candle",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: "Realistic candle flame simulation. Configurable brightness. Supports sunset timer.",
  exitMethod: null,
  group: "strobe",
  brightness: 30,

  transitions: [
    { action: "1H", target: "_self",       ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Brighter",                           condition: null, rampEffect: "up" },
    { action: "2H", target: "_self",       ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Dimmer",                             condition: null, rampEffect: "down" },
    { action: "2C", target: "BIKE_FLASHER", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next strobe mode (Bike Flasher)",  condition: null },
    { action: "4C", target: "LIGHTNING",   ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Prev strobe mode (Lightning)",      condition: null },
    { action: "5H", target: "_self",       ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Sunset timer: start / add 5 min",  condition: null },
  ],
};

export const BIKE_FLASHER = {
  id: "BIKE_FLASHER",
  name: "Bike Flasher",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: "Medium brightness with periodic brighter stutter once per second. Configurable brightness.",
  exitMethod: null,
  group: "strobe",
  brightness: 50,

  transitions: [
    { action: "1H", target: "_self",      ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Brighter",                              condition: null, rampEffect: "up" },
    { action: "2H", target: "_self",      ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Dimmer",                                condition: null, rampEffect: "down" },
    { action: "2C", target: "PARTY_STROBE", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next strobe mode (Party Strobe, wraps)", condition: null },
    { action: "4C", target: "CANDLE",    ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Prev strobe mode (Candle)",              condition: null },
  ],
};
