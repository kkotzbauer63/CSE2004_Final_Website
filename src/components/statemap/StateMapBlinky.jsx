// Expanded blinky / utility view — shown when currentState is a blinky state in Advanced UI
import { useMemo } from "react";
import { stateGroups } from "../../stateMachine/states.js";
import { getStateInfo, getAvailableTransitions } from "../../stateMachine/engine.js";
import { BLINKY_POSITIONS } from "./statemapLayouts.js";
import { ArrowDef, EdgeLine, StateNode } from "./StateMapPrimitives.jsx";

export default function StateMapBlinky({ currentState, visibleStates, reachableFromCurrent, onGoToState, uiMode }) {
  const blinkyVisible = Object.keys(BLINKY_POSITIONS).filter(
    (s) => visibleStates.includes(s) || s === "OFF"
  );

  const blinkyEdges = useMemo(() => {
    const transitions = getAvailableTransitions(currentState, uiMode);
    const edgeMap = new Map();
    for (const t of transitions) {
      if (t.target === currentState || !BLINKY_POSITIONS[t.target]) continue;
      const key = `${currentState}->${t.target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { from: currentState, to: t.target, inputs: [] });
      edgeMap.get(key).inputs.push(t.action);
    }
    return Array.from(edgeMap.values());
  }, [currentState, uiMode]);

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">Blinky / Utility Modes</h3>
        <span className="statemap__mode">Advanced UI</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 620 280" xmlns="http://www.w3.org/2000/svg">
          <ArrowDef />
          <rect x="70" y="90" width="470" height="180" rx="4" fill="none" stroke="#2a2a2c" strokeWidth="1" strokeDasharray="4 4" />
          <text x="305" y="260" textAnchor="middle" className="statemap__ring-label">2C cycles through modes</text>

          {blinkyEdges.map((e) => (
            <EdgeLine
              key={`${e.from}-${e.to}`}
              from={BLINKY_POSITIONS[e.from]}
              to={BLINKY_POSITIONS[e.to]}
              inputs={e.inputs}
            />
          ))}

          {blinkyVisible.map((stateId) => {
            const pos = BLINKY_POSITIONS[stateId];
            if (!pos) return null;
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
          <span className="statemap__legend-dot" style={{ background: stateGroups.blinky.color }} />
          Blinky / Utility
        </span>
        <span className="statemap__legend-item">
          <span className="statemap__legend-dot" style={{ background: stateGroups.config.color }} />
          Config Menus
        </span>
        <span className="statemap__legend-item">
          <span className="statemap__legend-dot" style={{ background: stateGroups.core.color }} />
          Core (Off)
        </span>
      </div>
    </div>
  );
}
