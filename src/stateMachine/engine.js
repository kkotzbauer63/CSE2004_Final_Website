// engine.js — State machine engine (pure functions, no React)
import states from "./states.js";

/**
 * Get all transitions available from a given state in a given UI mode.
 */
export function getAvailableTransitions(state, uiMode) {
  const stateData = states[state];
  if (!stateData) return [];

  return stateData.transitions.filter(
    (t) => t.ui === "any" || t.ui === uiMode
  );
}

/**
 * Process an input in the current state and UI mode.
 * Returns the new state and the action description, or null if no match.
 */
export function processInput(currentState, input, uiMode) {
  const transitions = getAvailableTransitions(currentState, uiMode);
  const match = transitions.find((t) => t.input === input);

  if (!match) {
    return { state: currentState, action: null, transition: null };
  }

  return {
    state: match.target,
    action: match.action,
    transition: match,
  };
}

/**
 * Get state metadata (name, description, group, brightness).
 */
export function getStateInfo(stateId) {
  const stateData = states[stateId];
  if (!stateData) return null;

  return {
    id: stateId,
    name: stateData.name,
    description: stateData.description,
    group: stateData.group,
    brightness: stateData.brightness,
  };
}

/**
 * Get all state IDs.
 */
export function getAllStates() {
  return Object.keys(states);
}

/**
 * Get all state IDs visible in a given UI mode.
 * A state is visible if it has at least one incoming transition in that mode,
 * or is the "off" state.
 */
export function getVisibleStates(uiMode) {
  const reachable = new Set(["off"]);

  for (const stateId of Object.keys(states)) {
    const transitions = getAvailableTransitions(stateId, uiMode);
    for (const t of transitions) {
      reachable.add(t.target);
    }
  }

  return Array.from(reachable);
}
