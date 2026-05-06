import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { useStateMachine } from "./hooks/useStateMachine.js";
import { useButtonInput } from "./hooks/useButtonInput.js";
import { useReadout } from "./hooks/useReadout.js";
import { useConfigMenu } from "./hooks/useConfigMenu.js";
import { useStrobePlayback } from "./hooks/useStrobePlayback.js";
import {
  encodeVoltage,
  encodeTemperature,
  encodeVersion,
} from "./utils/readoutEncoder.js";
import { nodeMap } from "./data/graph.js";
import { NODE_TYPE } from "./data/constants.js";
import {
  RAMP_CONFIG_SCHEMA,
  RAMP_EXTRAS_SCHEMA,
  SIMPLE_UI_CONFIG_SCHEMA,
} from "./data/flashlightConfig.js";
import FlashlightSimulator from "./components/FlashlightSimulator.jsx";
import TransitionPanel from "./components/TransitionPanel.jsx";
import StateMap from "./components/StateMap.jsx";
import ReferenceGuide from "./components/ReferenceGuide.jsx";
import SunTimeBar from "./components/SunTimeBar.jsx";
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

const AUX_PATTERN_CONFIG_STATES = new Set(["AUX_PATTERN_CONFIG", "LOCKOUT_AUX_PATTERN_CONFIG"]);
const AUX_COLOR_CONFIG_STATES   = new Set(["AUX_COLOR_CONFIG", "LOCKOUT_AUX_COLOR_CONFIG"]);

