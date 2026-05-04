import { useCallback } from "react";
import { nodeMap } from "../data/graph.js";
import "./TransitionPanel.css";

/**
 * Parses button notation like "3C" into { count: 3, type: "Click" }
 * or "2H" into { count: 2, type: "Hold" }.
 */
function parseInput(input) {
  if (input === "disconnect") return { count: null, type: "Disconnect power" };
  if (input === "hold")       return { count: null, type: "Hold" };
  if (input.endsWith("+C")) {
    const count = parseInt(input, 10);
    return { count: `${count}+`, type: "Click" };
  }
  const count = parseInt(input, 10);
  const type = input.endsWith("H") ? "Hold" : "Click";
  return { count, type };
}

export default function TransitionPanel({
  transitions,
  onInput,
  onRampStart,
  onRampStop,
  currentState,
}) {
  const handlePointerDown = useCallback(
    (t) => {
      if (t.rampEffect) {
        onInput(t.action); // t.action is the button notation ("1H", "2H", etc.)
        onRampStart(t.rampEffect);
      }
    },
    [onInput, onRampStart]
  );

  const handlePointerUp = useCallback(
    (t) => {
      if (t.rampEffect) {
        onRampStop();
      }
    },
    [onRampStop]
  );

  if (!transitions.length) {
    return (
      <div className="panel">
        <div className="panel__header">
          <h3 className="panel__title">Available Actions</h3>
        </div>
        <p className="panel__empty">No transitions available from this state.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel__header">
        <h3 className="panel__title">Available Actions</h3>
        <span className="panel__count">{transitions.length}</span>
      </div>
      <div className="panel__list">
        {transitions.map((t, i) => {
          const parsed = parseInput(t.action); // t.action = button notation
          const isRamp  = !!t.rampEffect;
          // Resolve target display name; skip internal targets
          const showTarget = t.target !== "_self" && t.target !== "_next" && t.target !== "_prev" && t.target !== currentState;
          const targetName = showTarget ? (nodeMap[t.target]?.name ?? t.target) : null;

          return (
            <button
              key={`${t.action}-${i}`}
              className={`panel__item ${isRamp ? "panel__item--ramp" : ""}`}
              onClick={isRamp ? undefined : () => onInput(t.action)}
              onPointerDown={isRamp ? () => handlePointerDown(t) : undefined}
              onPointerUp={isRamp ? () => handlePointerUp(t) : undefined}
              onPointerLeave={isRamp ? () => handlePointerUp(t) : undefined}
              onContextMenu={isRamp ? (e) => e.preventDefault() : undefined}
            >
              <span className="panel__input">
                <span className="panel__input-code">{t.action}</span>
                <span className="panel__input-desc">
                  {parsed.count !== null && `${parsed.count}× `}{parsed.type}
                </span>
              </span>
              <span className="panel__action">
                {t.description}  {/* t.description = human-readable text */}
                {isRamp && (
                  <span className="panel__hold-hint">hold to ramp</span>
                )}
              </span>
              {targetName && (
                <span className="panel__target">→ {targetName}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
