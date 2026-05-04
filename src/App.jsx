import { useMemo, useEffect, useRef, useState } from "react";
import { useStateMachine } from "./hooks/useStateMachine.js";
import { useButtonInput } from "./hooks/useButtonInput.js";
import { useReadout } from "./hooks/useReadout.js";
import { useConfigMenu } from "./hooks/useConfigMenu.js";
import {
  encodeVoltage,
  encodeTemperature,
  encodeVersion,
} from "./utils/readoutEncoder.js";
import { nodeMap } from "./data/graph.js";
import { NODE_TYPE } from "./data/constants.js";
import FlashlightSimulator from "./components/FlashlightSimulator.jsx";
import TransitionPanel from "./components/TransitionPanel.jsx";
import StateMap from "./components/StateMap.jsx";
import ReferenceGuide from "./components/ReferenceGuide.jsx";
import "./App.css";

// Demo values shown while in the respective readout states.
const DEMO_VOLTAGE     = 4.16;
const DEMO_TEMPERATURE = 25;
// Format: MODEL-YYYY-MM-DD-SINCE-DIRTY (Anduril 2 from 2023-12 or later)
const DEMO_VERSION     = "0281-2025-07-07-0-0";

/** How many configurable items does a config menu node have? */
function getItemCount(node) {
  if (!node) return 0;
  if (node.menuItems)    return node.menuItems.length;
  if (node.menuVariants) return Object.values(node.menuVariants)[0]?.length ?? 1;
  return 1;
}

