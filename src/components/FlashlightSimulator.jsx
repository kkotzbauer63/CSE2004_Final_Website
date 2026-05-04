import "./FlashlightSimulator.css";
import { CM_PHASE } from "../utils/configMenuEngine.js";

// Convert Anduril level (1–150) to a 0–100 percentage for the visual
function levelToPercent(lvl) {
  return lvl > 0 ? ((lvl - 1) / 149) * 100 : 0;
}

export default function FlashlightSimulator({
  stateInfo,
  brightness,
  level,
  lastAction,
  buttonHandlers,
  isButtonPressed,
  pendingInput,
  auxDisplay,
  readoutLevel = null,  // Anduril level (0–150) from useReadout/useConfigMenu; overrides beam
  configInfo   = null,  // { phase, itemIndex, currentValue, node } from useConfigMenu
}) {
  // When a readout is playing, override the beam brightness with the readout level
  const activeBrightness = readoutLevel !== null ? levelToPercent(readoutLevel) : brightness;
  const activeLevel      = readoutLevel !== null ? readoutLevel : level;

  const pct  = activeBrightness / 100; // 0–1
  const isOn = activeBrightness > 0;

  // Beam size scales: 40px at min → 200px at max
  const beamWidth = 40 + pct * 160;
  const beamHeight = 30 + pct * 106;
  const coreOpacity = 0.1 + pct * 0.6;
  const glowOpacity = pct * 0.3;

  // Resolve button indicator color and pattern from auxDisplay
  const auxColor   = auxDisplay?.color ?? null;   // hex or null
  const auxPattern = auxDisplay?.pattern ?? null; // "off"|"low"|"high"|"blinking"|null

  // Button face: pressed → dark; on → amber; aux pattern off → neutral; else → aux color
  const buttonFill =
    isButtonPressed ? "#555"
    : isOn          ? "#D4A84B"
    : (!auxColor || auxPattern === "off") ? "#d8d8d8"
    : auxColor;

  // Ring matches button color
  const ringStroke  = isOn ? "#D4A84B" : (auxColor ?? "#a2e4ff");
  const ringOpacity = isOn ? 0.9 : auxPattern === "low" ? 0.45 : 0.85;

  // Add blinking class when aux is in blinking pattern and light is off
  const isBlinking  = !isOn && auxPattern === "blinking";

  return (
    <div className="simulator">
      <div className="simulator__visual">
        {/* Beam — emits upward from head */}
        {isOn && (
          <div className="simulator__beam-container">
            <div className="simulator__beam" style={{ width: beamWidth }}>
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

        {/* Emisar D4V2 flashlight SVG */}
        <svg
          className="simulator__flashlight"
          viewBox="0 0 200 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#777" />
              <stop offset="20%"  stopColor="#d9d9d9" />
              <stop offset="50%"  stopColor="#ffffff" />
              <stop offset="80%"  stopColor="#c4c4c4" />
              <stop offset="100%" stopColor="#666" />
            </linearGradient>

            <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#1a639e" />
              <stop offset="25%"  stopColor="#3b96d9" />
              <stop offset="50%"  stopColor="#63b6f2" />
              <stop offset="75%"  stopColor="#3b96d9" />
              <stop offset="100%" stopColor="#114b7d" />
            </linearGradient>

            <linearGradient id="dark-blue-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#0d3b61" />
              <stop offset="50%"  stopColor="#1c669e" />
              <stop offset="100%" stopColor="#0a2a47" />
            </linearGradient>

            <radialGradient id="button-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffffff" />
              <stop offset="80%"  stopColor="#f0f0f0" />
              <stop offset="100%" stopColor="#cccccc" />
            </radialGradient>

            <pattern id="knurling" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="url(#blue-grad)" />
              <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#114b7d" strokeWidth="0.8" opacity="0.6" />
              <path d="M 0 3 L 6 3 M 3 0 L 3 6" stroke="#63b6f2" strokeWidth="0.5" opacity="0.4" />
            </pattern>

            <pattern id="ridges" width="6" height="20" patternUnits="userSpaceOnUse">
              <rect width="6" height="20" fill="url(#blue-grad)" />
              <line x1="0" y1="0" x2="0" y2="20" stroke="#114b7d" strokeWidth="1.5" />
              <line x1="1" y1="0" x2="1" y2="20" stroke="#87ccff" strokeWidth="0.5" opacity="0.7" />
            </pattern>
          </defs>

          <g id="emisar-d4v2" stroke="#1a252c" strokeWidth="1.5">
            {/* Emitter face / top cap */}
            <rect x="40" y="20" width="120" height="35" fill="url(#silver-grad)" rx="2" />

            {/* Cooling fins — left column */}
            <rect x="44" y="72"  width="10" height="8" fill="url(#dark-blue-grad)" stroke="none" />
            <rect x="44" y="88"  width="10" height="8" fill="url(#dark-blue-grad)" stroke="none" />
            <rect x="44" y="104" width="10" height="8" fill="url(#dark-blue-grad)" stroke="none" />
            <rect x="44" y="120" width="10" height="8" fill="url(#dark-blue-grad)" stroke="none" />
            {/* Cooling fins — right column */}
            <rect x="146" y="72"  width="10" height="8" fill="url(#dark-blue-grad)" stroke="none" />
            <rect x="146" y="88"  width="10" height="8" fill="url(#dark-blue-grad)" stroke="none" />
            <rect x="146" y="104" width="10" height="8" fill="url(#dark-blue-grad)" stroke="none" />
            <rect x="146" y="120" width="10" height="8" fill="url(#dark-blue-grad)" stroke="none" />

            {/* Head body */}
            <path
              d="M 40 55
                 L 160 55
                 L 160 72 L 146 72 L 146 80 L 160 80
                 L 160 88 L 146 88 L 146 96 L 160 96
                 L 160 104 L 146 104 L 146 112 L 160 112
                 L 160 120 L 146 120 L 146 128 L 160 128
                 L 160 145
                 L 40 145
                 L 40 128 L 54 128 L 54 120 L 40 120
                 L 40 112 L 54 112 L 54 104 L 40 104
                 L 40 96 L 54 96 L 54 88 L 40 88
                 L 40 80 L 54 80 L 54 72 L 40 72
                 Z"
              fill="url(#blue-grad)"
            />

            {/* Button bezel rings (static) */}
            <circle cx="100" cy="100" r="38" fill="url(#dark-blue-grad)" stroke="none" opacity="0.5" />
            <circle cx="100" cy="100" r="35" fill="url(#blue-grad)" />
            <circle cx="100" cy="100" r="30" fill="url(#silver-grad)" stroke="#444" strokeWidth="1" />
            <circle cx="100" cy="100" r="24" fill="#333" stroke="none" />

            {/* Lens glow when on */}
            {isOn && (
              <rect
                x="40" y="20" width="120" height="35" rx="2"
                fill={`rgba(255, 248, 220, ${0.25 + pct * 0.55})`}
                stroke="none"
              />
            )}
          </g>

          {/* Interactive button group — button acts as aux indicator */}
          <g
            role="button"
            aria-label="Flashlight button"
            className={[
              "simulator__button-group",
              isButtonPressed ? "simulator__button-group--pressed" : "",
              isBlinking      ? "simulator__button-group--blinking" : "",
            ].filter(Boolean).join(" ")}
            {...(buttonHandlers ?? {})}
            style={{ cursor: "pointer", touchAction: "none", userSelect: "none" }}
          >
            {/* Soft glow behind button */}
            {(isOn || auxColor) && (
              <circle
                cx="100" cy="100" r="27"
                fill={isOn ? "#D4A84B" : auxColor}
                opacity="0.18"
                pointerEvents="none"
              />
            )}
            {/* Extended transparent hit area */}
            <circle cx="100" cy="100" r="26" fillOpacity={0} fill="white" />
            {/* Button face — dynamic color */}
            <circle
              cx="100" cy="100" r="22"
              fill={buttonFill}
              stroke="#aaa"
              strokeWidth="0.5"
            />
            {/* Indicator ring — shows aux color or amber */}
            <circle
              cx="100" cy="100" r="23"
              fill="none"
              stroke={ringStroke}
              strokeWidth="2.5"
              opacity={ringOpacity}
              pointerEvents="none"
            />
          </g>

          {/* Neck transition */}
          <g stroke="#1a252c" strokeWidth="1.5">
            <rect x="44" y="145" width="112" height="17" fill="url(#blue-grad)" />
            <rect x="48" y="162" width="104" height="17" fill="url(#blue-grad)" />
            <rect x="52" y="179" width="96"  height="16" fill="url(#blue-grad)" />

            {/* Body tube — knurled */}
            <rect x="52" y="195" width="96" height="215" fill="url(#knurling)" />

            {/* Lower transition */}
            <rect x="52" y="410" width="96"  height="15" fill="url(#blue-grad)" />
            <rect x="48" y="425" width="104" height="15" fill="url(#blue-grad)" />
            <rect x="44" y="440" width="112" height="15" fill="url(#blue-grad)" />

            {/* Tail section — ridged */}
            <rect x="44" y="455" width="112" height="60" fill="url(#ridges)" />

            {/* Tail cap */}
            <rect x="44" y="515" width="112" height="20" fill="url(#blue-grad)" />
            <rect x="44" y="535" width="112" height="8"  fill="url(#dark-blue-grad)" rx="2" />
          </g>
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
            {activeLevel > 0 ? `${activeLevel} / 150` : "Off"}
          </span>
        </div>
        <div className="simulator__status-row">
          <span className="simulator__label">BRIGHT</span>
          <span className="simulator__value simulator__value--mono">
            {Math.round(activeBrightness)}%
          </span>
        </div>
        {/* Aux LED status — only shown in off/lockout when not ramping */}
        {auxDisplay && (
          <div className="simulator__status-row">
            <span className="simulator__label">AUX</span>
            <span className="simulator__value simulator__value--mono simulator__value--aux">
              {auxDisplay.pattern === "off"
                ? "off"
                : `${auxDisplay.pattern} · ${auxDisplay.colorName}`}
            </span>
          </div>
        )}
        {/* Config menu status — shown while a config menu is active */}
        {configInfo && (
          <>
            <div className="simulator__status-row simulator__status-row--config">
              <span className="simulator__label">CFG ITEM</span>
              <span className="simulator__value simulator__value--mono">
                {configInfo.itemIndex + 1}
                {configInfo.node?.menuItems
                  ? ` / ${configInfo.node.menuItems.length} — ${configInfo.node.menuItems[configInfo.itemIndex]?.name ?? ""}`
                  : ""}
              </span>
            </div>
            <div className="simulator__status-row simulator__status-row--config">
              <span className="simulator__label">
                {configInfo.phase === CM_PHASE.PRESENTING ? "ACTION" : "VALUE"}
              </span>
              <span className="simulator__value simulator__value--mono">
                {configInfo.phase === CM_PHASE.PRESENTING
                  ? "hold = skip · release = enter"
                  : `${configInfo.currentValue} (click +1 · hold +10 · wait = confirm)`}
              </span>
            </div>
          </>
        )}
        {/* Live pending input sequence indicator */}
        {pendingInput && (pendingInput.clickCount > 0 || pendingInput.isDown) && (
          <div className="simulator__status-row simulator__status-row--pending">
            <span className="simulator__label">INPUT</span>
            <span className="simulator__value simulator__value--mono simulator__value--pending">
              {pendingInput.holdDetected
                ? `${pendingInput.clickCount + 1}H`
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
