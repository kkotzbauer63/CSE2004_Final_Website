// Expanded lockout view — shown when currentState is LOCKOUT or AUTO_LOCK_CONFIG
import { useMemo } from "react";
import { stateGroups } from "../../stateMachine/states.js";
import { getStateInfo, getAvailableTransitions } from "../../stateMachine/engine.js";
import { LOCKOUT_POSITIONS, NODE_W, NODE_H } from "./statemapLayouts.js";
import { ArrowDef, EdgeLine, StateNode } from "./StateMapPrimitives.jsx";

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

  // Annotation anchor: centered on the LOCKOUT node, starting just below it
  const lockoutPos  = LOCKOUT_POSITIONS["LOCKOUT"];
  const annotX      = lockoutPos.x + NODE_W / 2;
  const annotY      = lockoutPos.y + NODE_H + 18;

  // Clickable style for 7C / 7H aux actions
  const clickStyle = { pointerEvents: "auto", cursor: "pointer" };

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">Lockout Mode</h3>
        <span className="statemap__mode">{isAdvanced ? "Advanced UI" : "Simple UI"}</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 500 290" xmlns="http://www.w3.org/2000/svg">
          <ArrowDef />
          {lockoutEdges.map((e) => (
            <EdgeLine
              key={`${e.from}-${e.to}`}
              from={LOCKOUT_POSITIONS[e.from]}
              to={LOCKOUT_POSITIONS[e.to]}
              inputs={e.inputs}
            />
          ))}
          {Object.keys(LOCKOUT_POSITIONS)
            .filter((stateId) => isAdvanced || stateId !== "AUTO_LOCK_CONFIG")
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

          {/* ── Self-transition annotations (below the LOCKOUT node) ── */}
          <text
            x={annotX} y={annotY}
            textAnchor="middle" className="statemap__ramp-action"
            style={{ fontSize: "9px", opacity: 0.5 }}
          >
            — while locked —
          </text>

          {/* 1H and 2H: both UI modes */}
          <text x={annotX} y={annotY + 17} textAnchor="middle" className="statemap__ramp-action">
            1H · Momentary Low
          </text>
          <text x={annotX} y={annotY + 32} textAnchor="middle" className="statemap__ramp-action">
            2H · Momentary Moon
          </text>

          {/* 7C and 7H: Advanced UI only — clickable to cycle aux */}
          {isAdvanced && (
            <>
              <text
                x={annotX} y={annotY + 52}
                textAnchor="middle" className="statemap__ramp-action"
                style={clickStyle}
                onClick={() => onInput?.("7C")}
              >
                7C · Aux Pattern ↺
              </text>
              <text
                x={annotX} y={annotY + 67}
                textAnchor="middle" className="statemap__ramp-action"
                style={clickStyle}
                onClick={() => onInput?.("7H")}
              >
                7H · Aux Color ↺
              </text>
            </>
          )}
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
