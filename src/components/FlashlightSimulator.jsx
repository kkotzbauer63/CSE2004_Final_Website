import { useMemo } from "react";
import "./FlashlightSimulator.css";

// Aux LED color cycle
const AUX_COLORS = ["#ff3333", "#33ff33", "#3388ff", "#ffaa00", "#00dddd", "#cc44ff", "#ffffff"];

export default function FlashlightSimulator({
  stateInfo,
  brightness,
  level,
  lastAction,
  buttonHandlers,
  isButtonPressed,
  pendingInput,
}) {
  const pct = brightness / 100; // 0–1
  const isOn = brightness > 0;

  // Beam size scales: 40px at min → 200px at max
  const beamWidth = 40 + pct * 160;
  // Beam height scales too
  const beamHeight = 30 + pct * 106; // 30px → 136px (fills container at max)
  // Core opacity scales
  const coreOpacity = 0.1 + pct * 0.6;
  // Outer glow opacity
  const glowOpacity = pct * 0.3;

  // Derive aux LED color from state (simple visual indicator)
  const auxColor = useMemo(() => {
    if (isOn) return null;
    if (!stateInfo) return AUX_COLORS[0];
    const hash = stateInfo.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return AUX_COLORS[hash % AUX_COLORS.length];
  }, [stateInfo, isOn]);

  return (
    <div className="simulator">
      <div className="simulator__visual">
        {/* Beam — centered above flashlight head */}
        {isOn && (
          <div className="simulator__beam-container">
            <div
              className="simulator__beam"
              style={{ width: beamWidth }}
            >
              <div
                className="simulator__beam-glow"
                style={{
                  background: `radial-gradient(
                    ellipse 100% 100% at 50% 100%,
                    rgba(255, 248, 220, ${coreOpacity}) 0%,
                    rgba(255, 248, 220, ${glowOpacity}) 40%,
                    transparent 70%
                  )`,
                  height: beamHeight,
                }}
              />
            </div>
          </div>
        )}

        {/* Flashlight SVG */}
        <svg
          className="simulator__flashlight"
          viewBox="0 0 120 280"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head */}
          <rect x="10" y="60" width="100" height="50" rx="2" fill="#3a3a3c" stroke="#555" strokeWidth="1" />
          {/* Bezel ring */}
          <rect x="8" y="56" width="104" height="8" rx="1" fill="#4a4a4c" stroke="#666" strokeWidth="0.5" />
          {/* Lens */}
          <rect
            x="20" y="62" width="80" height="6" rx="1"
            fill={isOn ? `rgba(255, 248, 220, ${0.3 + pct * 0.7})` : "#1a1a1c"}
            stroke="#555"
            strokeWidth="0.5"
          />

          {/* Aux LEDs (4 dots on the head) */}
          {auxColor && !isOn && (
            <>
              <circle cx="30" cy="100" r="3" fill={auxColor} opacity="0.8" />
              <circle cx="50" cy="100" r="3" fill={auxColor} opacity="0.8" />
              <circle cx="70" cy="100" r="3" fill={auxColor} opacity="0.8" />
              <circle cx="90" cy="100" r="3" fill={auxColor} opacity="0.8" />
            </>
          )}

          {/* Body tube */}
          <rect x="25" y="110" width="70" height="130" rx="2" fill="#2c2c2e" stroke="#555" strokeWidth="1" />
          {/* Knurling pattern */}
          {Array.from({ length: 12 }, (_, i) => (
            <line
              key={i}
              x1="28"
              y1={118 + i * 10}
              x2="92"
              y2={118 + i * 10}
              stroke="#3a3a3c"
              strokeWidth="0.5"
            />
          ))}

          {/* Button (side switch) — interactive */}
          <g
            role="button"
            aria-label="Flashlight button"
            className={`simulator__button-group${isButtonPressed ? " simulator__button-group--pressed" : ""}`}
            {...(buttonHandlers ?? {})}
            style={{ cursor: "pointer", touchAction: "none", userSelect: "none" }}
          >
            {/* Larger transparent hit area for easier tapping */}
            <rect x="85" y="138" width="30" height="30" rx="4" fill="transparent" />
            {/* Button housing */}
            <rect x="93" y="145" width="12" height="16" rx="3" fill="#4a4a4c" stroke="#666" strokeWidth="0.5" />
            {/* Button cap — depresses slightly when held */}
            <rect
              x="95"
              y={isButtonPressed ? 149 : 148}
              width="8"
              height={isButtonPressed ? 9 : 10}
              rx="2"
              fill={isOn ? "#D4A84B" : isButtonPressed ? "#777" : "#333"}
            />
          </g>

          {/* Tail cap */}
          <rect x="28" y="240" width="64" height="20" rx="3" fill="#3a3a3c" stroke="#555" strokeWidth="1" />
        </svg>
      </div>

      {/* Status readout */}
      <div className="simulator__status">
        <div className="simulator__status-row">
          <span className="simulator__label">STATE</span>
          <span className="simulator__value simulator__value--state">
            {stateInfo?.name ?? "Unknown"}
          </span>
        </div>
        <div className="simulator__status-row">
          <span className="simulator__label">LEVEL</span>
          <span className="simulator__value simulator__value--mono">
            {level > 0 ? `${level} / 150` : "Off"}
          </span>
        </div>
        <div className="simulator__status-row">
          <span className="simulator__label">BRIGHT</span>
          <span className="simulator__value simulator__value--mono">
            {Math.round(brightness)}%
          </span>
        </div>
        {/* Live pending input sequence indicator */}
        {pendingInput && (pendingInput.clickCount > 0 || pendingInput.isDown) && (
          <div className="simulator__status-row simulator__status-row--pending">
            <span className="simulator__label">INPUT</span>
            <span className="simulator__value simulator__value--mono simulator__value--pending">
              {pendingInput.holdDetected
                ? `${pendingInput.clickCount}H`
                : pendingInput.isDown
                  ? `${pendingInput.clickCount + 1}…`
                  : `${pendingInput.clickCount}C…`}
            </span>
          </div>
        )}
        {lastAction && (
          <div className="simulator__status-row simulator__status-row--action">
            <span className="simulator__label">ACTION</span>
            <span className="simulator__value simulator__value--action">
              {lastAction}
            </span>
          </div>
        )}
        <p className="simulator__description">{stateInfo?.description}</p>
      </div>
    </div>
  );
}
