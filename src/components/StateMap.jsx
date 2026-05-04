// StateMap — orchestrator that picks the correct sub-view based on current state and UI mode
import { useMemo } from "react";
import { getAvailableTransitions, getVisibleStates } from "../stateMachine/engine.js";
import { nodeMap } from "../data/graph.js";
import { NODE_TYPE } from "../data/constants.js";
import {
  BLINKY_STATES, STROBE_STATES, LOCKOUT_STATES, TACTICAL_STATES,
  RAMP_EXPANDED_STATES, AUX_PATTERN_STATES, AUX_COLOR_STATES,
  DEFAULT_POSITIONS, SIMPLE_POSITIONS,
} from "./statemap/statemapLayouts.js";
import StateMapSimple    from "./statemap/StateMapSimple.jsx";
import StateMapAdvanced  from "./statemap/StateMapAdvanced.jsx";
import StateMapRamp      from "./statemap/StateMapRamp.jsx";
import StateMapBlinky    from "./statemap/StateMapBlinky.jsx";
import StateMapStrobe    from "./statemap/StateMapStrobe.jsx";
import StateMapLockout   from "./statemap/StateMapLockout.jsx";
import StateMapTactical  from "./statemap/StateMapTactical.jsx";
import { StateMapAuxPattern, StateMapAuxColor } from "./statemap/StateMapAuxConfig.jsx";
import StateMapSunset    from "./statemap/StateMapSunset.jsx";
import StateMapConfigMenu from "./statemap/StateMapConfigMenu.jsx";
import "./StateMap.css";

export default function StateMap({
  currentState, uiMode, onGoToState, onInput, level = 0,
  rampStyle = "smooth", auxPatternIndex = 0, auxColorIndex = 0,
  sunsetSeconds = 0, sunsetSpeedMultiplier = 1, toggleSunsetSpeed = () => {},
}) {
  const isAdvanced         = uiMode === "full";
  const inConfigMenu       = nodeMap[currentState]?.type === NODE_TYPE.CONFIG_MENU;
  const inBlinkyExpanded   = !inConfigMenu && isAdvanced && BLINKY_STATES.has(currentState);
  const inStrobeExpanded   = isAdvanced && STROBE_STATES.has(currentState);
  const inLockoutExpanded  = !inConfigMenu && isAdvanced && LOCKOUT_STATES.has(currentState);
  const inTacticalExpanded = !inConfigMenu && isAdvanced && TACTICAL_STATES.has(currentState);
  const inSunsetExpanded   = currentState === "SUNSET_TIMER";
  const inRampExpanded     = !inSunsetExpanded && RAMP_EXPANDED_STATES.has(currentState);
  const inAuxPatternExpanded = isAdvanced && AUX_PATTERN_STATES.has(currentState);
  const inAuxColorExpanded   = isAdvanced && AUX_COLOR_STATES.has(currentState);

  const visibleStates = useMemo(() => getVisibleStates(uiMode), [uiMode]);

  const reachableFromCurrent = useMemo(() => {
    const transitions = getAvailableTransitions(currentState, uiMode);
    return new Set(transitions.map((t) => t.target));
  }, [currentState, uiMode]);

  // Edges for the default / simple view (not used when a sub-cluster is expanded)
  const defaultEdges = useMemo(() => {
    if (inConfigMenu) return [];
    if (inBlinkyExpanded || inStrobeExpanded || inLockoutExpanded || inTacticalExpanded || inRampExpanded) return [];
    if (inAuxPatternExpanded || inAuxColorExpanded || inSunsetExpanded) return [];
    const transitions = getAvailableTransitions(currentState, uiMode);
    const edgeMap = new Map();
    const positions = isAdvanced ? DEFAULT_POSITIONS : SIMPLE_POSITIONS;
    for (const t of transitions) {
      let target = t.target;
      if (isAdvanced && BLINKY_STATES.has(target)) target = "BLINKY_GROUP";
      if (isAdvanced && STROBE_STATES.has(target)) target = "STROBE_GROUP";
      if (target === currentState || !positions[target]) continue;
      const key = `${currentState}->${target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { from: currentState, to: target, inputs: [] });
      edgeMap.get(key).inputs.push(t.action);
    }
    return Array.from(edgeMap.values());
  }, [currentState, uiMode, isAdvanced, inConfigMenu, inBlinkyExpanded, inStrobeExpanded, inRampExpanded, inAuxPatternExpanded, inAuxColorExpanded]);

  if (inConfigMenu) {
    return (
      <StateMapConfigMenu
        node={nodeMap[currentState]}
        onGoToState={onGoToState}
        rampStyle={rampStyle}
      />
    );
  }

  if (inAuxPatternExpanded) {
    return (
      <StateMapAuxPattern
        auxPatternIndex={auxPatternIndex}
        onGoToState={onGoToState}
        onInput={onInput}
      />
    );
  }

  if (inAuxColorExpanded) {
    return (
      <StateMapAuxColor
        auxColorIndex={auxColorIndex}
        onGoToState={onGoToState}
        onInput={onInput}
      />
    );
  }

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

  if (inLockoutExpanded) {
    return (
      <StateMapLockout
        currentState={currentState}
        reachableFromCurrent={reachableFromCurrent}
        onGoToState={onGoToState}
        uiMode={uiMode}
      />
    );
  }

  if (inTacticalExpanded) {
    return (
      <StateMapTactical
        currentState={currentState}
        reachableFromCurrent={reachableFromCurrent}
        onGoToState={onGoToState}
        uiMode={uiMode}
      />
    );
  }

  if (inSunsetExpanded) {
    return (
      <StateMapSunset
        level={level}
        sunsetSeconds={sunsetSeconds}
        sunsetSpeedMultiplier={sunsetSpeedMultiplier}
        toggleSunsetSpeed={toggleSunsetSpeed}
        isAdvanced={isAdvanced}
        onGoToState={onGoToState}
      />
    );
  }

  if (inRampExpanded) {
    return (
      <StateMapRamp
        isAdvanced={isAdvanced}
        currentState={currentState}
        level={level}
        rampStyle={rampStyle}
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
        onInput={onInput}
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
      onInput={onInput}
    />
  );
}
