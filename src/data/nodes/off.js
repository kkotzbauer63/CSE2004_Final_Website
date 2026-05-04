import { UI, NODE_TYPE, TRANSITION_KIND, CONDITION } from "../constants.js";

export const OFF = {
  id: "OFF",
  name: "Off",
  ui: UI.ANY,
  type: NODE_TYPE.STATE,
  parent: null,
  description: "Light is off. Primary idle state. Aux LEDs may be active.",
  exitMethod: null,
  group: "core",
  brightness: 0,

  transitions: [
    { action: "1C",   target: "RAMP",             ui: UI.ANY,    kind: TRANSITION_KIND.NAVIGATE,  description: "On (ramp mode, memorized level)",                condition: null },
    { action: "1H",   target: "RAMP",             ui: UI.ANY,    kind: TRANSITION_KIND.NAVIGATE,  description: "On at floor level; keep holding to ramp up",    condition: null, brightnessHint: "floor" },
    { action: "2C",   target: "RAMP",             ui: UI.ANY,    kind: TRANSITION_KIND.NAVIGATE,  description: "On at ceiling level",                            condition: null, brightnessHint: "ceiling" },
    { action: "2H",   target: "RAMP",             ui: UI.SIMPLE, kind: TRANSITION_KIND.MOMENTARY, description: "Momentary ceiling (release to turn off)",        condition: null, brightnessHint: "ceiling", momentary: true },
    { action: "2H",   target: "RAMP",             ui: UI.FULL,   kind: TRANSITION_KIND.MOMENTARY, description: "Momentary turbo (release to turn off)",          condition: null, brightnessHint: "turbo",   momentary: true },
    { action: "3C",   target: "BATTERY_CHECK",    ui: UI.ANY,    kind: TRANSITION_KIND.NAVIGATE,  description: "Battery check",                                  condition: null },
    { action: "3H",   target: "STROBE_GROUP",     ui: UI.FULL,   kind: TRANSITION_KIND.NAVIGATE,  description: "Strobe / mood modes (last used)",                condition: null },
    { action: "4C",   target: "LOCKOUT",          ui: UI.ANY,    kind: TRANSITION_KIND.NAVIGATE,  description: "Lockout mode",                                   condition: null },
    { action: "5C",   target: "MOMENTARY_MODE",   ui: UI.FULL,   kind: TRANSITION_KIND.NAVIGATE,  description: "Momentary mode",                                 condition: null },
    { action: "6C",   target: "TACTICAL_MODE",    ui: UI.FULL,   kind: TRANSITION_KIND.NAVIGATE,  description: "Tactical mode",                                  condition: null },
    { action: "7C",   target: "_self",            ui: UI.FULL,   kind: TRANSITION_KIND.INTERNAL,  description: "Aux LEDs: next pattern (Off→Low→High→Blinking)", condition: null, auxEffect: "nextPattern" },
    { action: "7H",   target: "_self",            ui: UI.FULL,   kind: TRANSITION_KIND.INTERNAL,  description: "Aux LEDs: next color",                           condition: null, auxEffect: "nextColor" },
    { action: "9H",   target: "MISC_CONFIG",      ui: UI.FULL,   kind: TRANSITION_KIND.CONFIG,    description: "Misc config menu",                               condition: null },
    { action: "10C",  target: "_self",            ui: UI.FULL,   kind: TRANSITION_KIND.INTERNAL,  description: "Enable Simple UI",                               condition: null, setsUiMode: "simple" },
    { action: "10H",  target: "_self",            ui: UI.SIMPLE, kind: TRANSITION_KIND.INTERNAL,  description: "Disable Simple UI (switch to Advanced)",         condition: null, setsUiMode: "full" },
    { action: "10H",  target: "_self",            ui: UI.FULL,   kind: TRANSITION_KIND.INTERNAL,  description: "Switch to Simple UI",                            condition: null, setsUiMode: "simple" },
    { action: "13H",  target: "FACTORY_RESET",    ui: UI.ANY,    kind: TRANSITION_KIND.NAVIGATE,  description: "Factory reset (hold ~4s)",                       condition: null },
    { action: "15+C", target: "VERSION_CHECK",    ui: UI.ANY,    kind: TRANSITION_KIND.NAVIGATE,  description: "Version check",                                  condition: null },
  ],
};