export default function App() {
  const {
    currentState,
    stateInfo,
    uiMode,
    setUiMode,
    lastAction,
    brightness,
    level,
    rampStyle,
    availableTransitions,
    handleInput,
    startRamp,
    stopRamp,
    goToState,
    history,
    auxDisplay,
    auxPatternIndex,
    auxColorIndex,
    sunsetMinutes,
    addSunsetMinutes,
  } = useStateMachine("OFF");

  // ── Normal button input (used when NOT in a config menu) ────────────────
  const { buttonHandlers, isButtonPressed, pendingInput, cancelInput } = useButtonInput({
    handleInput,
    startRamp,
    stopRamp,
  });

  // ── Readout flash sequences (battery / temp / version) ──────────────────
  const readoutSequence = useMemo(() => {
    if (currentState === "BATTERY_CHECK")     return encodeVoltage(DEMO_VOLTAGE);
    if (currentState === "TEMPERATURE_CHECK") return encodeTemperature(DEMO_TEMPERATURE);
    if (currentState === "VERSION_CHECK")     return encodeVersion(DEMO_VERSION);
    return null;
  }, [currentState]);

  // VERSION_CHECK loops until 1C (same as battery/temp check)
  const loopReadout = currentState === "BATTERY_CHECK" || currentState === "TEMPERATURE_CHECK" || currentState === "VERSION_CHECK";
  const { readoutLevel, isPlaying: readoutPlaying } = useReadout(readoutSequence, {
    loop: loopReadout,
  });

  // ── Config menu ──────────────────────────────────────────────────────────
  const {
    configLevel,
    isActive:     configActive,
    phase:        configPhase,
    itemIndex:    configItemIndex,
    currentValue: configCurrentValue,
    start:        startConfigMenu,
    onPress:      configPress,
    onRelease:    configRelease,
  } = useConfigMenu();

  // Keep a ref to isButtonPressed so the effect can read it without re-running
  const isButtonPressedRef = useRef(false);
  isButtonPressedRef.current = isButtonPressed;

  // Track level in a ref to read current value inside sunset interval without stale closure
  const levelRef = useRef(level);
  levelRef.current = level;

  // Start the config menu whenever we enter a CONFIG_MENU state
  useEffect(() => {
    const node = nodeMap[currentState];
    if (node?.type !== NODE_TYPE.CONFIG_MENU) return;

    // The config menu was entered via a hold (e.g. 7H).  The normal button
    // handler still has isHeld=true and a non-zero clickCount from that
    // sequence.  Cancel it now so it starts clean when we return.
    cancelInput();

    const itemCount = getItemCount(node);
    const returnsTo = node.returnsTo ?? "OFF";

    startConfigMenu(
      itemCount,
      (results) => {
        // Results are available here for any UI that wants to show them.
        // Return to the state the user was in before entering the config menu.
        goToState(returnsTo);
      },
      isButtonPressedRef.current,   // true when entered via a hold (e.g. 7H)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentState]);

  // ── Sunset timer hold-counting ──────────────────────────────────────────
  // While in SUNSET_TIMER with the button held, add 5 min per second and blink.
  const [sunsetBlink, setSunsetBlink] = useState(false);
  const sunsetBlinkTimeoutRef = useRef(null);
  useEffect(() => {
    if (currentState !== "SUNSET_TIMER" || !isButtonPressed) return;
    const id = setInterval(() => {
      addSunsetMinutes(5, levelRef.current);
      setSunsetBlink(true);
      sunsetBlinkTimeoutRef.current = setTimeout(() => setSunsetBlink(false), 120);
    }, 1000);
    return () => {
      clearInterval(id);
      clearTimeout(sunsetBlinkTimeoutRef.current);
      setSunsetBlink(false);
    };
  }, [currentState, isButtonPressed, addSunsetMinutes]);

  // ── Aux color hold-cycling ───────────────────────────────────────────────
  // While in AUX_COLOR_CONFIG with the button still held, advance one color
  // every second (mirrors Anduril's hold-to-scroll behavior).
  useEffect(() => {
    if (currentState !== "AUX_COLOR_CONFIG" || !isButtonPressed) return;
    const id = setInterval(() => handleInput("7H"), 1000);
    return () => clearInterval(id);
  }, [currentState, isButtonPressed, handleInput]);

  // ── Button handler routing ───────────────────────────────────────────────
  // When a config menu is active, raw press/release events go to useConfigMenu.
  // Track button visual separately so the flashlight button still animates.
  const [configBtnPressed, setConfigBtnPressed] = useState(false);

  const configButtonHandlers = useMemo(() => ({
    onPointerDown: (e) => {
      e.preventDefault();
      setConfigBtnPressed(true);
      configPress();
    },
    onPointerUp: (e) => {
      e.preventDefault();
      setConfigBtnPressed(false);
      configRelease();
    },
    onPointerLeave: () => {
      setConfigBtnPressed(false);
      configRelease();
    },
  }), [configPress, configRelease]);

  const activeButtonHandlers = configActive ? configButtonHandlers : buttonHandlers;
  const activeIsButtonPressed = configActive ? configBtnPressed : isButtonPressed;

  // ── Brightness override priority ─────────────────────────────────────────
  // Config menu > readout > sunset blink > normal state brightness
  const overrideLevel =
    configActive      ? configLevel :
    readoutPlaying    ? readoutLevel :
    sunsetBlink       ? 0 :
    null;

  // ── Transitions for panel (exclude state-map-only entries) ─────────────
  const panelTransitions = availableTransitions.filter((t) => !t.stateMapOnly);

  // ── Config info passed down for status display ───────────────────────────
  const configInfo = configActive
    ? {
        phase:        configPhase,
        itemIndex:    configItemIndex,
        currentValue: configCurrentValue,
        node:         nodeMap[currentState],
      }
    : null;

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div className="app__brand">
          <h1 className="app__title">Anduril</h1>
          <span className="app__version">Interactive Guide</span>
        </div>
        <div className="app__controls">
          <div className="app__ui-toggle">
            <span className="app__toggle-label">UI Mode</span>
            <button
              className={`app__toggle-btn ${uiMode === "simple" ? "app__toggle-btn--active" : ""}`}
              onClick={() => setUiMode("simple")}
            >
              Simple
            </button>
            <button
              className={`app__toggle-btn ${uiMode === "full" ? "app__toggle-btn--active" : ""}`}
              onClick={() => setUiMode("full")}
            >
              Advanced
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="app__main">
        {/* Left column: Simulator + Transitions */}
        <div className="app__col app__col--left">
          <FlashlightSimulator
            stateInfo={stateInfo}
            brightness={brightness}
            level={level}
            lastAction={lastAction}
            buttonHandlers={activeButtonHandlers}
            isButtonPressed={activeIsButtonPressed}
            pendingInput={configActive ? null : pendingInput}
            auxDisplay={auxDisplay}
            readoutLevel={overrideLevel}
            configInfo={configInfo}
          />
          <TransitionPanel
            transitions={panelTransitions}
            onInput={handleInput}
            onRampStart={startRamp}
            onRampStop={stopRamp}
            currentState={currentState}
          />
        </div>

        {/* Right column: Reference Search + State Map + History */}
        <div className="app__col app__col--right">
          <ReferenceGuide />
          <StateMap
            currentState={currentState}
            uiMode={uiMode}
            onGoToState={goToState}
            onInput={handleInput}
            level={level}
            rampStyle={rampStyle}
            auxPatternIndex={auxPatternIndex}
            auxColorIndex={auxColorIndex}
            sunsetMinutes={sunsetMinutes}
          />

          {/* Input notation reference */}
          <div className="app__notation">
            <h3 className="app__notation-title">Button Notation</h3>
            <div className="app__notation-grid">
              <div className="app__notation-item">
                <span className="app__notation-code">1C</span>
                <span className="app__notation-desc">Single click</span>
              </div>
              <div className="app__notation-item">
                <span className="app__notation-code">2C</span>
                <span className="app__notation-desc">Double click</span>
              </div>
              <div className="app__notation-item">
                <span className="app__notation-code">3C</span>
                <span className="app__notation-desc">Triple click</span>
              </div>
              <div className="app__notation-item">
                <span className="app__notation-code">nC</span>
                <span className="app__notation-desc">n consecutive clicks</span>
              </div>
              <div className="app__notation-item">
                <span className="app__notation-code">1H</span>
                <span className="app__notation-desc">Press and hold</span>
              </div>
              <div className="app__notation-item">
                <span className="app__notation-code">2H</span>
                <span className="app__notation-desc">Click, then hold</span>
              </div>
              <div className="app__notation-item">
                <span className="app__notation-code">nH</span>
                <span className="app__notation-desc">(n-1) clicks, then hold</span>
              </div>
              <div className="app__notation-item">
                <span className="app__notation-code">15+C</span>
                <span className="app__notation-desc">15 or more clicks</span>
              </div>
            </div>
          </div>

          {/* Action history */}
          {history.length > 0 && (
            <div className="app__history">
              <h3 className="app__history-title">History</h3>
              <div className="app__history-list">
                {[...history].reverse().map((entry, i) => (
                  <div key={entry.timestamp + i} className="app__history-item">
                    <span className="app__history-input">{entry.input}</span>
                    <span className="app__history-action">{entry.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
