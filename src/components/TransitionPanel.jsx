import { useCallback } from "react";
import "./TransitionPanel.css";

/**
 * Parses input notation like "3C" into { count: 3, type: "Click" }
 * or "2H" into { count: 2, type: "Hold" }.
 */
function parseInput(input) {
  if (input === "disconnect") return { count: null, type: "Disconnect power" };
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
  // For ramp transitions, hold starts continuous ramping
  const handlePointerDown = useCallback(
    (t) => {
      if (t.rampEffect) {
        onInput(t.input); // fire once immediately
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
          const parsed = parseInput(t.input);
          const isRamp = !!t.rampEffect;
          return (
            <button
              key={`${t.input}-${i}`}
              className={`panel__item ${isRamp ? "panel__item--ramp" : ""}`}
              onClick={isRamp ? undefined : () => onInput(t.input)}
              onPointerDown={isRamp ? () => handlePointerDown(t) : undefined}
              onPointerUp={isRamp ? () => handlePointerUp(t) : undefined}
              onPointerLeave={isRamp ? () => handlePointerUp(t) : undefined}
              onContextMenu={isRamp ? (e) => e.preventDefault() : undefined}
            >
              <span className="panel__input">
                <span className="panel__input-code">{t.input}</span>
                <span className="panel__input-desc">
                  {parsed.count !== null && `${parsed.count}× `}{parsed.type}
                </span>
              </span>
              <span className="panel__action">
                {t.action}
                {isRamp && (
                  <span className="panel__hold-hint">hold to ramp</span>
                )}
              </span>
              {t.target !== currentState && (
                <span className="panel__target">→ {t.target}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
