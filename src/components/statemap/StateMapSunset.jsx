// Expanded sunset timer view — ramp bar on left, timer info and instructions on right
import { stateGroups } from "../../stateMachine/states.js";

const BAR_X = 48;
const BAR_Y = 28;
const BAR_W = 46;
const BAR_H = 215;

// Map an Anduril level (1–150) to a Y coordinate inside the bar
function barLevelY(lv) {
  const clamped = Math.max(1, Math.min(150, lv));
  return BAR_Y + BAR_H * (1 - (clamped - 1) / 149);
}

// Preset zone Y positions (approximate Anduril defaults)
const CEIL_Y  = BAR_Y + Math.round(BAR_H * (1 - (120 - 1) / 149)); // ~level 120
const FLOOR_Y = BAR_Y + Math.round(BAR_H * (1 - ( 20 - 1) / 149)); // ~level 20

export default function StateMapSunset({
  level, sunsetMinutes, isAdvanced, onGoToState,
}) {
  const curY     = level > 0 ? barLevelY(level) : null;
  const isActive = sunsetMinutes > 0;

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">Sunset Timer</h3>
        <span className="statemap__mode">{isAdvanced ? "Advanced UI" : "Simple UI"}</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 620 285" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sunsetBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#D4A84B" stopOpacity="0.9" />
              <stop offset="28%"  stopColor="#b88a3a" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#222224" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* ── Ramp bar (display only — current brightness) ───────── */}
          <rect x={BAR_X} y={BAR_Y} width={BAR_W} height={BAR_H} rx="2"
            fill="url(#sunsetBarGrad)"
            stroke="#D4A84B" strokeWidth="1.5" strokeOpacity="0.5"
          />

          {/* Zone dashes */}
          <line x1={BAR_X} y1={CEIL_Y}  x2={BAR_X + BAR_W} y2={CEIL_Y}
            stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="3 3" />
          <line x1={BAR_X} y1={FLOOR_Y} x2={BAR_X + BAR_W} y2={FLOOR_Y}
            stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.20" strokeDasharray="3 3" />

          {/* Zone labels (right of bar) */}
          <text x={BAR_X + BAR_W + 6} y={BAR_Y + 8}   className="statemap__ramp-marker">TURBO</text>
          <text x={BAR_X + BAR_W + 6} y={CEIL_Y  + 4}  className="statemap__ramp-marker">CEIL</text>
          <text x={BAR_X + BAR_W + 6} y={FLOOR_Y + 4}  className="statemap__ramp-marker">FLOOR</text>

          {/* Current level indicator */}
          {curY !== null && (
            <>
              <line x1={BAR_X - 8} y1={curY} x2={BAR_X + BAR_W + 8} y2={curY}
                stroke="#D4A84B" strokeWidth="2" strokeOpacity="0.95" />
              <text x={BAR_X - 4} y={curY + 4} textAnchor="end" className="statemap__ramp-level">
                {level}
              </text>
            </>
          )}

          {/* Dimmed-out overlay above current position (shows how far it has dimmed) */}
          {isActive && curY !== null && curY > BAR_Y + 2 && (
            <rect x={BAR_X + 1} y={BAR_Y + 1} width={BAR_W - 2} height={curY - BAR_Y - 1} rx="1"
              fill="#000" fillOpacity="0.3" />
          )}

          {/* ── Timer status box ──────────────────────────────────────── */}
          <rect x="140" y="14" width="220" height="60" rx="2"
            fill={isActive ? "#1a1a08" : "#1c1c1e"}
            stroke={isActive ? "#D4A84B" : "#444"}
            strokeWidth={isActive ? 1.5 : 1}
          />
          {isActive ? (
            <>
              <text x="250" y="36" textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: "24px", fill: "#D4A84B", fontFamily: "monospace", fontWeight: "bold" }}>
                {sunsetMinutes} min
              </text>
              <text x="250" y="59" textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: "10px", fill: "#888" }}>
                remaining · slowly dimming to floor then off
              </text>
            </>
          ) : (
            <>
              <text x="250" y="36" textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: "14px", fill: "#555" }}>
                Timer inactive
              </text>
              <text x="250" y="56" textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: "10px", fill: "#444" }}>
                5H from ramp to activate
              </text>
            </>
          )}

          {/* ── Off exit node ─────────────────────────────────────────── */}
          <g role="button" style={{ cursor: "pointer" }} onClick={() => onGoToState("OFF")}>
            <rect x="404" y="14" width="100" height="32" rx="2"
              fill="#1c1c1e" stroke="#D4A84B" strokeWidth="1.5" />
            <text x="454" y="34" textAnchor="middle" dominantBaseline="middle"
              className="statemap__node-label" fill="#D4A84B">Off</text>
          </g>
          <text x="454" y="57" textAnchor="middle" className="statemap__edge-label">← 1C (cancel)</text>

          {/* ── How it works — two info cards ─────────────────────────── */}
          {/* Card: Activation */}
          <rect x="140" y="86" width="180" height="98" rx="2" fill="#1c1c1e" stroke="#333" />
          <text x="150" y="104" className="statemap__edge-label" style={{ fill: "#D4A84B" }}>
            Activating the timer
          </text>
          <text x="150" y="120" style={{ fontSize: "9.5px", fill: "#777" }}>From ramp, do a 5H action.</text>
          <text x="150" y="134" style={{ fontSize: "9.5px", fill: "#777" }}>Keep holding — the light blinks</text>
          <text x="150" y="148" style={{ fontSize: "9.5px", fill: "#777" }}>once per second.</text>
          <text x="150" y="162" style={{ fontSize: "9.5px", fill: "#777" }}>Each blink adds 5 minutes.</text>
          <text x="150" y="176" style={{ fontSize: "9.5px", fill: "#555", fontStyle: "italic" }}>
            Release to start the countdown.
          </text>

          {/* Card: Brightness & bump */}
          <rect x="330" y="86" width="180" height="98" rx="2" fill="#1c1c1e" stroke="#333" />
          <text x="340" y="104" className="statemap__edge-label" style={{ fill: "#888" }}>
            While timer is running
          </text>
          <text x="340" y="120" style={{ fontSize: "9.5px", fill: "#777" }}>Light dims slowly to floor,</text>
          <text x="340" y="134" style={{ fontSize: "9.5px", fill: "#777" }}>then shuts off.</text>
          <text x="340" y="150" style={{ fontSize: "9.5px", fill: "#777" }}>Adjust brightness (1H / 2H):</text>
          <text x="340" y="164" style={{ fontSize: "9.5px", fill: "#777" }}>bumps timer to ≥ 3 min.</text>
          <text x="340" y="178" style={{ fontSize: "9.5px", fill: "#777" }}>5H again to add more time.</text>

          {/* ── Action quick-reference ─────────────────────────────────── */}
          <line x1="140" y1="198" x2="530" y2="198" stroke="#2a2a2a" strokeWidth="1" />

          <rect x="140" y="204" width="88" height="28" rx="2" fill="#181818" stroke="#2a2a2a" />
          <text x="184" y="214" textAnchor="middle" dominantBaseline="middle"
            className="statemap__edge-label">1H ↑ ramp up</text>

          <rect x="234" y="204" width="88" height="28" rx="2" fill="#181818" stroke="#2a2a2a" />
          <text x="278" y="214" textAnchor="middle" dominantBaseline="middle"
            className="statemap__edge-label">2H ↓ ramp down</text>

          <rect x="328" y="204" width="88" height="28" rx="2" fill="#181818" stroke="#2a2a2a" />
          <text x="372" y="214" textAnchor="middle" dominantBaseline="middle"
            className="statemap__edge-label">2C ceiling</text>

          <rect x="422" y="204" width="108" height="28" rx="2" fill="#181818" stroke="#2a2a2a" />
          <text x="476" y="214" textAnchor="middle" dominantBaseline="middle"
            className="statemap__edge-label">5H add 5 min</text>

          <text x="335" y="252" textAnchor="middle"
            style={{ fontSize: "9px", fill: "#3a3a3a" }}>
            Simulator time: 1 displayed minute = 1 real second
          </text>
        </svg>
      </div>
      <div className="statemap__legend">
        <span className="statemap__legend-item">
          <span className="statemap__legend-dot" style={{ background: stateGroups.core.color }} />
          Core
        </span>
      </div>
    </div>
  );
}
