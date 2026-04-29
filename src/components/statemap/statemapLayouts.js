// Layout constants and cluster definitions for all StateMap sub-views

export const BLINKY_STATES = new Set([
  "battcheck", "tempcheck", "beacon", "sos",
  "config_voltage", "config_thermal",
]);

export const BLINKY_CLUSTER = "_blinky_cluster";

export const STROBE_STATES = new Set([
  "strobe_party", "strobe_tactical", "strobe_police",
  "strobe_lightning", "strobe_candle", "strobe_biking",
]);

export const STROBE_CLUSTER = "_strobe_cluster";

export const NODE_W = 110;
export const NODE_H = 36;
export const CLUSTER_W = 130;
export const CLUSTER_H = 42;

// Advanced UI default view (blinky + strobe collapsed into cluster nodes)
export const DEFAULT_POSITIONS = {
  off:               { x: 280, y: 30 },
  ramp:              { x: 280, y: 140 },
  lockout:           { x: 80, y: 85 },
  [BLINKY_CLUSTER]:  { x: 500, y: 30 },
  [STROBE_CLUSTER]:  { x: 80, y: 230 },
  momentary:         { x: 220, y: 300 },
  tactical:          { x: 50, y: 330 },
  config_misc:       { x: 480, y: 140 },
  config_simpleui:   { x: 120, y: 0 },
  config_ramp:       { x: 480, y: 240 },
  config_rampextras: { x: 310, y: 300 },
  config_autolock:   { x: 50, y: 160 },
  config_tactical:   { x: 50, y: 400 },
};

// Simple UI view (fewer states, no clusters)
export const SIMPLE_POSITIONS = {
  off:       { x: 220, y: 30 },
  ramp:      { x: 220, y: 140 },
  lockout:   { x: 60, y: 85 },
  battcheck: { x: 420, y: 30 },
};

// Expanded blinky view (advanced UI only)
export const BLINKY_POSITIONS = {
  off:            { x: 250, y: 10 },
  battcheck:      { x: 100, y: 110 },
  tempcheck:      { x: 400, y: 110 },
  beacon:         { x: 400, y: 220 },
  sos:            { x: 100, y: 220 },
  config_voltage: { x: 10,  y: 200 },
  config_thermal: { x: 490, y: 200 },
};

// Expanded strobe view — six modes in a hexagonal ring, off in center
export const STROBE_POSITIONS = {
  off:              { x: 210, y: 130 },
  strobe_party:     { x: 210, y: 10  },
  strobe_tactical:  { x: 370, y: 70  },
  strobe_police:    { x: 370, y: 190 },
  strobe_lightning: { x: 210, y: 250 },
  strobe_candle:    { x: 50,  y: 190 },
  strobe_biking:    { x: 50,  y: 70  },
};

// Expanded ramp view
export const RAMP_X = 200;
export const RAMP_Y = 30;
export const RAMP_W = 80;
export const RAMP_H = 280;

export const RAMP_EXPANDED_POSITIONS = {
  off:               { x: 30,  y: 70 },
  lockout:           { x: 30,  y: 210 },
  momentary:         { x: 360, y: 115 },
  config_ramp:       { x: 360, y: 185 },
  config_rampextras: { x: 360, y: 255 },
};
