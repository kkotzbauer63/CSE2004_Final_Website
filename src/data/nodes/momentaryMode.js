import { UI, NODE_TYPE, TRANSITION_KIND } from "../constants.js";

export const MOMENTARY_MODE = {
  id: "MOMENTARY_MODE",
  name: "Momentary",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: null,
  description: "Light on only while button is held. Uses ramp memory or last strobe. Disconnect power to exit.",
  exitMethod: "disconnect_power",
  group: "special",
  brightness: 50,

  transitions: [
    { action: "hold",             target: "_self", ui: UI.FULL, kind: TRANSITION_KIND.MOMENTARY, description: "Light on while held, off when released", condition: null, momentary: true },
    { action: "disconnect",       target: "OFF",   ui: UI.FULL, kind: TRANSITION_KIND.NAVIGATE,  description: "Disconnect power to exit",               condition: null },
  ],
};
