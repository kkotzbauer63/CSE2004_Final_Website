// engine.js — State machine engine (pure functions, no React)
// Uses the new data layer from src/data/graph.js
import { nodeMap, getEffectiveTransitions, resolveContainerEntry } from "../data/graph.js";
import { NODE_TYPE } from "../data/constants.js";

/**
 * Get all transitions visible from a given node in a given UI mode.
 * Does not filter by conditions (conditions are display-only; engine assumes default hardware).
 */
export function getAvailableTransitions(nodeId, uiMode) {
  const transitions = getEffectiveTransitions(nodeId);
  return transitions.filter(
    (t) => t.ui === "any" || t.ui === uiMode
  );
}

/**
 * Process a button input in the current node and UI mode.
 * Returns { state, action, transition } where:
 *   state  — new node ID to navigate to
 *   action — human-readable description of what happened (for display)
 *   transition — the matched transition object (may include simulator extensions)
 *
 * Returns { state: currentState, action: null, transition: null } if no match.
 */
export function processInput(currentNodeId, input, uiMode, lastUsedStrobeId = null) {
  const transitions = getAvailableTransitions(currentNodeId, uiMode);
  const match = transitions.find((t) => t.action === input);

  if (!match) {
    return { state: currentNodeId, action: null, transition: null };
  }

  // Determine the concrete target node
  let targetId = match.target === "_self" ? currentNodeId : match.target;

  if (match.target === "_next" || match.target === "_prev") {
    const currentNode = nodeMap[currentNodeId];
    const parent = currentNode?.parent ? nodeMap[currentNode.parent] : null;
    const childIds = parent?.childIds ?? [];
    const index = childIds.indexOf(currentNodeId);
    if (index !== -1 && childIds.length > 0) {
      const offset = match.target === "_next" ? 1 : -1;
      targetId = childIds[(index + offset + childIds.length) % childIds.length];
    }
  }

  // If target is a container, resolve it to its concrete entry-point child
  if (nodeMap[targetId]?.type === NODE_TYPE.CONTAINER) {
    targetId = resolveContainerEntry(targetId, lastUsedStrobeId);
  }

  return {
    state: targetId,
    action: match.description,   // human-readable description for display
    transition: match,
  };
}

/**
 * Get metadata for a node (name, description, group, type, brightness).
 */
export function getStateInfo(nodeId) {
  const node = nodeMap[nodeId];
  if (!node) return null;
  return {
    id:          node.id,
    name:        node.name,
    description: node.description,
    group:       node.group,
    type:        node.type,
    brightness:  node.brightness ?? 0,
  };
}

/**
 * Get all node IDs in the graph.
 */
export function getAllStates() {
  return Object.keys(nodeMap);
}

/**
 * Get all node IDs reachable in a given UI mode.
 * "OFF" is always included as the base state.
 */
export function getVisibleStates(uiMode) {
  const reachable = new Set(["OFF"]);

  for (const nodeId of Object.keys(nodeMap)) {
    const transitions = getAvailableTransitions(nodeId, uiMode);
    for (const t of transitions) {
      if (t.target !== "_self" && t.target !== "_next" && t.target !== "_prev") {
        reachable.add(t.target);
        const targetNode = nodeMap[t.target];
        if (targetNode?.type === NODE_TYPE.CONTAINER) {
          targetNode.childIds?.forEach((childId) => reachable.add(childId));
        }
      } else if (t.target === "_next" || t.target === "_prev") {
        const parent = nodeMap[nodeId]?.parent ? nodeMap[nodeMap[nodeId].parent] : null;
        parent?.childIds?.forEach((childId) => reachable.add(childId));
      }
    }
  }

  return Array.from(reachable);
}
