import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";

// All config menus share the same interaction pattern:
// 1. Light blinks once per menu item.
// 2. Hold through a blink to skip that item.
// 3. Release on a blink to configure → enters number entry sub-state.
// 4. In number entry: click = +1, hold = +10, wait = confirm and advance.
// 5. After all items, returns to the invoking state.

export const RAMP_CONFIG = {
  id: "RAMP_CONFIG",
  name: "Ramp Config",
  ui: UI.FULL,
  type: NODE_TYPE.CONFIG_MENU,
  parent: null,
  description: "Configure floor, ceiling, and ramp speed (smooth) or number of steps (stepped).",
  exitMethod: null,
  group: "config",
  brightness: 10,
  enteredFrom: "RAMP",
  enteredVia: "7H",
  returnsTo: "RAMP",
  menuVariants: {
    smooth: [
      { position: 1, name: "Floor level",  default: "1/150",    valueScheme: "clicks = ramp level" },
      { position: 2, name: "Ceiling level",default: "120/150",  valueScheme: "clicks down from max" },
      { position: 3, name: "Ramp speed",   default: 1,          valueScheme: "1=fastest (~2.5s), 4=slowest (~10s)" },
    ],
    stepped: [
      { position: 1, name: "Floor level",    default: "20/150",  valueScheme: "clicks = ramp level" },
      { position: 2, name: "Ceiling level",  default: "120/150", valueScheme: "clicks down from max" },
      { position: 3, name: "Number of steps",default: 7,         valueScheme: "1–150" },
    ],
  },
  transitions: [
    { action: "1C", target: "RAMP", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Exit config (return to Ramp)", condition: null },
  ],
};

export const RAMP_EXTRAS_CONFIG = {
  id: "RAMP_EXTRAS_CONFIG",
  name: "Ramp Extras",
  ui: UI.FULL,
  type: NODE_TYPE.CONFIG_MENU,
  parent: null,
  description: "Advanced ramp settings: memory mode, timer, ramp-after-moon, turbo style, smooth steps.",
  exitMethod: null,
  group: "config",
  brightness: 10,
  enteredFrom: "RAMP",
  enteredVia: "10H",
  returnsTo: "RAMP",
  menuItems: [
    { position: 1, name: "Disable manual memory",     default: 0, valueScheme: "any value = disable (revert to auto mem)" },
    { position: 2, name: "Manual memory timer",       default: 0, valueScheme: "clicks = minutes (0 = pure manual memory)" },
    { position: 3, name: "Ramp-after-moon style",     default: 0, valueScheme: "0 = ramp up, 1 = stay at floor" },
    { position: 4, name: "Turbo style",               default: 2, valueScheme: "0=no turbo (2C→CEIL; TURBO line hidden), 1=A1 always-turbo (2C from OFF or ramp always→TURBO), 2=A2 default (2C→CEIL; 2C again at CEIL→TURBO)" },
    { position: 5, name: "Smooth steps",              default: 1, valueScheme: "0 = off, 1 = on" },
  ],
  transitions: [
    { action: "1C", target: "RAMP", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Exit config (return to Ramp)", condition: null },
  ],
};

export const SIMPLE_UI_CONFIG = {
  id: "SIMPLE_UI_CONFIG",
  name: "Simple Ramp Config",
  ui: UI.FULL,
  type: NODE_TYPE.CONFIG_MENU,
  parent: null,
  description: "Configure Simple UI ramp parameters. Only accessible from Advanced UI.",
  exitMethod: null,
  group: "config",
  brightness: 10,
  enteredFrom: "OFF",
  enteredVia: "10H",
  returnsTo: "OFF",
  menuItems: [
    { position: 1, name: "Floor level",    default: "20/150", valueScheme: "clicks = ramp level" },
    { position: 2, name: "Ceiling level",  default: "120/150",valueScheme: "clicks down from max" },
    { position: 3, name: "Number of steps",default: 5,        valueScheme: "1–150" },
    { position: 4, name: "Turbo style",    default: 0,        valueScheme: "0 = no turbo, 1–2 = turbo style" },
  ],
  transitions: [
    { action: "1C", target: "OFF", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Exit config (return to Off)", condition: null },
  ],
};

export const VOLTAGE_CONFIG = {
  id: "VOLTAGE_CONFIG",
  name: "Voltage Config",
  ui: UI.FULL,
  type: NODE_TYPE.CONFIG_MENU,
  parent: null,
  description: "Battery voltage calibration and aux LED display settings.",
  exitMethod: null,
  group: "config",
  brightness: 10,
  enteredFrom: "BATTERY_CHECK",
  enteredVia: "7H",
  returnsTo: "BATTERY_CHECK",
  menuItems: [
    { position: 1, name: "Voltage correction",      default: 7, valueScheme: "1–13 clicks (7 = 0V offset; each step ±0.05V)" },
    { position: 2, name: "Post-off display timeout",default: 4, valueScheme: "clicks = seconds (0 = disabled)" },
    { position: 3, name: "Aux low ramp level",      default: 0, valueScheme: "ramp level below which button LEDs stay off (0 = always off)" },
    { position: 4, name: "Aux high ramp level",     default: 0, valueScheme: "ramp level above which button LEDs go high (0 = disabled)" },
  ],
  transitions: [
    { action: "1C", target: "BATTERY_CHECK", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Exit config (return to Battery Check)", condition: null },
  ],
};

export const THERMAL_CONFIG = {
  id: "THERMAL_CONFIG",
  name: "Thermal Config",
  ui: UI.FULL,
  type: NODE_TYPE.CONFIG_MENU,
  parent: null,
  description: "Temperature sensor calibration and thermal limit setting.",
  exitMethod: null,
  group: "config",
  brightness: 10,
  enteredFrom: "TEMPERATURE_CHECK",
  enteredVia: "7H",
  returnsTo: "TEMPERATURE_CHECK",
  menuItems: [
    { position: 1, name: "Current temperature",default: 21, valueScheme: "click once per °C (e.g. 21 clicks = 21°C)" },
    { position: 2, name: "Temperature limit",  default: 15, valueScheme: "clicks = degrees above 30°C (e.g. 15 clicks = 45°C)" },
  ],
  transitions: [
    { action: "1C", target: "TEMPERATURE_CHECK", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Exit config (return to Temp Check)", condition: null },
  ],
};

export const AUTO_LOCK_CONFIG = {
  id: "AUTO_LOCK_CONFIG",
  name: "Auto-Lock Config",
  ui: UI.FULL,
  type: NODE_TYPE.CONFIG_MENU,
  parent: null,
  description: "Configure automatic lockout after the light turns off.",
  exitMethod: null,
  group: "config",
  brightness: 10,
  enteredFrom: "LOCKOUT",
  enteredVia: "10H",
  returnsTo: "LOCKOUT",
  menuItems: [
    { position: 1, name: "Auto-lock timeout", default: 0, valueScheme: "clicks = minutes (0 = disabled)" },
  ],
  transitions: [
    { action: "1C", target: "LOCKOUT", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Exit config (return to Lockout)", condition: null },
  ],
};

export const MISC_CONFIG = {
  id: "MISC_CONFIG",
  name: "Misc Config",
  ui: UI.FULL,
  type: NODE_TYPE.CONFIG_MENU,
  parent: null,
  description: "Hardware-specific settings. Number and content of items varies by light model.",
  exitMethod: null,
  group: "config",
  brightness: 10,
  enteredFrom: "OFF",
  enteredVia: "9H",
  returnsTo: "OFF",
  menuItems: [
    { position: 1, name: "Tint ramp style",  default: 0, valueScheme: "0 = smooth, 1 = middle only, 2 = extremes only, 3+ = N steps" },
    { position: 2, name: "Jump start level", default: 0, valueScheme: "ramp level 1–150 for low-level startup pulse (0 = off)" },
  ],
  transitions: [
    { action: "1C", target: "OFF", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Exit config (return to Off)", condition: null },
  ],
};

export const TACTICAL_CONFIG = {
  id: "TACTICAL_CONFIG",
  name: "Tactical Config",
  ui: UI.FULL,
  type: NODE_TYPE.CONFIG_MENU,
  parent: null,
  description: "Configure what each of the three tactical slots does.",
  exitMethod: null,
  group: "config",
  brightness: 10,
  enteredFrom: "TACTICAL_MODE",
  enteredVia: "7H",
  returnsTo: "TACTICAL_MODE",
  menuItems: [
    { position: 1, name: "Tactical slot 1", default: 120, valueScheme: "1–150 = ramp level, 0 = last strobe, 151+ = specific strobe mode" },
    { position: 2, name: "Tactical slot 2", default: 60,  valueScheme: "same scheme" },
    { position: 3, name: "Tactical slot 3", default: 152, valueScheme: "same scheme" },
  ],
  transitions: [
    { action: "1C", target: "TACTICAL_MODE", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Exit config (return to Tactical)", condition: null },
  ],
};

export const CHANNEL_MODE_CONFIG = {
  id: "CHANNEL_MODE_CONFIG",
  name: "Channel Mode Config",
  ui: UI.FULL,
  type: NODE_TYPE.CONFIG_MENU,
  parent: null,
  description: "Enable/disable individual channel modes. Multi-channel lights only.",
  exitMethod: null,
  group: "config",
  brightness: 10,
  enteredFrom: "RAMP",
  enteredVia: "9H",
  returnsTo: "RAMP",
  menuItems: [
    { position: "N", name: "Channel mode N", default: 1, valueScheme: "1 = enable, 0 = disable" },
  ],
  transitions: [
    { action: "1C", target: "RAMP", ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE, description: "Exit config (return to Ramp)", condition: null },
  ],
};
