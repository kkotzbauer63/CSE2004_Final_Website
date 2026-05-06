// Advanced UI default state map view — blinky and strobe collapsed into cluster nodes
import { stateGroups } from "../../stateMachine/states.js";
import { getStateInfo } from "../../stateMachine/engine.js";
import {
  DEFAULT_POSITIONS,
  BLINKY_STATES, STROBE_STATES,
  CLUSTER_W, CLUSTER_H,
} from "./statemapLayouts.js";
import { ArrowDef, EdgeLine, StateNode } from "./StateMapPrimitives.jsx";

export default function StateMapAdvanced({ visibleStates, defaultEdges, currentState, reachableFromCurrent, onGoToState, onInput }) {
  const defaultVisible = visibleStates.filter(
    (s) => !BLINKY_STATES.has(s) && !STROBE_STATES.has(s) && s !== "STROBE_GROUP"
  );
  const showBlinkyCluster  = visibleStates.some((s) => BLINKY_STATES.has(s));
  const blinkyReachable    = [...BLINKY_STATES].some((s) => reachableFromCurrent.has(s));
  const showStrobeCluster  = visibleStates.some((s) => STROBE_STATES.has(s)) || visibleStates.includes("STROBE_GROUP");
  const strobeReachable    = reachableFromCurrent.has("STROBE_GROUP") || [...STROBE_STATES].some((s) => reachableFromCurrent.has(s));

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">State Map</h3>
        <span className="statemap__mode">Advanced UI</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 700 560" xmlns="http://www.w3.org/2000/svg">
          <ArrowDef />

          {/* Simple UI mode-switch pseudo-node — upper-left, connected to OFF via 10C */}
          {(() => {
            const atOff = currentState === "OFF";
            const nx = 30, ny = 85, nw = 110, nh = 36;
            // edge: OFF left-center → node right-center
            const ex1 = DEFAULT_POSITIONS.OFF.x, ey1 = DEFAULT_POSITIONS.OFF.y, ex2 = nx + nw, ey2 = ny + nh / 2;
            const mx = (ex1 + ex2) / 2, my = (ey1 + ey2) / 2;
            return (
              <g>
                <line x1={ex1} y1={ey1} x2={ex2} y2={ey2}
                  stroke="#D4A84B" strokeWidth="1.5"
                  strokeOpacity={atOff ? 0.5 : 0.12}
                  markerEnd="url(#arrowhead)"
                />
                <text x={mx} y={my - 5} textAnchor="middle" className="statemap__edge-label"
                  opacity={atOff ? 1 : 0.35}>10C</text>
                <g onClick={() => onInput("10C")} style={{ cursor: "pointer" }}
                  opacity={atOff ? 1 : 0.3}>
                  <rect x={nx} y={ny} width={nw} height={nh} rx="2"
                    fill="#1c1c1e" stroke="#777" strokeWidth="1" strokeDasharray="4 3" />
                  <rect x={nx} y={ny} width="3" height={nh} rx="1" fill="#888" />
                  <text x={nx + nw / 2 + 2} y={ny + nh / 2 + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    className="statemap__node-label" fill={atOff ? "#aaa" : "#444"}>
                    Simple UI
                  </text>
                </g>
              </g>
            );
          })()}

          {defaultEdges.map((e) => {
            const fromPos = DEFAULT_POSITIONS[e.from];
            const toPos   = DEFAULT_POSITIONS[e.to];
            if (!fromPos || !toPos) return null;
            return (
              <EdgeLine
                key={`${e.from}-${e.to}`}
                from={fromPos} to={toPos}
                inputs={e.inputs}
              />
            );
          })}

          {showBlinkyCluster && (
            <StateNode
              pos={DEFAULT_POSITIONS["BLINKY_GROUP"]}
              info={{ group: "blinky", name: "Blinky / Utility" }}
              isCurrent={false}
              isReachable={blinkyReachable}
              onClick={() => onGoToState("BATTERY_CHECK")}
              w={CLUSTER_W} h={CLUSTER_H}
              label="Blinky / Utility"
            />
          )}

          {showStrobeCluster && (
            <StateNode
              pos={DEFAULT_POSITIONS["STROBE_GROUP"]}
              info={{ group: "strobe", name: "Strobe Modes" }}
              isCurrent={false}
              isReachable={strobeReachable}
              onClick={() => onGoToState("PARTY_STROBE")}
              w={CLUSTER_W} h={CLUSTER_H}
              label="Strobe Modes"
            />
          )}

          {defaultVisible.map((stateId) => {
            const pos = DEFAULT_POSITIONS[stateId];
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
        {Object.entries(stateGroups).map(([key, group]) => (
          <span key={key} className="statemap__legend-item">
            <span className="statemap__legend-dot" style={{ background: group.color }} />
            {group.name}
          </span>
        ))}
      </div>
    </div>
  );
}
