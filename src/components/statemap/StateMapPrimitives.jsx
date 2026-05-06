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

function rectCenter(pos, w, h) {
  return { x: pos.x + w / 2, y: pos.y + h / 2 };
}

function edgePoint(pos, w, h, dx, dy) {
  const center = rectCenter(pos, w, h);
  if (dx === 0 && dy === 0) return center;

  const tx = dx === 0 ? Infinity : (w / 2) / Math.abs(dx);
  const ty = dy === 0 ? Infinity : (h / 2) / Math.abs(dy);
  const t = Math.min(tx, ty);

  return {
    x: center.x + dx * t,
    y: center.y + dy * t,
  };
}

export function EdgeLine({
  from,
  to,
  inputs,
  fromW = NODE_W,
  fromH = NODE_H,
  toW = NODE_W,
  toH = NODE_H,
  strokeOpacity = 0.5,
  labelOpacity = 1,
}) {
  if (!from || !to) return null;
  const fromCenter = rectCenter(from, fromW, fromH);
  const toCenter = rectCenter(to, toW, toH);
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const start = edgePoint(from, fromW, fromH, dx, dy);
  const end = edgePoint(to, toW, toH, -dx, -dy);
  const sx = start.x;
  const sy = start.y;
  const ex = end.x;
  const ey = end.y;
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;

  return (
    <g>
      <line
        x1={sx} y1={sy} x2={ex} y2={ey}
        stroke="#D4A84B" strokeWidth="1.5" strokeOpacity={strokeOpacity}
        markerEnd="url(#arrowhead)"
      />
      <text
        x={mx} y={my}
        textAnchor="middle"
        dominantBaseline="middle"
        className="statemap__edge-label"
        style={{
          fill: "#62d66f",
          stroke: "#1c1c1e",
          strokeWidth: 4,
          paintOrder: "stroke",
          opacity: labelOpacity,
        }}
      >
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
