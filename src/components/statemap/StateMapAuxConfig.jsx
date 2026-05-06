// Expanded views for AUX_PATTERN_CONFIG and AUX_COLOR_CONFIG states
import { stateGroups } from "../../stateMachine/states.js";
import { AUX_PATTERNS, AUX_COLORS, AUX_COLOR_HEX, DISCO_CYCLE_HEX } from "../../hooks/useStateMachine.js";

const PATTERN_LABELS = {
  off:      "Off",
  low:      "Low",
  high:     "High",
  blinking: "Blinking",
};

const PATTERN_DESCRIPTIONS = {
  off:      "LEDs always off",
  low:      "Dim steady glow",
  high:     "Bright steady glow",
  blinking: "Slow blink",
};

// ── Aux Pattern Config ────────────────────────────────────────────────────────

export function StateMapAuxPattern({ auxPatternIndex, context = "off", onGoToState, onInput }) {
  const currentPattern = AUX_PATTERNS[auxPatternIndex] ?? "off";
  const isLockout = context === "lockout";
  const returnState = isLockout ? "LOCKOUT" : "OFF";
  const title = isLockout ? "Aux LED Pattern — Lockout Mode" : "Aux LED Pattern — Off Mode";
  const returnLabel = isLockout ? "Back to Lockout" : "Back to Off";

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">{title}</h3>
        <span className="statemap__mode">Advanced UI</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 560 260" xmlns="http://www.w3.org/2000/svg">
          {/* Return to parent state */}
          <g
            role="button"
            style={{ cursor: "pointer" }}
            onClick={() => onGoToState(returnState)}
          >
            <rect x="190" y="8" width="140" height="36" rx="2"
              fill="#1c1c1e" stroke="#D4A84B" strokeWidth="1.5" />
            <text x="260" y="31" textAnchor="middle" dominantBaseline="middle"
              className="statemap__node-label" fill="#D4A84B">{returnLabel}</text>
          </g>

          {/* Pattern option cards */}
          {AUX_PATTERNS.map((pattern, i) => {
            const isActive = pattern === currentPattern;
            const x = 30 + i * 130;
            const y = 70;

            return (
              <g
                key={pattern}
                role="button"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  // Cycle through 7C presses to reach this pattern
                  const presses = (i - auxPatternIndex + AUX_PATTERNS.length) % AUX_PATTERNS.length;
                  for (let p = 0; p < presses; p++) onInput("7C");
                }}
              >
                <rect
                  x={x} y={y} width="110" height="80" rx="2"
                  fill={isActive ? "#2a2408" : "#1c1c1e"}
                  stroke={isActive ? "#D4A84B" : "#444"}
                  strokeWidth={isActive ? 2 : 1}
                />
                {/* Pattern indicator dot */}
                <circle cx={x + 55} cy={y + 24} r="10"
                  fill={isActive ? "#D4A84B" : "#555"}
                  opacity={pattern === "off" ? 0.2 : isActive ? 1 : 0.4}
                />
                {pattern === "blinking" && (
                  <text x={x + 55} y={y + 28} textAnchor="middle"
                    dominantBaseline="middle" fill={isActive ? "#D4A84B" : "#888"}
                    style={{ fontSize: "9px" }}>blink</text>
                )}
                <text x={x + 55} y={y + 46} textAnchor="middle"
                  dominantBaseline="middle"
                  className="statemap__node-label"
                  fill={isActive ? "#D4A84B" : "#888"}>
                  {PATTERN_LABELS[pattern]}
                </text>
                <text x={x + 55} y={y + 62} textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: "9px", fill: isActive ? "#a0883a" : "#555" }}>
                  {PATTERN_DESCRIPTIONS[pattern]}
                </text>
              </g>
            );
          })}

          {/* Cycle instruction */}
          <text x="280" y="175" textAnchor="middle" className="statemap__edge-label">
            7C — next pattern
          </text>
          <text x="280" y="193" textAnchor="middle" style={{ fontSize: "10px", fill: "#555" }}>
            Press 7C repeatedly to cycle · click a card to jump
          </text>

          {/* Legend: current selection */}
          <rect x="175" y="210" width="210" height="30" rx="2"
            fill="#1a1a1a" stroke="#333" strokeWidth="1" />
          <text x="280" y="229" textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: "11px", fill: "#888", fontFamily: "monospace" }}>
            CURRENT: {PATTERN_LABELS[currentPattern].toUpperCase()}
          </text>
        </svg>
      </div>
      <div className="statemap__legend">
        <span className="statemap__legend-item">
          <span className="statemap__legend-dot" style={{ background: stateGroups.config.color }} />
          Config
        </span>
      </div>
    </div>
  );
}

