// states.js — Anduril 2 state machine data (hardcoded from UI Reference Table)
// Pure data, no React

const states = {
  off: {
    name: "Off",
    group: "core",
    description: "Light is off. Aux LEDs may be active.",
    brightness: 0,
    transitions: [
      { input: "1C", target: "ramp", action: "On (ramp mode, memorized level)", ui: "any" },
      { input: "1H", target: "ramp", action: "On (ramp mode, floor level)", ui: "any", brightnessHint: "floor" },
      { input: "2C", target: "ramp", action: "On (ramp mode, ceiling level)", ui: "any", brightnessHint: "ceiling" },
      { input: "2H", target: "ramp", action: "On (momentary ceiling level)", ui: "simple", brightnessHint: "ceiling", momentary: true },
      { input: "2H", target: "ramp", action: "On (momentary turbo)", ui: "full", brightnessHint: "turbo", momentary: true },
      { input: "3C", target: "battcheck", action: "Battery check", ui: "any" },
      { input: "3H", target: "strobe", action: "Strobe mode (whichever was used last)", ui: "full" },
      { input: "4C", target: "lockout", action: "Lockout mode", ui: "any" },
      { input: "5C", target: "momentary", action: "Momentary mode", ui: "full" },
      { input: "6C", target: "tactical", action: "Tactical mode", ui: "full" },
      { input: "7C", target: "off", action: "Aux LEDs: Next pattern", ui: "full" },
      { input: "7H", target: "off", action: "Aux LEDs: Next color", ui: "full" },
      { input: "9H", target: "config_misc", action: "Misc config menu", ui: "full" },
      { input: "10C", target: "off", action: "Enable Simple UI", ui: "full", setsUiMode: "simple" },
      { input: "10H", target: "off", action: "Disable Simple UI", ui: "simple", setsUiMode: "full" },
      { input: "10H", target: "config_simpleui", action: "Simple UI ramp config menu", ui: "full" },
      { input: "13H", target: "off", action: "Factory reset", ui: "any" },
      { input: "15+C", target: "off", action: "Version check", ui: "any" },
    ]
  },

  ramp: {
    name: "Ramp",
    group: "core",
    description: "Light is on. Smooth or stepped ramping mode.",
    brightness: 50,
    transitions: [
      { input: "1C", target: "off", action: "Off", ui: "any" },
      { input: "1H", target: "ramp", action: "Ramp up (with reversing)", ui: "any", rampEffect: "up" },
      { input: "2H", target: "ramp", action: "Ramp down", ui: "any", rampEffect: "down" },
      { input: "2C", target: "ramp", action: "Go to/from ceiling or turbo", ui: "any", brightnessHint: "ceiling" },
      { input: "3C", target: "ramp", action: "Change ramp style (smooth / stepped)", ui: "full" },
      { input: "3H", target: "ramp", action: "Momentary turbo", ui: "full", brightnessHint: "turbo", momentary: true },
      { input: "4C", target: "lockout", action: "Lockout mode", ui: "any" },
      { input: "5C", target: "momentary", action: "Momentary mode", ui: "full" },
      { input: "5H", target: "ramp", action: "Sunset timer on, add 5 minutes", ui: "full" },
      { input: "7H", target: "config_ramp", action: "Ramp config menu", ui: "full" },
      { input: "10C", target: "ramp", action: "Save manual memory (current brightness)", ui: "full" },
      { input: "10H", target: "config_rampextras", action: "Ramp Extras config menu", ui: "full" },
    ]
  },

  lockout: {
    name: "Lockout",
    group: "core",
    description: "Light is locked. Prevents accidental activation.",
    brightness: 0,
    transitions: [
      { input: "1C", target: "lockout", action: "Momentary moon (lowest floor)", ui: "any", momentary: true, brightnessHint: "moon" },
      { input: "1H", target: "lockout", action: "Momentary moon (lowest floor)", ui: "any", momentary: true, brightnessHint: "moon" },
      { input: "2C", target: "lockout", action: "Momentary moon (highest floor)", ui: "any", momentary: true, brightnessHint: "moon" },
      { input: "2H", target: "lockout", action: "Momentary moon (highest floor)", ui: "any", momentary: true, brightnessHint: "moon" },
      { input: "3C", target: "off", action: "Unlock (go to Off mode)", ui: "any" },
      { input: "3H", target: "lockout", action: "Next channel mode", ui: "any" },
      { input: "4C", target: "ramp", action: "On (ramp mode, memorized level)", ui: "any" },
      { input: "4H", target: "ramp", action: "On (ramp mode, floor level)", ui: "any", brightnessHint: "floor" },
      { input: "5C", target: "ramp", action: "On (ramp mode, ceiling level)", ui: "any", brightnessHint: "ceiling" },
      { input: "7C", target: "lockout", action: "Aux LEDs: Next pattern", ui: "full" },
      { input: "7H", target: "lockout", action: "Aux LEDs: Next color", ui: "full" },
      { input: "10H", target: "config_autolock", action: "Auto-lock config menu", ui: "full" },
    ]
  },

  strobe: {
    name: "Strobe",
    group: "strobe",
    description: "Strobe/tactical light modes: party, tactical, lightning, candle, biking.",
    brightness: 100,
    transitions: [
      { input: "1C", target: "off", action: "Off", ui: "full" },
      { input: "1H", target: "strobe", action: "Faster / brighter (varies by mode)", ui: "full" },
      { input: "2C", target: "strobe", action: "Next strobe mode", ui: "full" },
      { input: "2H", target: "strobe", action: "Slower / dimmer (varies by mode)", ui: "full" },
      { input: "3C", target: "strobe", action: "Next channel mode", ui: "full" },
      { input: "4C", target: "strobe", action: "Previous strobe mode", ui: "full" },
      { input: "5C", target: "momentary", action: "Momentary mode (using current strobe)", ui: "full" },
      { input: "5H", target: "strobe", action: "Sunset timer on, add 5 minutes", ui: "full" },
    ]
  },

  battcheck: {
    name: "Battery Check",
    group: "blinky",
    description: "Blinks out battery voltage (e.g., 3 blinks, pause, 8 blinks = 3.8V).",
    brightness: 30,
    transitions: [
      { input: "1C", target: "off", action: "Off", ui: "any" },
      { input: "2C", target: "tempcheck", action: "Next blinky mode (Temp check)", ui: "full" },
      { input: "3C", target: "battcheck", action: "Next channel mode", ui: "full" },
      { input: "7H", target: "config_voltage", action: "Voltage config menu", ui: "full" },
    ]
  },

  tempcheck: {
    name: "Temp Check",
    group: "blinky",
    description: "Blinks out the current temperature in Celsius.",
    brightness: 30,
    transitions: [
      { input: "1C", target: "off", action: "Off", ui: "full" },
      { input: "2C", target: "beacon", action: "Next blinky mode (Beacon)", ui: "full" },
      { input: "7H", target: "config_thermal", action: "Thermal config menu", ui: "full" },
    ]
  },

  beacon: {
    name: "Beacon",
    group: "blinky",
    description: "Periodic single flash at a configurable interval.",
    brightness: 100,
    transitions: [
      { input: "1C", target: "off", action: "Off", ui: "full" },
      { input: "1H", target: "beacon", action: "Configure beacon timing", ui: "full" },
      { input: "2C", target: "sos", action: "Next blinky mode (SOS)", ui: "full" },
    ]
  },

  sos: {
    name: "SOS",
    group: "blinky",
    description: "Flashes the Morse code SOS pattern (· · · — — — · · ·).",
    brightness: 100,
    transitions: [
      { input: "1C", target: "off", action: "Off", ui: "full" },
      { input: "2C", target: "battcheck", action: "Next blinky mode (Battery check)", ui: "full" },
    ]
  },

  momentary: {
    name: "Momentary",
    group: "special",
    description: "Light is on only while button is held. Disconnect power to exit.",
    brightness: 50,
    transitions: [
      { input: "1H", target: "momentary", action: "On while held, off when released", ui: "full", momentary: true },
      // Exit requires disconnecting power — simulated as a special action
      { input: "disconnect", target: "off", action: "Disconnect power to exit", ui: "full" },
    ]
  },

  tactical: {
    name: "Tactical",
    group: "special",
    description: "Momentary mode with 3 configurable slots. Hold for on, release for off.",
    brightness: 100,
    transitions: [
      { input: "1H", target: "tactical", action: "High (tactical slot 1)", ui: "full", momentary: true },
      { input: "2H", target: "tactical", action: "Low (tactical slot 2)", ui: "full", momentary: true },
      { input: "3H", target: "tactical", action: "Strobe (tactical slot 3)", ui: "full", momentary: true },
      { input: "6C", target: "off", action: "Exit (go back to Off mode)", ui: "full" },
      { input: "7H", target: "config_tactical", action: "Tactical mode config menu", ui: "full" },
    ]
  },

  // Config menu states — simplified representations
  config_misc: {
    name: "Misc Config",
    group: "config",
    description: "Miscellaneous configuration menu (varies per light).",
    brightness: 10,
    transitions: [
      { input: "1C", target: "off", action: "Exit config", ui: "full" },
    ]
  },

  config_simpleui: {
    name: "Simple UI Config",
    group: "config",
    description: "Configure Simple UI: floor, ceiling, steps, turbo style.",
    brightness: 10,
    transitions: [
      { input: "1C", target: "off", action: "Exit config", ui: "full" },
    ]
  },

  config_ramp: {
    name: "Ramp Config",
    group: "config",
    description: "Configure ramp: floor, ceiling, speed/steps.",
    brightness: 10,
    transitions: [
      { input: "1C", target: "ramp", action: "Exit config (return to ramp)", ui: "full" },
    ]
  },

  config_rampextras: {
    name: "Ramp Extras Config",
    group: "config",
    description: "Configure: auto mem, manual mem timeout, ramp after moon, turbo style, smooth steps.",
    brightness: 10,
    transitions: [
      { input: "1C", target: "ramp", action: "Exit config (return to ramp)", ui: "full" },
    ]
  },

  config_autolock: {
    name: "Auto-Lock Config",
    group: "config",
    description: "Set auto-lock timeout in minutes (0 = no auto-lock).",
    brightness: 10,
    transitions: [
      { input: "1C", target: "lockout", action: "Exit config (return to lockout)", ui: "full" },
    ]
  },

  config_voltage: {
    name: "Voltage Config",
    group: "config",
    description: "Configure voltage correction factor and display settings.",
    brightness: 10,
    transitions: [
      { input: "1C", target: "battcheck", action: "Exit config (return to batt check)", ui: "full" },
    ]
  },

  config_thermal: {
    name: "Thermal Config",
    group: "config",
    description: "Set current temperature and temperature limit.",
    brightness: 10,
    transitions: [
      { input: "1C", target: "tempcheck", action: "Exit config (return to temp check)", ui: "full" },
    ]
  },

  config_tactical: {
    name: "Tactical Config",
    group: "config",
    description: "Configure the 3 tactical mode slots.",
    brightness: 10,
    transitions: [
      { input: "1C", target: "tactical", action: "Exit config (return to tactical)", ui: "full" },
    ]
  },
};

// Group definitions for the state map visualization
export const stateGroups = {
  core: { name: "Core", color: "#D4A84B" },
  strobe: { name: "Strobe", color: "#4BA8D4" },
  blinky: { name: "Blinky / Utility", color: "#7BD44B" },
  special: { name: "Special Modes", color: "#D44B7B" },
  config: { name: "Config Menus", color: "#8B8B8B" },
};

export default states;
