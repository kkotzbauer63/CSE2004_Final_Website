// Simple UI state map view — off, ramp, lockout, battcheck only
import { stateGroups } from "../../stateMachine/states.js";
import { getStateInfo } from "../../stateMachine/engine.js";
import { SIMPLE_POSITIONS } from "./statemapLayouts.js";
import { ArrowDef, EdgeLine, StateNode } from "./StateMapPrimitives.jsx";

export default function StateMapSimple({ visibleStates, defaultEdges, currentState, reachableFromCurrent, onGoToState, onInput }) {
  const simpleVisible = visibleStates.filter((s) => SIMPLE_POSITIONS[s]);

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">State Map</h3>
        <span className="statemap__mode">Simple UI</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 560 210" xmlns="http://www.w3.org/2000/svg">
          <ArrowDef />

          {/* Advanced UI mode-switch pseudo-node — upper-left, connected to OFF */}
          {(() => {
            const atOff = currentState === "OFF";
            const nx = 40, ny = 22, nw = 120, nh = 36;
            return (
              <g>
                <EdgeLine
                  from={SIMPLE_POSITIONS.OFF}
                  to={{ x: nx, y: ny }}
                  inputs={["10H"]}
                  toW={nw}
                  toH={nh}
                  strokeOpacity={atOff ? 0.5 : 0.12}
                  labelOpacity={atOff ? 1 : 0.35}
                />
                <g onClick={() => onInput("10H")} style={{ cursor: "pointer" }}
                  opacity={atOff ? 1 : 0.3}>
                  <rect x={nx} y={ny} width={nw} height={nh} rx="2"
                    fill="#1c1c1e" stroke="#777" strokeWidth="1" strokeDasharray="4 3" />
                  <rect x={nx} y={ny} width="3" height={nh} rx="1" fill="#888" />
                  <text x={nx + nw / 2 + 2} y={ny + nh / 2 + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    className="statemap__node-label" fill={atOff ? "#aaa" : "#444"}>
                    Advanced UI
                  </text>
                </g>
              </g>
            );
          })()}

          {defaultEdges.map((e) => {
            const fromPos = SIMPLE_POSITIONS[e.from];
            const toPos   = SIMPLE_POSITIONS[e.to];
            if (!fromPos || !toPos) return null;
            return (
              <EdgeLine
                key={`${e.from}-${e.to}`}
                from={fromPos} to={toPos}
                inputs={e.inputs}
              />
            );
          })}
          {simpleVisible.map((stateId) => {
            const pos = SIMPLE_POSITIONS[stateId];
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
        {Object.entries(stateGroups)
          .filter(([k]) => k !== "config" && k !== "special" && k !== "strobe")
          .map(([key, group]) => (
            <span key={key} className="statemap__legend-item">
              <span className="statemap__legend-dot" style={{ background: group.color }} />
              {group.name}
            </span>
          ))}
      </div>
    </div>
  );
}
