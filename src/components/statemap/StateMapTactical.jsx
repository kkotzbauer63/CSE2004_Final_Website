// Expanded tactical mode view — shown when currentState is TACTICAL_MODE or a slot in Advanced UI
import { useMemo } from "react";
import { stateGroups } from "../../stateMachine/states.js";
import { getStateInfo, getAvailableTransitions } from "../../stateMachine/engine.js";
import { TACTICAL_POSITIONS } from "./statemapLayouts.js";
import { ArrowDef, EdgeLine, StateNode } from "./StateMapPrimitives.jsx";

export default function StateMapTactical({ currentState, reachableFromCurrent, onGoToState, uiMode }) {
  // Edges always built from the container's transitions (slots have no own transitions)
  const tacticalEdges = useMemo(() => {
    const transitions = getAvailableTransitions("TACTICAL_MODE", uiMode);
    const edgeMap = new Map();
    for (const t of transitions) {
      if (!TACTICAL_POSITIONS[t.target]) continue;
      const key = `TACTICAL_MODE->${t.target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { from: "TACTICAL_MODE", to: t.target, inputs: [] });
      edgeMap.get(key).inputs.push(t.action);
    }
    return Array.from(edgeMap.values());
  }, [uiMode]);

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">Tactical Mode</h3>
        <span className="statemap__mode">Advanced UI</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 580 275" xmlns="http://www.w3.org/2000/svg">
          <ArrowDef />
          <rect x="383" y="20" width="185" height="235" rx="4"
            fill="none" stroke="#2a2a2c" strokeWidth="1" strokeDasharray="4 4" />
          <text x="475" y="268" textAnchor="middle" className="statemap__ring-label">
            momentary hold
          </text>
          {tacticalEdges.map((e) => (
            <EdgeLine
              key={`${e.from}-${e.to}`}
              from={TACTICAL_POSITIONS[e.from]}
              to={TACTICAL_POSITIONS[e.to]}
              inputs={e.inputs}
            />
          ))}
          {Object.keys(TACTICAL_POSITIONS).map((stateId) => {
            const pos = TACTICAL_POSITIONS[stateId];
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
          <span className="statemap__legend-dot" style={{ background: stateGroups.special.color }} />
          Special Modes
        </span>
        <span className="statemap__legend-item">
          <span className="statemap__legend-dot" style={{ background: stateGroups.config.color }} />
          Config Menus
        </span>
      </div>
    </div>
  );
}