// ── Aux Color Config ──────────────────────────────────────────────────────────

export function StateMapAuxColor({ auxColorIndex, context = "off", onGoToState, onInput }) {
  const currentColor = AUX_COLORS[auxColorIndex] ?? "red";
  const isLockout = context === "lockout";
  const returnState = isLockout ? "LOCKOUT" : "OFF";
  const title = isLockout ? "Aux LED Color — Lockout Mode" : "Aux LED Color — Off Mode";
  const returnLabel = isLockout ? "Back to Lockout" : "Back to Off";

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">{title}</h3>
        <span className="statemap__mode">Advanced UI</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 620 300" xmlns="http://www.w3.org/2000/svg">
          {/* Return to parent state */}
          <g
            role="button"
            style={{ cursor: "pointer" }}
            onClick={() => onGoToState(returnState)}
          >
            <rect x="240" y="8" width="140" height="36" rx="2"
              fill="#1c1c1e" stroke="#D4A84B" strokeWidth="1.5" />
            <text x="310" y="31" textAnchor="middle" dominantBaseline="middle"
              className="statemap__node-label" fill="#D4A84B">{returnLabel}</text>
          </g>

          {/* Color swatches — 5 per row */}
          {AUX_COLORS.map((color, i) => {
            const isActive = color === currentColor;
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = 30 + col * 115;
            const y = 72 + row * 90;
            const hex = AUX_COLOR_HEX[color];
            const isAnimated = color === "disco" || color === "rainbow";

            return (
              <g
                key={color}
                role="button"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const presses = (i - auxColorIndex + AUX_COLORS.length) % AUX_COLORS.length;
                  for (let p = 0; p < presses; p++) onInput("7H");
                }}
              >
                <rect
                  x={x} y={y} width="105" height="72" rx="2"
                  fill={isActive ? "#1a1a28" : "#1c1c1e"}
                  stroke={isActive ? hex : "#333"}
                  strokeWidth={isActive ? 2 : 1}
                />
                {/* Color dot */}
                <circle cx={x + 52} cy={y + 22} r="12"
                  fill={isAnimated ? "none" : hex}
                  stroke={isAnimated ? hex : "none"}
                  strokeWidth={isAnimated ? 2 : 0}
                  opacity={isActive ? 1 : 0.6}
                />
                {isAnimated && (
                  <>
                    {DISCO_CYCLE_HEX.slice(0, 3).map((c, ci) => (
                      <circle key={ci}
                        cx={x + 38 + ci * 9} cy={y + 22} r="3"
                        fill={c} opacity={0.8} />
                    ))}
                  </>
                )}
                <text x={x + 52} y={y + 44} textAnchor="middle"
                  dominantBaseline="middle"
                  className="statemap__node-label"
                  fill={isActive ? hex : "#888"}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </text>
                {isAnimated && (
                  <text x={x + 52} y={y + 58} textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: "8px", fill: isActive ? "#888" : "#444" }}>
                    {color === "disco" ? "0.25 s" : "1 s"}
                  </text>
                )}
              </g>
            );
          })}

          {/* Cycle instruction */}
          <text x="310" y="276" textAnchor="middle" style={{ fontSize: "10px", fill: "#555" }}>
            Keep holding the button to cycle to the next color. Release to select the color
          </text>
        </svg>
      </div>
      <div className="statemap__legend">
        <span className="statemap__legend-item">
          <span className="statemap__legend-dot" style={{ background: stateGroups.config.color }} />
          Config
        </span>
      </div>
    </div>
  );
}
