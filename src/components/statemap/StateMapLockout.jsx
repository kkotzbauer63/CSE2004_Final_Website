// Expanded lockout view — shown when currentState is LOCKOUT or AUTO_LOCK_CONFIG in Advanced UI
import { useMemo } from "react";
import { stateGroups } from "../../stateMachine/states.js";
import { getStateInfo, getAvailableTransitions } from "../../stateMachine/engine.js";
import { LOCKOUT_POSITIONS } from "./statemapLayouts.js";
import { ArrowDef, EdgeLine, StateNode } from "./StateMapPrimitives.jsx";

export default function StateMapLockout({ currentState, reachableFromCurrent, onGoToState, uiMode }) {
  const lockoutEdges = useMemo(() => {
    const transitions = getAvailableTransitions("LOCKOUT", uiMode);
    const edgeMap = new Map();
    for (const t of transitions) {
      if (t.target === "LOCKOUT" || t.target === "_self" || !LOCKOUT_POSITIONS[t.target]) continue;
      const key = `LOCKOUT->${t.target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { from: "LOCKOUT", to: t.target, inputs: [] });
      edgeMap.get(key).inputs.push(t.action);
    }
    return Array.from(edgeMap.values());
  }, [uiMode]);

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">Lockout Mode</h3>
        <span className="statemap__mode">Advanced UI</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg">
          <ArrowDef />
          {lockoutEdges.map((e) => (
            <EdgeLine
              key={`${e.from}-${e.to}`}
              from={LOCKOUT_POSITIONS[e.from]}
              to={LOCKOUT_POSITIONS[e.to]}
              inputs={e.inputs}
            />
          ))}
          {Object.keys(LOCKOUT_POSITIONS).map((stateId) => {
            const pos = LOCKOUT_POSITIONS[stateId];
            const info = getStateInfo(stateId);
            return (
              <StateNode
                key={stateId}
                pos={pos} info={info}
                isCurrent={stateId === currentState}
                isReachable={reachableFromCurrent.has(stateId)}
                onClick={() => onGoToState(stateId)}
              />
            );
          })}
        </svg>
      </div>
      <div className="statemap__legend">
        <span className="statemap__legend-item">
          <span className="statemap__legend-dot" style={{ background: stateGroups.core.color }} />
          Core
        </span>
        <span className="statemap__legend-item">
          <span className="statemap__legend-dot" style={{ background: stateGroups.config.color }} />
          Config Menus
        </span>
      </div>
    </div>
  );
}
