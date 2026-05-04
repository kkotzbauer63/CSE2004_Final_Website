// constants.js — Enums for the data layer
// Values are lowercase to match existing engine/hook/component code.

export const UI = Object.freeze({
  SIMPLE: "simple",
  FULL:   "full",
  ANY:    "any",
});

export const NODE_TYPE = Object.freeze({
  STATE:       "state",
  CONTAINER:   "container",
  CONFIG_MENU: "config_menu",
  ACTION:      "action",
});

export const TRANSITION_KIND = Object.freeze({
  NAVIGATE:  "navigate",
  INTERNAL:  "internal",
  MOMENTARY: "momentary",
  CONFIG:    "config",
});

export const CONDITION = Object.freeze({
  SINGLE_CHANNEL:  "single_channel",
  MULTI_CHANNEL:   "multi_channel",
  HAS_TINT:        "has_tint",
  NO_TINT:         "no_tint",
  SOME_LIGHTS:     "some_lights",
  EXTENDED_SIMPLE: "extended_simple",
  HAS_TEMP_SENSOR: "has_temp_sensor",
  HAS_RGB_AUX:     "has_rgb_aux",
});