function auxConfigReturnState(state) {
  return state.startsWith("LOCKOUT_") ? "LOCKOUT" : "OFF";
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
    stopMomentary,
    goToState,
    history,
    auxDisplay,
    auxPatternIndex,
    auxColorIndex,
    lockoutAuxPatternIndex,
    lockoutAuxColorIndex,
    advancedConfig,
    simpleConfig,
    updateAdvancedConfig,
    updateSimpleConfig,
    tacticalSlots,
    updateTacticalSlot,
    activeTacticalStrobeId,
    sunsetSeconds,
    addSunsetMinutes,
    sunsetSpeedMultiplier,
    toggleSunsetSpeed,
  } = useStateMachine("OFF");

  // Active ramp config for state map display
  const activeRampConfig = uiMode === "full" ? advancedConfig : simpleConfig;
  const [stateMapPreview, setStateMapPreview] = useState(null);
  const stateMapPreviewState = stateMapPreview?.baseState === currentState ? stateMapPreview.state : null;
  const stateMapState = stateMapPreviewState ?? currentState;

  const handleStateMapGoToState = useCallback((nodeId) => {
    if (nodeMap[nodeId]?.type === NODE_TYPE.CONFIG_MENU) {
      setStateMapPreview({ state: nodeId, baseState: currentState });
      return;
    }

    setStateMapPreview(null);
    goToState(nodeId);
  }, [currentState, goToState]);

  const handleStateMapInput = useCallback((input) => {
    setStateMapPreview(null);
    return handleInput(input);
  }, [handleInput]);

  const handleStartConfigFromMap = useCallback((nodeId) => {
    setStateMapPreview(null);
    goToState(nodeId);
  }, [goToState]);

  // ── Normal button input (used when NOT in a config menu) ────────────────
  const { buttonHandlers, isButtonPressed, pendingInput, cancelInput } = useButtonInput({
    handleInput,
    startRamp,
    stopRamp,
    stopMomentary,
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

  // Track level in a ref to read current value inside sunset interval without stale closure
  const levelRef = useRef(level);

  // Capture which menu was entered and the ramp style at entry time
  // so the completion callback can apply results to the right config.
  const menuEntryRef = useRef({ menuState: null, rampStyle: "smooth" });
  const auxMenuEnteredByButtonRef = useRef(false);

  useEffect(() => {
    isButtonPressedRef.current = isButtonPressed;
  }, [isButtonPressed]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  // Start the config menu whenever we enter a CONFIG_MENU state
  useEffect(() => {
    const node = nodeMap[currentState];
    if (node?.type !== NODE_TYPE.CONFIG_MENU) return;

    cancelInput();

    menuEntryRef.current = { menuState: currentState, rampStyle };

    const itemCount = getItemCount(node);
    const returnsTo = node.returnsTo ?? "OFF";

    startConfigMenu(
      itemCount,
      (results) => {
        const { menuState, rampStyle: entryRampStyle } = menuEntryRef.current;

        // Apply menu results to the appropriate config store
        const applyResults = (schema, update) => {
          const updates = {};
          for (const result of results) {
            if (result.skipped) continue;
            const entry = Array.isArray(schema)
              ? schema[result.itemIndex]
              : (schema[entryRampStyle] ?? schema.smooth)?.[result.itemIndex];
            if (entry) {
              const value = entry.compute(result.value);
              if (value !== undefined) updates[entry.key] = value;
            }
          }
          if (Object.keys(updates).length > 0) update(updates);
        };

        if (menuState === "RAMP_CONFIG") {
          const schema = RAMP_CONFIG_SCHEMA[entryRampStyle] ?? RAMP_CONFIG_SCHEMA.smooth;
          const updates = {};
          for (const result of results) {
            if (result.skipped) continue;
            const entry = schema[result.itemIndex];
            if (entry) {
              const value = entry.compute(result.value);
              if (value !== undefined) updates[entry.key] = value;
            }
          }
          if (Object.keys(updates).length > 0) updateAdvancedConfig(updates);

        } else if (menuState === "RAMP_EXTRAS_CONFIG") {
          applyResults(RAMP_EXTRAS_SCHEMA, updateAdvancedConfig);

        } else if (menuState === "SIMPLE_UI_CONFIG") {
          applyResults(SIMPLE_UI_CONFIG_SCHEMA, updateSimpleConfig);

        } else if (menuState === "TACTICAL_CONFIG") {
          for (const result of results) {
            if (result.skipped) continue;
            updateTacticalSlot(result.itemIndex, result.value);
          }
        }

        goToState(returnsTo);
      },
      isButtonPressedRef.current,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentState]);

  // ── Sunset timer hold-counting ──────────────────────────────────────────
  // Immediate first blink+add when entering SUNSET_TIMER while button is held.
  const [sunsetBlink, setSunsetBlink] = useState(false);
  const sunsetBlinkTimeoutRef = useRef(null);

  const doSunsetBlink = useCallback(() => {
    addSunsetMinutes(5, levelRef.current);
    setSunsetBlink(true);
    sunsetBlinkTimeoutRef.current = setTimeout(() => setSunsetBlink(false), 120);
  }, [addSunsetMinutes]);

  // Fire immediately on entry (isButtonPressedRef used to avoid re-running on press changes)
  useEffect(() => {
    if (currentState !== "SUNSET_TIMER" || !isButtonPressedRef.current) return;
    doSunsetBlink();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentState]);

  // Then continue adding 5 min per second while still held
  useEffect(() => {
    if (currentState !== "SUNSET_TIMER" || !isButtonPressed) return;
    const id = setInterval(doSunsetBlink, 1000);
    return () => {
      clearInterval(id);
      clearTimeout(sunsetBlinkTimeoutRef.current);
      setSunsetBlink(false);
    };
  }, [currentState, isButtonPressed, doSunsetBlink]);

  // Track whether aux menus were reached by a real flashlight input or by
  // clicking the state map. Button-entered menus have short-lived behavior.
  useEffect(() => {
    const inAuxMenu = AUX_PATTERN_CONFIG_STATES.has(currentState) || AUX_COLOR_CONFIG_STATES.has(currentState);
    if (!inAuxMenu) {
      auxMenuEnteredByButtonRef.current = false;
      return;
    }

    const lastEntry = history[history.length - 1];
    if (lastEntry?.to === currentState && lastEntry.from !== currentState) {
      auxMenuEnteredByButtonRef.current = lastEntry.input !== "jump";
    }
  }, [currentState, history]);

  // ── Aux color hold-cycling ───────────────────────────────────────────────
  // While in an aux color menu with the button still held, advance one color
  // every second. If the button opened the menu, release returns to the parent.
  useEffect(() => {
    if (!AUX_COLOR_CONFIG_STATES.has(currentState) || !isButtonPressed) return;
    const id = setInterval(() => handleInput("7H"), 1000);
    return () => clearInterval(id);
  }, [currentState, isButtonPressed, handleInput]);

  useEffect(() => {
    if (!AUX_COLOR_CONFIG_STATES.has(currentState)) return;
    if (!auxMenuEnteredByButtonRef.current || isButtonPressed) return;

    const returnState = auxConfigReturnState(currentState);
    auxMenuEnteredByButtonRef.current = false;
    goToState(returnState);
  }, [currentState, isButtonPressed, goToState]);

  // Button-entered aux pattern config is displayed briefly, then returns.
  useEffect(() => {
    if (!AUX_PATTERN_CONFIG_STATES.has(currentState) || !auxMenuEnteredByButtonRef.current) return;

    const returnState = auxConfigReturnState(currentState);
    const id = setTimeout(() => {
      auxMenuEnteredByButtonRef.current = false;
      goToState(returnState);
    }, 2000);

    return () => clearTimeout(id);
  }, [currentState, goToState]);

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
  const strobePlayback = useStrobePlayback(activeTacticalStrobeId ?? currentState, level);

  // ── Brightness override priority ─────────────────────────────────────────
  // Config menu > readout > sunset blink > strobe animation > normal state brightness
  const overrideLevel =
    configActive      ? configLevel :
    readoutPlaying    ? readoutLevel :
    sunsetBlink       ? 0 :
    strobePlayback.level !== null ? strobePlayback.level :
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
        <SunTimeBar />
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
            auxDisplay={strobePlayback.auxDisplay ?? auxDisplay}
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
            currentState={stateMapState}
            uiMode={uiMode}
            onGoToState={handleStateMapGoToState}
            onInput={handleStateMapInput}
            level={level}
            rampStyle={rampStyle}
            rampConfig={activeRampConfig}
            auxPatternIndex={auxPatternIndex}
            auxColorIndex={auxColorIndex}
            lockoutAuxPatternIndex={lockoutAuxPatternIndex}
            lockoutAuxColorIndex={lockoutAuxColorIndex}
            tacticalSlots={tacticalSlots}
            previewState={stateMapPreviewState}
            onStartConfig={handleStartConfigFromMap}
            sunsetSeconds={sunsetSeconds}
            sunsetSpeedMultiplier={sunsetSpeedMultiplier}
            toggleSunsetSpeed={toggleSunsetSpeed}
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
