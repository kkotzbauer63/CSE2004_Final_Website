// StateMap — orchestrator that picks the correct sub-view based on current state and UI mode
import { useMemo } from "react";
import { getAvailableTransitions, getVisibleStates } from "../stateMachine/engine.js";
import {
  BLINKY_STATES, BLINKY_CLUSTER,
  STROBE_STATES, STROBE_CLUSTER,
  DEFAULT_POSITIONS, SIMPLE_POSITIONS,
} from "./statemap/statemapLayouts.js";
import StateMapSimple   from "./statemap/StateMapSimple.jsx";
import StateMapAdvanced from "./statemap/StateMapAdvanced.jsx";
import StateMapRamp     from "./statemap/StateMapRamp.jsx";
import StateMapBlinky   from "./statemap/StateMapBlinky.jsx";
import StateMapStrobe   from "./statemap/StateMapStrobe.jsx";
import "./StateMap.css";

export default function StateMap({ currentState, uiMode, onGoToState, level = 0 }) {
  const isAdvanced       = uiMode === "full";
  const inBlinkyExpanded = isAdvanced && BLINKY_STATES.has(currentState);
  const inStrobeExpanded = isAdvanced && STROBE_STATES.has(currentState);
  const inRampExpanded   = currentState === "ramp";

  const visibleStates = useMemo(() => getVisibleStates(uiMode), [uiMode]);

  const reachableFromCurrent = useMemo(() => {
    const transitions = getAvailableTransitions(currentState, uiMode);
    return new Set(transitions.map((t) => t.target));
  }, [currentState, uiMode]);

  // Edges for the default / simple view (not used when a sub-cluster is expanded)
  const defaultEdges = useMemo(() => {
    if (inBlinkyExpanded || inStrobeExpanded || inRampExpanded) return [];
    const transitions = getAvailableTransitions(currentState, uiMode);
    const edgeMap = new Map();
    const positions = isAdvanced ? DEFAULT_POSITIONS : SIMPLE_POSITIONS;
    for (const t of transitions) {
      let target = t.target;
      if (isAdvanced && BLINKY_STATES.has(target)) target = BLINKY_CLUSTER;
      if (isAdvanced && STROBE_STATES.has(target)) target = STROBE_CLUSTER;
      if (target === currentState || !positions[target]) continue;
      const key = `${currentState}->${target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { from: currentState, to: target, inputs: [] });
      edgeMap.get(key).inputs.push(t.input);
    }
    return Array.from(edgeMap.values());
  }, [currentState, uiMode, isAdvanced, inBlinkyExpanded, inStrobeExpanded, inRampExpanded]);

  if (inBlinkyExpanded) {
    return (
      <StateMapBlinky
        currentState={currentState}
        visibleStates={visibleStates}
        reachableFromCurrent={reachableFromCurrent}
        onGoToState={onGoToState}
        uiMode={uiMode}
      />
    );
  }

  if (inStrobeExpanded) {
    return (
      <StateMapStrobe
        currentState={currentState}
        visibleStates={visibleStates}
        reachableFromCurrent={reachableFromCurrent}
        onGoToState={onGoToState}
        uiMode={uiMode}
      />
    );
  }

  if (inRampExpanded) {
    return (
      <StateMapRamp
        isAdvanced={isAdvanced}
        level={level}
        reachableFromCurrent={reachableFromCurrent}
        onGoToState={onGoToState}
        uiMode={uiMode}
      />
    );
  }

  if (!isAdvanced) {
    return (
      <StateMapSimple
        visibleStates={visibleStates}
        defaultEdges={defaultEdges}
        currentState={currentState}
        reachableFromCurrent={reachableFromCurrent}
        onGoToState={onGoToState}
      />
    );
  }

  return (
    <StateMapAdvanced
      visibleStates={visibleStates}
      defaultEdges={defaultEdges}
      currentState={currentState}
      reachableFromCurrent={reachableFromCurrent}
      onGoToState={onGoToState}
    />
  );
}
