// filterGraph.js — pure filter functions for nodes and transitions

/**
 * Whether a ui property is visible under the given active UI mode.
 * "any" is always visible; otherwise must match exactly.
 */
export function isVisible(uiProp, activeUI) {
  return uiProp === "any" || uiProp === activeUI;
}

/**
 * Filter transitions by UI mode and active hardware conditions.
 * Transitions with no condition always pass.
 *
 * @param {Array}  transitions
 * @param {string} activeUI        — "simple" | "full"
 * @param {Set}    activeConditions — set of active condition strings (may be empty)
 */
export function filterTransitions(transitions, activeUI, activeConditions = new Set()) {
  return transitions.filter((t) => {
    if (!isVisible(t.ui, activeUI)) return false;
    if (t.condition && !activeConditions.has(t.condition)) return false;
    return true;
  });
}
