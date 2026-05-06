import { UI, TRANSITION_KIND } from "../data/constants.js";

export const STROBE_MODE_ORDER = [
  "PARTY_STROBE",
  "TACTICAL_STROBE",
  "POLICE_STROBE",
  "LIGHTNING",
  "CANDLE",
  "BIKE_FLASHER",
];

export const STROBE_MODE_DEFINITIONS = {
  PARTY_STROBE: {
    name: "Party Strobe",
    description: "Motion-freezing strobe for spinning fans, falling water, and other fast motion.",
    brightness: 100,
    adjustable: "speed",
    increaseLabel: "Faster",
    decreaseLabel: "Slower",
  },
  TACTICAL_STROBE: {
    name: "Tactical Strobe",
    description: "Disorienting strobe with a fixed 33% duty cycle. Watch heat during long use.",
    brightness: 100,
    adjustable: "speed",
    increaseLabel: "Faster",
    decreaseLabel: "Slower",
  },
  POLICE_STROBE: {
    name: "Police Strobe",
    description: "Two-color police-style strobe for lights with two or more emitter colors.",
    brightness: 100,
    adjustable: "speed",
    increaseLabel: "Faster",
    decreaseLabel: "Slower",
  },
  LIGHTNING: {
    name: "Lightning",
    description: "Random brightness and random timing to simulate a busy lightning storm. May hit full power suddenly.",
    brightness: 100,
    adjustable: null,
  },
  CANDLE: {
    name: "Candle",
    description: "Random brightness pattern resembling a candle flame. Brightness is configurable and sunset timer is available.",
    brightness: 30,
    adjustable: "brightness",
    increaseLabel: "Brighter",
    decreaseLabel: "Dimmer",
    extraActions: [
      { action: "5H", target: "_self", description: "Sunset timer" },
    ],
  },
  BIKE_FLASHER: {
    name: "Bike Flasher",
    description: "Medium output with a brighter stutter once per second. Brightness is configurable.",
    brightness: 50,
    adjustable: "brightness",
    increaseLabel: "Brighter",
    decreaseLabel: "Dimmer",
  },
};

export function getStrobeModeDefinition(modeId) {
  return STROBE_MODE_DEFINITIONS[modeId] ?? null;
}

export function getNextStrobeMode(modeId) {
  const index = STROBE_MODE_ORDER.indexOf(modeId);
  if (index === -1) return STROBE_MODE_ORDER[0];
  return STROBE_MODE_ORDER[(index + 1) % STROBE_MODE_ORDER.length];
}

export function getPreviousStrobeMode(modeId) {
  const index = STROBE_MODE_ORDER.indexOf(modeId);
  if (index === -1) return STROBE_MODE_ORDER[0];
  return STROBE_MODE_ORDER[(index - 1 + STROBE_MODE_ORDER.length) % STROBE_MODE_ORDER.length];
}

function transition(action, target, description, extras = {}) {
  return {
    action,
    target,
    ui: UI.FULL,
    kind: target === "_self" ? TRANSITION_KIND.INTERNAL : TRANSITION_KIND.NAVIGATE,
    description,
    condition: null,
    ...extras,
  };
}

export function buildStrobeModeTransitions(modeId) {
  const mode = getStrobeModeDefinition(modeId);
  const transitions = [];

  if (mode?.adjustable) {
    transitions.push(
      transition("1H", "_self", mode.increaseLabel, { rampEffect: "up" }),
      transition("2H", "_self", mode.decreaseLabel, { rampEffect: "down" }),
    );
  }

  for (const action of mode?.extraActions ?? []) {
    transitions.push(transition(action.action, action.target, action.description));
  }

  return transitions;
}
