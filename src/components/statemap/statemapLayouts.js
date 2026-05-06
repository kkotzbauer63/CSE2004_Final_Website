// Layout constants and cluster definitions for all StateMap sub-views
// Cluster node IDs now match the real container node IDs from data/graph.js

export const BLINKY_STATES = new Set([
  "BATTERY_CHECK", "TEMPERATURE_CHECK", "BEACON", "SOS",
  "VOLTAGE_CONFIG", "THERMAL_CONFIG",
]);

export const STROBE_STATES = new Set([
  "PARTY_STROBE", "TACTICAL_STROBE", "POLICE_STROBE",
  "LIGHTNING", "CANDLE", "BIKE_FLASHER",
]);

export const LOCKOUT_STATES = new Set([
  "LOCKOUT", "AUTO_LOCK_CONFIG",
]);

export const TACTICAL_STATES = new Set([
  "TACTICAL_MODE", "TACTICAL_SLOT_1", "TACTICAL_SLOT_2", "TACTICAL_SLOT_3", "TACTICAL_CONFIG",
]);

// States that trigger the expanded ramp view
export const RAMP_EXPANDED_STATES = new Set(["RAMP", "SUNSET_TIMER"]);

// States that trigger the expanded aux-config views
export const AUX_PATTERN_STATES = new Set(["AUX_PATTERN_CONFIG", "LOCKOUT_AUX_PATTERN_CONFIG"]);
export const AUX_COLOR_STATES   = new Set(["AUX_COLOR_CONFIG", "LOCKOUT_AUX_COLOR_CONFIG"]);

export const NODE_W = 110;
export const NODE_H = 36;
export const CLUSTER_W = 130;
export const CLUSTER_H = 42;

// Advanced UI default view (blinky + strobe shown as container cluster nodes)
// viewBox: "0 0 700 560"; OFF is the hub, with related states arranged radially.
export const DEFAULT_POSITIONS = {
  OFF:                { x: 295, y: 210 },
  RAMP:               { x: 295, y: 100  },
  LOCKOUT:            { x: 115, y: 210 },
  BLINKY_GROUP:       { x: 375,  y: 320  },
  STROBE_GROUP:       { x: 200,  y: 320 },
  MOMENTARY_MODE:     { x: 30,  y: 280 },
  TACTICAL_MODE:      { x: 475, y: 210 },
  MISC_CONFIG:        { x: 155, y: 45 },
  // Aux config states (accessible from Off via 7C / 7H)
  AUX_PATTERN_CONFIG: { x: 435, y: 45 },
  AUX_COLOR_CONFIG:   { x: 560, y: 140 },
  // Simple UI ramp config (accessible from Off via 10H in Advanced UI)
  SIMPLE_UI_CONFIG:   { x: 30, y: 140  },
  // Version check / factory reset
  VERSION_CHECK:      { x: 295, y: 385 },
  FACTORY_RESET:      { x: 560,  y: 280 },
};

// Simple UI view (fewer states, no cluster nodes)
export const SIMPLE_POSITIONS = {
  OFF:           { x: 230, y: 20 },
  RAMP:          { x: 230, y: 130 },
  LOCKOUT:       { x: 40,  y: 130 },
  BATTERY_CHECK: { x: 420, y: 20 },
};

// Expanded blinky view (Advanced UI only)
export const BLINKY_POSITIONS = {
  OFF:                { x: 250, y: 10  },
  BATTERY_CHECK:      { x: 100, y: 110 },
  TEMPERATURE_CHECK:  { x: 400, y: 110 },
  BEACON:             { x: 400, y: 220 },
  SOS:                { x: 100, y: 220 },
  VOLTAGE_CONFIG:     { x: 30,  y: 10 },
  THERMAL_CONFIG:     { x: 480, y: 10 },
};

// Expanded strobe view — six modes in a hexagonal ring, off in center
export const STROBE_POSITIONS = {
  OFF:              { x: 210, y: 130 },
  PARTY_STROBE:     { x: 210, y: 10  },
  TACTICAL_STROBE:  { x: 370, y: 70  },
  POLICE_STROBE:    { x: 370, y: 190 },
  LIGHTNING:        { x: 210, y: 250 },
  CANDLE:           { x: 50,  y: 190 },
  BIKE_FLASHER:     { x: 50,  y: 70  },
};

// Expanded ramp view — ramp bar plus surrounding nodes
export const RAMP_X = 200;
export const RAMP_Y = 30;
export const RAMP_W = 80;
export const RAMP_H = 280;

export const RAMP_EXPANDED_POSITIONS = {
  OFF:                { x: 30,  y: 70  },
  LOCKOUT:            { x: 30,  y: 210 },
  SUNSET_TIMER:       { x: 360, y: 45  },
  MOMENTARY_MODE:     { x: 360, y: 115 },
  RAMP_CONFIG:        { x: 360, y: 185 },
  RAMP_EXTRAS_CONFIG: { x: 360, y: 255 },
};

// Expanded lockout view
export const LOCKOUT_POSITIONS = {
  OFF:                        { x: 130,  y: 50  },
  LOCKOUT:                    { x: 235, y: 150 },
  RAMP:                       { x: 340, y: 50  },
  LOCKOUT_MOMENTARY_LOW:      { x: 130, y: 250 },
  LOCKOUT_MOMENTARY_MOON:     { x: 340,  y: 250 },
  LOCKOUT_AUX_PATTERN_CONFIG: { x: 405, y: 115 },
  LOCKOUT_AUX_COLOR_CONFIG:   { x: 405, y: 185 },
  AUTO_LOCK_CONFIG:           { x: 65, y: 150 },
};

// Expanded tactical mode view
export const TACTICAL_POSITIONS = {
  OFF:              { x: 40,  y: 65  },
  TACTICAL_MODE:    { x: 225, y: 120 },
  TACTICAL_SLOT_1:  { x: 425, y: 45  },
  TACTICAL_SLOT_2:  { x: 425, y: 120 },
  TACTICAL_SLOT_3:  { x: 425, y: 195 },
  TACTICAL_CONFIG:  { x: 40,  y: 180 },
};
