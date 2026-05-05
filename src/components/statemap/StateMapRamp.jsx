// Expanded ramp view — shown whenever currentState is RAMP or SUNSET_TIMER
import { stateGroups } from "../../stateMachine/states.js";
import { getStateInfo, getAvailableTransitions } from "../../stateMachine/engine.js";
import {
  RAMP_X, RAMP_Y, RAMP_W, RAMP_H,
  RAMP_EXPANDED_POSITIONS, NODE_W, NODE_H,
} from "./statemapLayouts.js";
import { StateNode } from "./StateMapPrimitives.jsx";
import { TURBO_STYLE, DEFAULT_ADVANCED_CONFIG } from "../../data/flashlightConfig.js";

/** Convert Anduril level (1–150) to SVG Y coordinate within the ramp rectangle. */
function rampLevelY(lv) {
  const clamped = Math.max(1, Math.min(150, lv));
  return RAMP_Y + RAMP_H * (1 - (clamped - 1) / 149);
}

export default function StateMapRamp({
  isAdvanced, currentState, level, rampStyle, rampConfig,
  reachableFromCurrent, onGoToState, uiMode, onInput,
}) {
  // Resolve config values — fall back to Advanced defaults if not yet provided
  const cfg = rampConfig ?? DEFAULT_ADVANCED_CONFIG;
  const {
    floorLevel = 1,
    ceilLevel  = 120,
    turboLevel = 150,
    turboStyle = TURBO_STYLE.A2,
    stepCount  = 7,
  } = cfg;

  const showTurbo  = turboStyle !== TURBO_STYLE.NONE;

  // Y positions derived from actual config levels
  const turboLineY = rampLevelY(turboLevel);
  const ceilLineY  = rampLevelY(ceilLevel);
  const floorLineY = rampLevelY(floorLevel);
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

  // Stepped tick Y positions — evenly spaced from floor to ceil (inclusive)
  const safeStepCount = Math.max(1, stepCount);
  const steppedTicks = rampStyle === "stepped"
    ? Array.from({ length: safeStepCount }, (_, i) =>
        safeStepCount <= 1
          ? floorLineY
          : floorLineY + (ceilLineY - floorLineY) * (i / (safeStepCount - 1))
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

          {/* TURBO line — hidden when turboStyle === NONE */}
          {showTurbo && (
            <line
              x1={RAMP_X} y1={turboLineY} x2={RAMP_X + RAMP_W} y2={turboLineY}
              stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.45" strokeDasharray="3 3"
            />
          )}

          {/* CEIL line */}
          <line
            x1={RAMP_X} y1={ceilLineY} x2={RAMP_X + RAMP_W} y2={ceilLineY}
            stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.30" strokeDasharray="3 3"
          />

          {/* FLOOR line */}
          <line
            x1={RAMP_X} y1={floorLineY} x2={RAMP_X + RAMP_W} y2={floorLineY}
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

          {/* Zone labels — right of ramp rect, with actual level numbers */}
          {showTurbo && (
            <text x={RAMP_X + RAMP_W + 6} y={turboLineY + 4} className="statemap__ramp-marker">
              TURBO {turboLevel}
            </text>
          )}
          <text x={RAMP_X + RAMP_W + 6} y={ceilLineY  + 4} className="statemap__ramp-marker">
            CEIL {ceilLevel}
          </text>
          <text x={RAMP_X + RAMP_W + 6} y={floorLineY + 4} className="statemap__ramp-marker">
            FLOOR {floorLevel}
          </text>

          {/* Self-transition annotations inside ramp rect */}
          <text x={RAMP_X + RAMP_W / 2} y={RAMP_Y + 135} textAnchor="middle" className="statemap__ramp-action">1H ↑</text>
          <text x={RAMP_X + RAMP_W / 2} y={RAMP_Y + 155} textAnchor="middle" className="statemap__ramp-action">2H ↓</text>
          <text
            x={RAMP_X + RAMP_W / 2} y={RAMP_Y + 178} textAnchor="middle"
            className="statemap__ramp-action"
            style={{ fontSize: "8px", opacity: 0.65 }}
          >
            3C {rampStyle === "stepped" ? "→ smooth" : "→ stepped"}
          </text>
          {isAdvanced && (
            <g
              role="button"
              onClick={() => onInput?.("10C")}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={RAMP_X + 8} y={RAMP_Y + 198} width={RAMP_W - 16} height="28" rx="2"
                fill="rgba(28, 28, 30, 0.72)"
                stroke="#D4A84B"
                strokeWidth="1"
                strokeOpacity="0.45"
              />
              <text
                x={RAMP_X + RAMP_W / 2} y={RAMP_Y + 208}
                textAnchor="middle" dominantBaseline="middle"
                className="statemap__ramp-action"
                style={{ fontSize: "8px", pointerEvents: "none" }}
              >
                10C
              </text>
              <text
                x={RAMP_X + RAMP_W / 2} y={RAMP_Y + 220}
                textAnchor="middle" dominantBaseline="middle"
                className="statemap__ramp-action"
                style={{ fontSize: "7px", pointerEvents: "none" }}
              >
                Save memory
              </text>
            </g>
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
