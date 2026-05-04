// Expanded ramp view — shown whenever currentState is RAMP or SUNSET_TIMER
import { stateGroups } from "../../stateMachine/states.js";
import { getStateInfo, getAvailableTransitions } from "../../stateMachine/engine.js";
import {
  RAMP_X, RAMP_Y, RAMP_W, RAMP_H,
  RAMP_EXPANDED_POSITIONS, NODE_W, NODE_H,
} from "./statemapLayouts.js";
import { StateNode } from "./StateMapPrimitives.jsx";

const NUM_STEPS = 7; // default Anduril stepped ramp count

function rampLevelY(lv) {
  const clamped = Math.max(1, Math.min(150, lv));
  return RAMP_Y + RAMP_H * (1 - (clamped - 1) / 149);
}

export default function StateMapRamp({
  isAdvanced, currentState, level, rampStyle,
  reachableFromCurrent, onGoToState, uiMode,
}) {
  const turboLineY = RAMP_Y + 40;
  const ceilLineY  = RAMP_Y + 80;
  const floorLineY = RAMP_Y + 240;
  const levelY     = level > 0 ? rampLevelY(level) : null;

  // Which state to pull transitions from
  const activeState = (currentState === "SUNSET_TIMER") ? "SUNSET_TIMER" : "RAMP";
  const rampTransitions = getAvailableTransitions(activeState, uiMode);
  const rampEdgeMap = new Map();
  for (const t of rampTransitions) {
    if (t.target === activeState || t.target === "_self" || !RAMP_EXPANDED_POSITIONS[t.target]) continue;
    if (!rampEdgeMap.has(t.target)) rampEdgeMap.set(t.target, { target: t.target, inputs: [] });
    rampEdgeMap.get(t.target).inputs.push(t.action);
  }
  const rampEdges = Array.from(rampEdgeMap.values());

  const leftNodeIds  = ["OFF", "LOCKOUT"];
  const rightNodeIds = isAdvanced
    ? ["SUNSET_TIMER", "MOMENTARY_MODE", "RAMP_CONFIG", "RAMP_EXTRAS_CONFIG"]
    : [];

  // Stepped tick Y positions — evenly spaced from floor to ceiling (inclusive)
  const steppedTicks = rampStyle === "stepped"
    ? Array.from({ length: NUM_STEPS }, (_, i) =>
        floorLineY + (ceilLineY - floorLineY) * (i / (NUM_STEPS - 1))
      )
    : [];

  const isSunset   = currentState === "SUNSET_TIMER";
  const rampLabel  = isSunset ? "SUNSET TIMER" : "RAMP";
  const titleLabel = isSunset ? "Sunset Timer" : "Ramp Mode";

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">{titleLabel}</h3>
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
            stroke="#D4A84B"
            strokeWidth={isSunset ? 2.5 : 2}
            strokeOpacity={isSunset ? 0.9 : 0.6}
          />
          <text
            x={RAMP_X + RAMP_W / 2} y={RAMP_Y - 9}
            textAnchor="middle" className="statemap__ramp-marker"
            style={{ fill: "#D4A84B", fontSize: "11px", letterSpacing: "0.1em" }}
          >
            {rampLabel}
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

          {/* Stepped ramp tick marks */}
          {steppedTicks.map((ty, i) => (
            <line
              key={i}
              x1={RAMP_X + 4} y1={ty}
              x2={RAMP_X + RAMP_W - 4} y2={ty}
              stroke="#D4A84B" strokeWidth="1.5" strokeOpacity="0.55"
            />
          ))}

          {/* Zone labels — right of ramp rect */}
          <text x={RAMP_X + RAMP_W + 6} y={turboLineY + 4} className="statemap__ramp-marker">TURBO</text>
          <text x={RAMP_X + RAMP_W + 6} y={ceilLineY  + 4} className="statemap__ramp-marker">CEIL</text>
          <text x={RAMP_X + RAMP_W + 6} y={floorLineY + 4} className="statemap__ramp-marker">FLOOR</text>

          {/* Self-transition annotations inside ramp rect */}
          <text x={RAMP_X + RAMP_W / 2} y={RAMP_Y + 135} textAnchor="middle" className="statemap__ramp-action">1H ↑</text>
          <text x={RAMP_X + RAMP_W / 2} y={RAMP_Y + 155} textAnchor="middle" className="statemap__ramp-action">2H ↓</text>
          {isAdvanced && (
            <text x={RAMP_X + RAMP_W / 2} y={RAMP_Y + 178} textAnchor="middle" className="statemap__ramp-action"
              style={{ fontSize: "8px", opacity: 0.65 }}>
              6C {rampStyle === "stepped" ? "→ smooth" : "→ stepped"}
            </text>
          )}

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
