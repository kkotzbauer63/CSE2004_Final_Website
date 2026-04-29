import { useMemo } from "react";
import { getAvailableTransitions, getStateInfo, getVisibleStates } from "../stateMachine/engine.js";
import { stateGroups } from "../stateMachine/states.js";
import "./StateMap.css";

// States that belong to the blinky cluster (only collapsed in advanced UI)
const BLINKY_STATES = new Set([
  "battcheck", "tempcheck", "beacon", "sos",
  "config_voltage", "config_thermal",
]);

const BLINKY_CLUSTER = "_blinky_cluster";

// --- Layout: default view for advanced UI (blinky collapsed) ---
const DEFAULT_POSITIONS = {
  off:               { x: 280, y: 30 },
  ramp:              { x: 280, y: 140 },
  lockout:           { x: 80, y: 85 },
  [BLINKY_CLUSTER]:  { x: 500, y: 30 },
  strobe:            { x: 80, y: 230 },
  momentary:         { x: 220, y: 300 },
  tactical:          { x: 50, y: 330 },
  config_misc:       { x: 480, y: 140 },
  config_simpleui:   { x: 120, y: 0 },
  config_ramp:       { x: 480, y: 240 },
  config_rampextras: { x: 310, y: 300 },
  config_autolock:   { x: 50, y: 160 },
  config_tactical:   { x: 50, y: 400 },
};

// --- Layout: simple UI (all states shown individually, fewer states) ---
const SIMPLE_POSITIONS = {
  off:       { x: 220, y: 30 },
  ramp:      { x: 220, y: 140 },
  lockout:   { x: 60, y: 85 },
  battcheck: { x: 420, y: 30 },
};

// --- Layout: expanded blinky view (advanced UI, inside blinky group) ---
const BLINKY_POSITIONS = {
  off:             { x: 250, y: 10 },
  battcheck:       { x: 100, y: 110 },
  tempcheck:       { x: 400, y: 110 },
  beacon:          { x: 400, y: 220 },
  sos:             { x: 100, y: 220 },
  config_voltage:  { x: 10,  y: 200 },
  config_thermal:  { x: 490, y: 200 },
};

const NODE_W = 110;
const NODE_H = 36;
const CLUSTER_W = 130;
const CLUSTER_H = 42;

function EdgeLine({ from, to, inputs }) {
  if (!from || !to) return null;
  const x1 = from.x + NODE_W / 2;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x + NODE_W / 2;
  const y2 = to.y + NODE_H / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const sx = x1 + (dx / len) * 22;
  const sy = y1 + (dy / len) * 22;
  const ex = x2 - (dx / len) * 26;
  const ey = y2 - (dy / len) * 26;
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;

  return (
    <g>
      <line
        x1={sx} y1={sy} x2={ex} y2={ey}
        stroke="#D4A84B" strokeWidth="1.5" strokeOpacity="0.5"
        markerEnd="url(#arrowhead)"
      />
      <text x={mx} y={my - 5} textAnchor="middle" className="statemap__edge-label">
        {inputs.join(", ")}
      </text>
    </g>
  );
}

