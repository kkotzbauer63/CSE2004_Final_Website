// Shared SVG primitives used across all StateMap sub-views
import { stateGroups } from "../../stateMachine/states.js";
import { NODE_W, NODE_H } from "./statemapLayouts.js";

export function ArrowDef() {
  return (
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#D4A84B" opacity="0.6" />
      </marker>
    </defs>
  );
}

export function EdgeLine({ from, to, inputs }) {
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

export function StateNode({ pos, info, isCurrent, isReachable, onClick, w = NODE_W, h = NODE_H, label }) {
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
