// Expanded strobe view — shown when currentState is a strobe state in Advanced UI
import { useMemo } from "react";
import { stateGroups } from "../../stateMachine/states.js";
import { getStateInfo, getAvailableTransitions } from "../../stateMachine/engine.js";
import { STROBE_POSITIONS } from "./statemapLayouts.js";
import { ArrowDef, EdgeLine, StateNode } from "./StateMapPrimitives.jsx";
import { getNextStrobeMode, getPreviousStrobeMode } from "../../utils/strobeModes.js";

function StrobeActionBox({ x, y, action, description, onClick }) {
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <rect x={x} y={y} width="140" height="30" rx="2"
        fill="#1c1c1e" stroke="#444" strokeWidth="1" strokeDasharray="4 3" />
      <text x={x + 16} y={y + 19} textAnchor="middle" className="statemap__edge-label">
        {action}
      </text>
      <text x={x + 76} y={y + 19} textAnchor="middle" className="statemap__node-label" fill="#888">
        {description}
      </text>
    </g>
  );
}

export default function StateMapStrobe({ currentState, visibleStates, reachableFromCurrent, onGoToState, onInput, uiMode }) {
  const strobeVisible = Object.keys(STROBE_POSITIONS).filter(
    (s) => s === "OFF" || visibleStates.includes(s)
  );

  const strobeEdges = useMemo(() => {
    const transitions = getAvailableTransitions(currentState, uiMode);
    const edgeMap = new Map();
    for (const t of transitions) {
      let target = t.target;
      if (target === "_next") target = getNextStrobeMode(currentState);
      if (target === "_prev") target = getPreviousStrobeMode(currentState);
      if (target === currentState || !STROBE_POSITIONS[target]) continue;
      const key = `${currentState}->${target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { from: currentState, to: target, inputs: [] });
      edgeMap.get(key).inputs.push(t.action);
    }
    return Array.from(edgeMap.values());
  }, [currentState, uiMode]);

  const selfActions = useMemo(() => {
    return getAvailableTransitions(currentState, uiMode)
      .filter((t) => t.target === "_self")
      .map((t) => ({ action: t.action, description: t.description }));
  }, [currentState, uiMode]);

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">Strobe Modes</h3>
        <span className="statemap__mode">Advanced UI</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 540 360" xmlns="http://www.w3.org/2000/svg">
          <ArrowDef />
          <rect x="30" y="20" width="480" height="250" rx="4" fill="none" stroke="#2a2a2c" strokeWidth="1" strokeDasharray="4 4" />
          <text x="270" y="285" textAnchor="middle" className="statemap__ring-label">2C / 4C cycles through modes</text>
          {selfActions.map((action, i) => (
            <StrobeActionBox
              key={action.action}
              x={45 + i * 155}
              y={300}
              action={action.action}
              description={action.description}
              onClick={() => onInput?.(action.action)}
            />
          ))}

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
