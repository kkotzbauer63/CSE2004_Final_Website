import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";

// ─── Container ───────────────────────────────────────────────────────────────

export const BLINKY_GROUP = {
  id: "BLINKY_GROUP",
  name: "Blinky / Utility",
  ui: UI.ANY,
  type: NODE_TYPE.CONTAINER,
  parent: null,
  description: "Utility modes for diagnostics and signaling. Entered via Off → 3C. Always starts at Battery Check. In Simple UI only Battery Check is accessible.",
  exitMethod: null,
  group: "blinky",
  brightness: 30,

  entryPoint: "BATTERY_CHECK",
  childIds: ["BATTERY_CHECK", "TEMPERATURE_CHECK", "BEACON", "SOS"],
  cycleAction: { forward: "2C" },

  // Shared transitions inherited by all children (defined on children directly below)
  sharedTransitions: [],
  transitions: [],
};

// ─── Children ────────────────────────────────────────────────────────────────

export const BATTERY_CHECK = {
  id: "BATTERY_CHECK",
  name: "Battery Check",
  ui: UI.ANY,
  type: NODE_TYPE.STATE,
  parent: "BLINKY_GROUP",
  description: "Blinks out battery voltage (e.g. 4, 1, 6 = 4.16 V). In Simple UI, shows once then turns off.",
  exitMethod: null,
  group: "blinky",
  brightness: 30,

  transitions: [
    { action: "1C", target: "OFF",               ui: UI.ANY,  kind: TRANSITION_KIND.NAVIGATE, description: "Off",                       condition: null },
    { action: "2C", target: "TEMPERATURE_CHECK", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next blinky mode (Temp Check)", condition: null },
    { action: "3C", target: "_self",             ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Next channel mode",          condition: null },
    { action: "7H", target: "VOLTAGE_CONFIG",    ui: UI.FULL, kind: TRANSITION_KIND.CONFIG,   description: "Voltage config menu",        condition: null },
  ],
};

export const TEMPERATURE_CHECK = {
  id: "TEMPERATURE_CHECK",
  name: "Temp Check",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "BLINKY_GROUP",
  description: "Blinks out current temperature in °C. Requires temperature sensor.",
  exitMethod: null,
  group: "blinky",
  brightness: 30,

  transitions: [
    { action: "1C", target: "OFF",            ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Off",                        condition: null },
    { action: "2C", target: "BEACON",         ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next blinky mode (Beacon)",   condition: null },
    { action: "7H", target: "THERMAL_CONFIG", ui: UI.FULL, kind: TRANSITION_KIND.CONFIG,   description: "Thermal config menu",        condition: null },
  ],
};

export const BEACON = {
  id: "BEACON",
  name: "Beacon",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "BLINKY_GROUP",
  description: "Periodic single flash at a configurable interval. Brightness follows ramp memory.",
  exitMethod: null,
  group: "blinky",
  brightness: 100,

  transitions: [
    { action: "1C", target: "OFF", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Off",                            condition: null },
    { action: "1H", target: "_self", ui: UI.FULL, kind: TRANSITION_KIND.INTERNAL, description: "Configure beacon timing",      condition: null, beaconEffect: "timing" },
    { action: "2C", target: "SOS", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next blinky mode (SOS)",        condition: null },
  ],
};

export const SOS = {
  id: "SOS",
  name: "SOS",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "BLINKY_GROUP",
  description: "Flashes SOS (· · · — — — · · ·) until turned off. Brightness follows ramp memory.",
  exitMethod: null,
  group: "blinky",
  brightness: 100,

  transitions: [
    { action: "1C", target: "OFF",           ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Off",                                    condition: null },
    { action: "2C", target: "BATTERY_CHECK", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Next blinky mode (Battery Check, wraps)", condition: null },
  ],
};
