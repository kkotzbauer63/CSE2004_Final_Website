// Expanded sunset timer view — ramp bar on left, timer info and instructions on right
import { stateGroups } from "../../stateMachine/states.js";

const BAR_X = 48;
const BAR_Y = 28;
const BAR_W = 46;
const BAR_H = 215;

function barLevelY(lv) {
  const clamped = Math.max(1, Math.min(150, lv));
  return BAR_Y + BAR_H * (1 - (clamped - 1) / 149);
}

const CEIL_Y  = BAR_Y + Math.round(BAR_H * (1 - (120 - 1) / 149));
const FLOOR_Y = BAR_Y + Math.round(BAR_H * (1 - ( 20 - 1) / 149));

function fmtTime(totalSeconds) {
  const s = Math.ceil(totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function StateMapSunset({
  level, sunsetSeconds, sunsetSpeedMultiplier, toggleSunsetSpeed, isAdvanced, onGoToState,
}) {
  const curY     = level > 0 ? barLevelY(level) : null;
  const isActive = sunsetSeconds > 0;
  const is10x    = sunsetSpeedMultiplier === 10;

  return (
    <div className="statemap">
      <div className="statemap__header">
        <h3 className="statemap__title">Sunset Timer</h3>
        <span className="statemap__mode">{isAdvanced ? "Advanced UI" : "Simple UI"}</span>
      </div>
      <div className="statemap__container">
        <svg className="statemap__svg" viewBox="0 0 620 290" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sunsetBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#D4A84B" stopOpacity="0.9" />
              <stop offset="28%"  stopColor="#b88a3a" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#222224" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* ── Ramp bar (display — current brightness) ─────────────── */}
          <rect x={BAR_X} y={BAR_Y} width={BAR_W} height={BAR_H} rx="2"
            fill="url(#sunsetBarGrad)"
            stroke="#D4A84B" strokeWidth="1.5" strokeOpacity="0.5"
          />
          <line x1={BAR_X} y1={CEIL_Y}  x2={BAR_X + BAR_W} y2={CEIL_Y}
            stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="3 3" />
          <line x1={BAR_X} y1={FLOOR_Y} x2={BAR_X + BAR_W} y2={FLOOR_Y}
            stroke="#D4A84B" strokeWidth="1" strokeOpacity="0.20" strokeDasharray="3 3" />

          <text x={BAR_X + BAR_W + 6} y={BAR_Y + 8}    className="statemap__ramp-marker">TURBO</text>
          <text x={BAR_X + BAR_W + 6} y={CEIL_Y  + 4}  className="statemap__ramp-marker">CEIL</text>
          <text x={BAR_X + BAR_W + 6} y={FLOOR_Y + 4}  className="statemap__ramp-marker">FLOOR</text>

          {curY !== null && (
            <>
              <line x1={BAR_X - 8} y1={curY} x2={BAR_X + BAR_W + 8} y2={curY}
                stroke="#D4A84B" strokeWidth="2" strokeOpacity="0.95" />
              <text x={BAR_X - 4} y={curY + 4} textAnchor="end" className="statemap__ramp-level">
                {level}
              </text>
            </>
          )}

          {/* Dimmed overlay above current position when timer is running */}
          {isActive && curY !== null && curY > BAR_Y + 2 && (
            <rect x={BAR_X + 1} y={BAR_Y + 1} width={BAR_W - 2}
              height={Math.max(0, curY - BAR_Y - 1)} rx="1"
              fill="#000" fillOpacity="0.3" />
          )}

          {/* ── Timer status box ─────────────────────────────────────── */}
          <rect x="140" y="14" width="200" height="60" rx="2"
            fill={isActive ? "#1a1a08" : "#1c1c1e"}
            stroke={isActive ? "#D4A84B" : "#444"}
            strokeWidth={isActive ? 1.5 : 1}
          />
          {isActive ? (
            <>
              <text x="240" y="38" textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: "26px", fill: "#D4A84B", fontFamily: "monospace", fontWeight: "bold" }}>
                {fmtTime(sunsetSeconds)}
              </text>
              <text x="240" y="60" textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: "10px", fill: "#888" }}>
                remaining · dimming to floor then off
              </text>
            </>
          ) : (
            <>
              <text x="240" y="36" textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: "14px", fill: "#555" }}>
                Timer inactive
              </text>
              <text x="240" y="56" textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: "10px", fill: "#444" }}>
                5H from ramp to activate
              </text>
            </>
          )}

          {/* ── Speed toggle button ──────────────────────────────────── */}
          <g role="button" style={{ cursor: "pointer" }} onClick={toggleSunsetSpeed}>
            <rect x="140" y="83" width="200" height="28" rx="2"
              fill={is10x ? "#1a120a" : "#1c1c1e"}
              stroke={is10x ? "#D4A84B" : "#555"}
              strokeWidth={is10x ? 1.5 : 1}
            />
            <text x="240" y="101" textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: "11px", fill: is10x ? "#D4A84B" : "#777", fontFamily: "monospace" }}>
              {is10x ? "⚡ 10× speed  (click to reset)" : "1× speed  (click for 10× faster)"}
            </text>
          </g>

          {/* ── Off exit node ─────────────────────────────────────────── */}
          <g role="button" style={{ cursor: "pointer" }} onClick={() => onGoToState("OFF")}>
            <rect x="358" y="14" width="100" height="32" rx="2"
              fill="#1c1c1e" stroke="#D4A84B" strokeWidth="1.5" />
            <text x="408" y="34" textAnchor="middle" dominantBaseline="middle"
              className="statemap__node-label" fill="#D4A84B">Off</text>
          </g>
          <text x="408" y="57" textAnchor="middle" className="statemap__edge-label">← 1C (cancel)</text>

          {/* ── How it works cards ───────────────────────────────────── */}
          <rect x="140" y="121" width="188" height="96" rx="2" fill="#1c1c1e" stroke="#333" />
          <text x="150" y="139" className="statemap__edge-label" style={{ fill: "#D4A84B" }}>
            Activating the timer
          </text>
          <text x="150" y="155" style={{ fontSize: "9.5px", fill: "#777" }}>From ramp, do a 5H action.</text>
          <text x="150" y="169" style={{ fontSize: "9.5px", fill: "#777" }}>Keep holding — blinks once/sec.</text>
          <text x="150" y="183" style={{ fontSize: "9.5px", fill: "#777" }}>Each blink adds 5 minutes.</text>
          <text x="150" y="197" style={{ fontSize: "9.5px", fill: "#555", fontStyle: "italic" }}>
            Release to start countdown.
          </text>
          <text x="150" y="210" style={{ fontSize: "9.5px", fill: "#777" }}>5H while active: add more time.</text>

          <rect x="336" y="121" width="188" height="96" rx="2" fill="#1c1c1e" stroke="#333" />
          <text x="346" y="139" className="statemap__edge-label" style={{ fill: "#888" }}>
            While timer runs
          </text>
          <text x="346" y="155" style={{ fontSize: "9.5px", fill: "#777" }}>Dims slowly to floor, then off.</text>
          <text x="346" y="171" style={{ fontSize: "9.5px", fill: "#777" }}>Adjust brightness (1H / 2H):</text>
          <text x="346" y="185" style={{ fontSize: "9.5px", fill: "#777" }}>bumps timer to ≥ 3 min.</text>
          <text x="346" y="201" style={{ fontSize: "9.5px", fill: "#555" }}>In candle mode: dims only</text>
          <text x="346" y="213" style={{ fontSize: "9.5px", fill: "#555" }}>in the final minute.</text>

          {/* ── Action quick-reference ─────────────────────────────────── */}
          <line x1="140" y1="228" x2="530" y2="228" stroke="#2a2a2a" strokeWidth="1" />

          <rect x="140" y="234" width="88" height="26" rx="2" fill="#181818" stroke="#2a2a2a" />
          <text x="184" y="249" textAnchor="middle" dominantBaseline="middle"
            className="statemap__edge-label">1H ↑ ramp up</text>

          <rect x="234" y="234" width="88" height="26" rx="2" fill="#181818" stroke="#2a2a2a" />
          <text x="278" y="249" textAnchor="middle" dominantBaseline="middle"
            className="statemap__edge-label">2H ↓ ramp dn</text>

          <rect x="328" y="234" width="88" height="26" rx="2" fill="#181818" stroke="#2a2a2a" />
          <text x="372" y="249" textAnchor="middle" dominantBaseline="middle"
            className="statemap__edge-label">2C ceiling</text>

          <rect x="422" y="234" width="108" height="26" rx="2" fill="#181818" stroke="#2a2a2a" />
          <text x="476" y="249" textAnchor="middle" dominantBaseline="middle"
            className="statemap__edge-label">5H +5 min</text>

          <text x="335" y="274" textAnchor="middle"
            style={{ fontSize: "9px", fill: "#3a3a3a" }}>
            Real timer: 5 min = 5 real minutes · use 10× speed for quick demo
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
