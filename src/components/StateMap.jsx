import { useMemo } from "react";
import { getAvailableTransitions, getStateInfo, getVisibleStates } from "../stateMachine/engine.js";
import { stateGroups } from "../stateMachine/states.js";
import "./StateMap.css";

// States that belong to the blinky cluster (collapsed in advanced UI default view)
const BLINKY_STATES = new Set([
  "battcheck", "tempcheck", "beacon", "sos",
  "config_voltage", "config_thermal",
]);

const BLINKY_CLUSTER = "_blinky_cluster";

// States that belong to the strobe cluster (collapsed in advanced UI default view)
const STROBE_STATES = new Set([
  "strobe_party", "strobe_tactical", "strobe_police",
  "strobe_lightning", "strobe_candle", "strobe_biking",
]);

const STROBE_CLUSTER = "_strobe_cluster";

// --- Layout: default view for advanced UI (blinky + strobe collapsed) ---
const DEFAULT_POSITIONS = {
  off:               { x: 280, y: 30 },
  ramp:              { x: 280, y: 140 },
  lockout:           { x: 80, y: 85 },
  [BLINKY_CLUSTER]:  { x: 500, y: 30 },
  [STROBE_CLUSTER]:  { x: 80, y: 230 },
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

// --- Layout: expanded strobe view (advanced UI, inside strobe group) ---
// Six modes arranged in a hexagonal ring; "off" sits in the center as the exit node.
const STROBE_POSITIONS = {
  off:               { x: 210, y: 130 },
  strobe_party:      { x: 210, y: 10  },
  strobe_tactical:   { x: 370, y: 70  },
  strobe_police:     { x: 370, y: 190 },
  strobe_lightning:  { x: 210, y: 250 },
  strobe_candle:     { x: 50,  y: 190 },
  strobe_biking:     { x: 50,  y: 70  },
};

// --- Layout: expanded ramp view (both UI modes) ---
// Ramp rect is centered; left = off/lockout; right = config nodes (advanced only)
const RAMP_X = 200;
const RAMP_Y = 30;
const RAMP_W = 80;
const RAMP_H = 280;

function rampLevelY(lv) {
  const clamped = Math.max(1, Math.min(150, lv));
  return RAMP_Y + RAMP_H * (1 - (clamped - 1) / 149);
}

const RAMP_EXPANDED_POSITIONS = {
  off:               { x: 30,  y: 70 },
  lockout:           { x: 30,  y: 210 },
  momentary:         { x: 360, y: 115 },
  config_ramp:       { x: 360, y: 185 },
  config_rampextras: { x: 360, y: 255 },
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

export default function StateMap({ currentState, uiMode, onGoToState, level = 0 }) {
  const isAdvanced = uiMode === "full";
  const inBlinkyExpanded = isAdvanced && BLINKY_STATES.has(currentState);
  const inStrobeExpanded = isAdvanced && STROBE_STATES.has(currentState);
  const inRampExpanded   = currentState === "ramp";

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
    if (inBlinkyExpanded || inStrobeExpanded || inRampExpanded) return [];
    const transitions = getAvailableTransitions(currentState, uiMode);
    const edgeMap = new Map();
    const positions = isAdvanced ? DEFAULT_POSITIONS : SIMPLE_POSITIONS;
    for (const t of transitions) {
      let target = t.target;
      // In advanced mode, map blinky/strobe targets to their clusters
      if (isAdvanced && BLINKY_STATES.has(target)) target = BLINKY_CLUSTER;
      if (isAdvanced && STROBE_STATES.has(target)) target = STROBE_CLUSTER;
      if (target === currentState) continue;
      if (!positions[target]) continue;
      const key = `${currentState}->${target}`;
      if (!edgeMap.has(key)) edgeMap.set(key, { from: currentState, to: target, inputs: [] });
      edgeMap.get(key).inputs.push(t.input);
    }
    return Array.from(edgeMap.values());
  }, [currentState, uiMode, isAdvanced, inBlinkyExpanded, inStrobeExpanded, inRampExpanded]);

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

  // ---- Expanded strobe view (advanced UI only) ----
  if (inStrobeExpanded) {
    const strobeVisible = Object.keys(STROBE_POSITIONS).filter(
      (s) => s === "off" || visibleStates.includes(s)
    );

    const strobeEdges = (() => {
      const transitions = getAvailableTransitions(currentState, uiMode);
      const edgeMap = new Map();
      for (const t of transitions) {
        if (t.target === currentState || !STROBE_POSITIONS[t.target]) continue;
        const key = `${currentState}->${t.target}`;
        if (!edgeMap.has(key)) edgeMap.set(key, { from: currentState, to: t.target, inputs: [] });
        edgeMap.get(key).inputs.push(t.input);
      }
      return Array.from(edgeMap.values());
    })();

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

  // ---- Expanded ramp view (both simple and advanced UI) ----
  if (inRampExpanded) {
    const turboLineY = RAMP_Y + 40;
    const ceilLineY  = RAMP_Y + 80;
    const floorLineY = RAMP_Y + 240;
    const levelY     = level > 0 ? rampLevelY(level) : null;

    const rampTransitions = getAvailableTransitions("ramp", uiMode);
    const rampEdgeMap = new Map();
    for (const t of rampTransitions) {
      if (t.target === "ramp" || !RAMP_EXPANDED_POSITIONS[t.target]) continue;
      if (!rampEdgeMap.has(t.target)) rampEdgeMap.set(t.target, { target: t.target, inputs: [] });
      rampEdgeMap.get(t.target).inputs.push(t.input);
    }
    const rampEdges = Array.from(rampEdgeMap.values());

    const leftNodeIds  = ["off", "lockout"];
    const rightNodeIds = isAdvanced ? ["momentary", "config_ramp", "config_rampextras"] : [];

    return (
      <div className="statemap">
        <div className="statemap__header">
          <h3 className="statemap__title">Ramp Mode</h3>
          <span className="statemap__mode">{isAdvanced ? "Advanced UI" : "Simple UI"}</span>
        </div>
        <div className="statemap__container">
          <svg
            className="statemap__svg"
            viewBox={isAdvanced ? "0 0 560 330" : "0 0 400 330"}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#D4A84B" opacity="0.6" />
              </marker>
              <linearGradient id="rampGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#D4A84B" stopOpacity="0.9" />
                <stop offset="28%"  stopColor="#b88a3a" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#222224" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Ramp rect — represents current state */}
            <rect
              x={RAMP_X} y={RAMP_Y} width={RAMP_W} height={RAMP_H} rx="2"
              fill="url(#rampGrad)"
              stroke="#D4A84B" strokeWidth="2" strokeOpacity="0.6"
            />
            <text
              x={RAMP_X + RAMP_W / 2} y={RAMP_Y - 9}
              textAnchor="middle" className="statemap__ramp-marker"
              style={{ fill: "#D4A84B", fontSize: "11px", letterSpacing: "0.1em" }}
            >
              RAMP
            </text>

            {/* Zone dashed lines */}
            <line x1={RAMP_X} y1={turboLineY} x2={RAMP_X + RAMP_W} y2={turboLineY}
              stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.45" strokeDasharray="3 3"
            />
            <line x1={RAMP_X} y1={ceilLineY} x2={RAMP_X + RAMP_W} y2={ceilLineY}
              stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.30" strokeDasharray="3 3"
            />
            <line x1={RAMP_X} y1={floorLineY} x2={RAMP_X + RAMP_W} y2={floorLineY}
              stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.20" strokeDasharray="3 3"
            />

            {/* Zone labels — right of ramp rect */}
            <text x={RAMP_X + RAMP_W + 6} y={turboLineY + 4} className="statemap__ramp-marker">TURBO</text>
            <text x={RAMP_X + RAMP_W + 6} y={ceilLineY  + 4} className="statemap__ramp-marker">CEIL</text>
            <text x={RAMP_X + RAMP_W + 6} y={floorLineY + 4} className="statemap__ramp-marker">FLOOR</text>

            {/* Self-transition annotations inside ramp rect */}
            <text x={RAMP_X + RAMP_W / 2} y={RAMP_Y + 145} textAnchor="middle" className="statemap__ramp-action">1H ↑</text>
            <text x={RAMP_X + RAMP_W / 2} y={RAMP_Y + 170} textAnchor="middle" className="statemap__ramp-action">2H ↓</text>

            {/* Current level indicator */}
            {levelY !== null && (
              <>
                <line
                  x1={RAMP_X - 10} y1={levelY}
                  x2={RAMP_X + RAMP_W + 10} y2={levelY}
                  stroke="#D4A84B" strokeWidth="2" strokeOpacity="0.95"
                />
                <text
                  x={RAMP_X - 14} y={levelY + 4}
                  textAnchor="end" className="statemap__ramp-level"
                >
                  {level}
                </text>
              </>
            )}

            {/* Edges from ramp rect sides to surrounding nodes */}
            {rampEdges.map(({ target, inputs }) => {
              const targetPos = RAMP_EXPANDED_POSITIONS[target];
              if (!targetPos) return null;
              const isLeft = targetPos.x < RAMP_X;
              const fromX  = isLeft ? RAMP_X : RAMP_X + RAMP_W;
              const edgeY  = targetPos.y + NODE_H / 2;
              const toX    = isLeft ? targetPos.x + NODE_W : targetPos.x;
              const mx     = (fromX + toX) / 2;
              return (
                <g key={target}>
                  <line
                    x1={fromX} y1={edgeY} x2={toX} y2={edgeY}
                    stroke="#D4A84B" strokeWidth="1.5" strokeOpacity="0.5"
                    markerEnd="url(#arrowhead)"
                  />
                  <text x={mx} y={edgeY - 6} textAnchor="middle" className="statemap__edge-label">
                    {inputs.join(", ")}
                  </text>
                </g>
              );
            })}

            {/* Surrounding state nodes */}
            {[...leftNodeIds, ...rightNodeIds].map((stateId) => {
              const pos = RAMP_EXPANDED_POSITIONS[stateId];
              if (!pos) return null;
              const info = getStateInfo(stateId);
              return (
                <StateNode
                  key={stateId}
                  pos={pos} info={info}
                  isCurrent={false}
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
          {isAdvanced && (
            <>
              <span className="statemap__legend-item">
                <span className="statemap__legend-dot" style={{ background: stateGroups.special.color }} />
                Special Modes
              </span>
              <span className="statemap__legend-item">
                <span className="statemap__legend-dot" style={{ background: stateGroups.config.color }} />
                Config Menus
              </span>
            </>
          )}
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

  // ---- Advanced UI default view (blinky + strobe collapsed) ----
  const defaultVisible = visibleStates.filter(
    (s) => !BLINKY_STATES.has(s) && !STROBE_STATES.has(s)
  );
  const showCluster = visibleStates.some((s) => BLINKY_STATES.has(s));
  const clusterReachable = [...BLINKY_STATES].some((s) => reachableFromCurrent.has(s));
  const showStrobeCluster = isAdvanced && visibleStates.some((s) => STROBE_STATES.has(s));
  const strobeClusterReachable = [...STROBE_STATES].some((s) => reachableFromCurrent.has(s));

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

          {showStrobeCluster && (
            <StateNode
              pos={DEFAULT_POSITIONS[STROBE_CLUSTER]}
              info={{ group: "strobe", name: "Strobe Modes" }}
              isCurrent={inStrobeExpanded}
              isReachable={strobeClusterReachable}
              onClick={() => onGoToState("strobe_party")}
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