function StateNode({ pos, info, isCurrent, isReachable, onClick, w = NODE_W, h = NODE_H, label }) {
  const groupColor = stateGroups[info?.group]?.color ?? "#666";
  let nodeClass = "statemap__node";
  if (isCurrent) nodeClass += " statemap__node--current";
  else if (isReachable) nodeClass += " statemap__node--reachable";
  else nodeClass += " statemap__node--dimmed";

  return (
    <g className={nodeClass} onClick={onClick} style={{ cursor: "pointer" }}>
      <rect
        x={pos.x} y={pos.y} width={w} height={h} rx="2"
        fill={isCurrent ? "#2a2a2c" : "#1c1c1e"}
        stroke={isCurrent ? groupColor : isReachable ? groupColor : "#333"}
        strokeWidth={isCurrent ? 2 : 1}
      />
      <rect x={pos.x} y={pos.y} width="3" height={h} rx="1"
        fill={groupColor} opacity={isCurrent ? 1 : isReachable ? 0.7 : 0.25}
      />
      <text
        x={pos.x + w / 2 + 2} y={pos.y + h / 2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        className="statemap__node-label"
        fill={isCurrent ? "#eee" : isReachable ? "#bbb" : "#555"}
      >
        {label || info?.name}
      </text>
    </g>
  );
}

const ArrowDef = () => (
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#D4A84B" opacity="0.6" />
    </marker>
  </defs>
);

export default function StateMap({ currentState, uiMode, onGoToState }) {
  const isAdvanced = uiMode === "full";
  const inBlinkyExpanded = isAdvanced && BLINKY_STATES.has(currentState);

  const visibleStates = useMemo(() => getVisibleStates(uiMode), [uiMode]);

  const reachableFromCurrent = useMemo(() => {
    const transitions = getAvailableTransitions(currentState, uiMode);
    return new Set(transitions.map((t) => t.target));
  }, [currentState, uiMode]);

  // Edges for the blinky expanded view
  const blinkyEdges = useMemo(() => {
    if (!inBlinkyExpanded) return [];
    const transitions = getAvailableTransitions(currentState, uiMode);
    const edgeMap = new Map();
    for (const t of transitions) {
      if (t.target === currentState || !BLINKY_POSITIONS[t.target]) continue;
      const key = `${currentState}->${t.target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { from: currentState, to: t.target, inputs: [] });
      edgeMap.get(key).inputs.push(t.input);
    }
    return Array.from(edgeMap.values());
  }, [currentState, uiMode, inBlinkyExpanded]);

  // Edges for the default/simple view
  const defaultEdges = useMemo(() => {
    if (inBlinkyExpanded) return [];
    const transitions = getAvailableTransitions(currentState, uiMode);
    const edgeMap = new Map();
    const positions = isAdvanced ? DEFAULT_POSITIONS : SIMPLE_POSITIONS;
    for (const t of transitions) {
      let target = t.target;
      // In advanced mode, map blinky targets to cluster
      if (isAdvanced && BLINKY_STATES.has(target)) target = BLINKY_CLUSTER;
      if (target === currentState) continue;
      if (!positions[target]) continue;
      const key = `${currentState}->${target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { from: currentState, to: target, inputs: [] });
      edgeMap.get(key).inputs.push(t.input);
    }
    return Array.from(edgeMap.values());
  }, [currentState, uiMode, isAdvanced, inBlinkyExpanded]);

  // ---- Expanded blinky view (advanced UI only) ----
  if (inBlinkyExpanded) {
    const blinkyVisible = Object.keys(BLINKY_POSITIONS).filter(
      (s) => visibleStates.includes(s) || s === "off"
    );

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

  // ---- Simple UI view (no collapsing) ----
  if (!isAdvanced) {
    const simpleVisible = visibleStates.filter((s) => SIMPLE_POSITIONS[s]);

    return (
      <div className="statemap">
        <div className="statemap__header">
          <h3 className="statemap__title">State Map</h3>
          <span className="statemap__mode">Simple UI</span>
        </div>
        <div className="statemap__container">
          <svg className="statemap__svg" viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg">
            <ArrowDef />
            {defaultEdges.map((e) => {
              const fromPos = SIMPLE_POSITIONS[e.from];
              const toPos = SIMPLE_POSITIONS[e.to];
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

  // ---- Advanced UI default view (blinky collapsed) ----
  const defaultVisible = visibleStates.filter((s) => !BLINKY_STATES.has(s));
  const showCluster = visibleStates.some((s) => BLINKY_STATES.has(s));
  const clusterReachable = [...BLINKY_STATES].some((s) => reachableFromCurrent.has(s));

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">State Map</h3>
        <span className="statemap__mode">Advanced UI</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 650 440" xmlns="http://www.w3.org/2000/svg">
          <ArrowDef />

          {defaultEdges.map((e) => {
            const fromPos = DEFAULT_POSITIONS[e.from];
            const toPos = DEFAULT_POSITIONS[e.to];
            if (!fromPos || !toPos) return null;
            return (
              <EdgeLine
                key={`${e.from}-${e.to}`}
                from={fromPos} to={toPos}
                inputs={e.inputs}
              />
            );
          })}

          {showCluster && (
            <StateNode
              pos={DEFAULT_POSITIONS[BLINKY_CLUSTER]}
              info={{ group: "blinky", name: "Blinky / Utility" }}
              isCurrent={false}
              isReachable={clusterReachable}
              onClick={() => onGoToState("battcheck")}
              w={CLUSTER_W} h={CLUSTER_H}
              label="Blinky / Utility"
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
