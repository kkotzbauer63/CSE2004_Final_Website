// graph.js — assembles all nodes into the full graph and provides lookup helpers
import { NODE_TYPE } from "./constants.js";
import { OFF } from "./nodes/off.js";
import { RAMP } from "./nodes/ramp.js";
import { LOCKOUT } from "./nodes/lockout.js";
import {
  BLINKY_GROUP, BATTERY_CHECK, TEMPERATURE_CHECK, BEACON, SOS,
} from "./nodes/blinkyGroup.js";
import {
  STROBE_GROUP, PARTY_STROBE, TACTICAL_STROBE, POLICE_STROBE,
  LIGHTNING, CANDLE, BIKE_FLASHER,
} from "./nodes/strobeGroup.js";
import {
  TACTICAL_MODE, TACTICAL_SLOT_1, TACTICAL_SLOT_2, TACTICAL_SLOT_3,
} from "./nodes/tacticalMode.js";
import { MOMENTARY_MODE } from "./nodes/momentaryMode.js";
import {
  RAMP_CONFIG, RAMP_EXTRAS_CONFIG, SIMPLE_UI_CONFIG,
  VOLTAGE_CONFIG, THERMAL_CONFIG, AUTO_LOCK_CONFIG,
  MISC_CONFIG, TACTICAL_CONFIG, CHANNEL_MODE_CONFIG,
} from "./nodes/configMenus.js";
import { VERSION_CHECK, FACTORY_RESET } from "./nodes/actions.js";
import { AUX_PATTERN_CONFIG, AUX_COLOR_CONFIG } from "./nodes/auxConfig.js";
import { SUNSET_TIMER } from "./nodes/sunsetTimer.js";

// ─── Full node list ───────────────────────────────────────────────────────────

const ALL_NODES = [
  // Core states
  OFF, RAMP, LOCKOUT,
  // Blinky group
  BLINKY_GROUP, BATTERY_CHECK, TEMPERATURE_CHECK, BEACON, SOS,
  // Strobe group
  STROBE_GROUP, PARTY_STROBE, TACTICAL_STROBE, POLICE_STROBE, LIGHTNING, CANDLE, BIKE_FLASHER,
  // Tactical / special
  TACTICAL_MODE, TACTICAL_SLOT_1, TACTICAL_SLOT_2, TACTICAL_SLOT_3,
  MOMENTARY_MODE,
  // Config menus
  RAMP_CONFIG, RAMP_EXTRAS_CONFIG, SIMPLE_UI_CONFIG,
  VOLTAGE_CONFIG, THERMAL_CONFIG, AUTO_LOCK_CONFIG,
  MISC_CONFIG, TACTICAL_CONFIG, CHANNEL_MODE_CONFIG,
  // Aux config states
  AUX_PATTERN_CONFIG, AUX_COLOR_CONFIG,
  // Sunset timer
  SUNSET_TIMER,
  // Special action states
  VERSION_CHECK, FACTORY_RESET,
];

// ─── Keyed lookup ─────────────────────────────────────────────────────────────

/** Map from node ID → node object */
export const nodeMap = Object.fromEntries(ALL_NODES.map((n) => [n.id, n]));

// ─── Derived sets ─────────────────────────────────────────────────────────────

/** All top-level node IDs (no parent) */
export const topLevelIds = ALL_NODES.filter((n) => !n.parent).map((n) => n.id);

/** All container node IDs */
export const containerIds = ALL_NODES
  .filter((n) => n.type === NODE_TYPE.CONTAINER)
  .map((n) => n.id);

// ─── Transition helpers ───────────────────────────────────────────────────────

/**
 * Get a node's effective transitions:
 * children inherit sharedTransitions from their parent container,
 * plus any transitions defined directly on the child.
 */
export function getEffectiveTransitions(nodeId) {
  const node = nodeMap[nodeId];
  if (!node) return [];
  const parent = node.parent ? nodeMap[node.parent] : null;
  const shared = parent?.sharedTransitions ?? [];
  return [...shared, ...node.transitions];
}

/**
 * Resolve a container node to its concrete entry-point child ID.
 * Uses `lastUsedStrobeId` hint for strobe group "last_used" entry point.
 */
export function resolveContainerEntry(nodeId, lastUsedStrobeId = null) {
  const node = nodeMap[nodeId];
  if (!node || node.type !== NODE_TYPE.CONTAINER) return nodeId;
  if (node.entryPoint === "last_used") {
    return lastUsedStrobeId ?? node.childIds[0];
  }
  return node.entryPoint ?? node.childIds[0];
}

// ─── Visualization helpers ────────────────────────────────────────────────────

/** Color groups for state map visualization — keyed by node `group` field */
export const stateGroups = {
  core:    { name: "Core",             color: "#D4A84B" },
  strobe:  { name: "Strobe / Mood",    color: "#4BA8D4" },
  blinky:  { name: "Blinky / Utility", color: "#7BD44B" },
  special: { name: "Special Modes",    color: "#D44B7B" },
  config:  { name: "Config Menus",     color: "#8B8B8B" },
};

export default ALL_NODES;
