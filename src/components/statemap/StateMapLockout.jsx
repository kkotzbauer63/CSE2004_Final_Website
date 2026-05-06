// Expanded lockout view — shown when currentState is LOCKOUT or AUTO_LOCK_CONFIG
import { useMemo } from "react";
import { stateGroups } from "../../stateMachine/states.js";
import { getStateInfo, getAvailableTransitions } from "../../stateMachine/engine.js";
import { LOCKOUT_POSITIONS, NODE_W, NODE_H } from "./statemapLayouts.js";
import { ArrowDef, EdgeLine, StateNode } from "./StateMapPrimitives.jsx";

const LOCKOUT_STATE_NODES = [
  "OFF",
  "LOCKOUT",
  "RAMP",
  "LOCKOUT_AUX_PATTERN_CONFIG",
  "LOCKOUT_AUX_COLOR_CONFIG",
  "AUTO_LOCK_CONFIG",
];

const LOCKOUT_ACTION_NODES = [
  {
    id: "LOCKOUT_MOMENTARY_LOW",
    label: "1H Momentary Low",
    action: "1H",
  },
  {
    id: "LOCKOUT_MOMENTARY_MOON",
    label: "2H Momentary Moon",
    action: "2H",
  },
];

function ActionNode({ pos, label, isReachable, onClick }) {
  return (
    <g
      className={`statemap__node ${isReachable ? "statemap__node--reachable" : "statemap__node--dimmed"}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx="2"
        fill="#1c1c1e"
        stroke={isReachable ? "#D4A84B" : "#333"}
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <rect x={pos.x} y={pos.y} width="3" height={NODE_H} rx="1"
        fill="#D4A84B" opacity={isReachable ? 0.7 : 0.25}
      />
      <text
        x={pos.x + NODE_W / 2 + 2} y={pos.y + NODE_H / 2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        className="statemap__node-label"
        fill={isReachable ? "#bbb" : "#555"}
      >
        {label}
      </text>
    </g>
  );
}

export default function StateMapLockout({
  currentState, reachableFromCurrent, onGoToState, uiMode, isAdvanced, onInput,
}) {
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
        <span className="statemap__mode">{isAdvanced ? "Advanced UI" : "Simple UI"}</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 580 360" xmlns="http://www.w3.org/2000/svg">
          <ArrowDef />
          {lockoutEdges.map((e) => (
            <EdgeLine
              key={`${e.from}-${e.to}`}
              from={LOCKOUT_POSITIONS[e.from]}
              to={LOCKOUT_POSITIONS[e.to]}
              inputs={e.inputs}
            />
          ))}

          {LOCKOUT_ACTION_NODES.map((node) => (
            <EdgeLine
              key={`LOCKOUT-${node.id}`}
              from={LOCKOUT_POSITIONS.LOCKOUT}
              to={LOCKOUT_POSITIONS[node.id]}
              inputs={[node.action]}
            />
          ))}

          {LOCKOUT_ACTION_NODES.map((node) => (
            <ActionNode
              key={node.id}
              pos={LOCKOUT_POSITIONS[node.id]}
              label={node.label}
              isReachable={currentState === "LOCKOUT"}
              onClick={() => onInput?.(node.action)}
            />
          ))}

          {LOCKOUT_STATE_NODES
            .filter((stateId) => isAdvanced || !["AUTO_LOCK_CONFIG", "LOCKOUT_AUX_PATTERN_CONFIG", "LOCKOUT_AUX_COLOR_CONFIG"].includes(stateId))
            .map((stateId) => {
              const pos  = LOCKOUT_POSITIONS[stateId];
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
        {isAdvanced && (
          <span className="statemap__legend-item">
            <span className="statemap__legend-dot" style={{ background: stateGroups.config.color }} />
            Config Menus
          </span>
        )}
      </div>
    </div>
  );
}
