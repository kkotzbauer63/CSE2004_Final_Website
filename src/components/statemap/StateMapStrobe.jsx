// Expanded strobe view — shown when currentState is a strobe state in Advanced UI
import { useMemo } from "react";
import { stateGroups } from "../../stateMachine/states.js";
import { getStateInfo, getAvailableTransitions } from "../../stateMachine/engine.js";
import { STROBE_POSITIONS } from "./statemapLayouts.js";
import { ArrowDef, EdgeLine, StateNode } from "./StateMapPrimitives.jsx";

export default function StateMapStrobe({ currentState, visibleStates, reachableFromCurrent, onGoToState, uiMode }) {
  const strobeVisible = Object.keys(STROBE_POSITIONS).filter(
    (s) => s === "OFF" || visibleStates.includes(s)
  );

  const strobeEdges = useMemo(() => {
    const transitions = getAvailableTransitions(currentState, uiMode);
    const edgeMap = new Map();
    for (const t of transitions) {
      if (t.target === currentState || !STROBE_POSITIONS[t.target]) continue;
      const key = `${currentState}->${t.target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { from: currentState, to: t.target, inputs: [] });
      edgeMap.get(key).inputs.push(t.action);
    }
    return Array.from(edgeMap.values());
  }, [currentState, uiMode]);

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">Strobe Modes</h3>
        <span className="statemap__mode">Advanced UI</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 540 320" xmlns="http://www.w3.org/2000/svg">
          <ArrowDef />
          <rect x="30" y="50" width="480" height="230" rx="4" fill="none" stroke="#2a2a2c" strokeWidth="1" strokeDasharray="4 4" />
          <text x="270" y="300" textAnchor="middle" className="statemap__ring-label">2C / 4C cycles through modes</text>

          {strobeEdges.map((e) => (
            <EdgeLine
              key={`${e.from}-${e.to}`}
              from={STROBE_POSITIONS[e.from]}
              to={STROBE_POSITIONS[e.to]}
              inputs={e.inputs}
            />
          ))}

          {strobeVisible.map((stateId) => {
            const pos = STROBE_POSITIONS[stateId];
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
          <span className="statemap__legend-dot" style={{ background: stateGroups.strobe.color }} />
          Strobe Modes
        </span>
        <span className="statemap__legend-item">
          <span className="statemap__legend-dot" style={{ background: stateGroups.core.color }} />
          Core (Off)
        </span>
      </div>
    </div>
  );
}
