import { useStateMachine } from "./hooks/useStateMachine.js";
import { useButtonInput } from "./hooks/useButtonInput.js";
import FlashlightSimulator from "./components/FlashlightSimulator.jsx";
import TransitionPanel from "./components/TransitionPanel.jsx";
import StateMap from "./components/StateMap.jsx";
import ReferenceGuide from "./components/ReferenceGuide.jsx";
import "./App.css";

export default function App() {
  const {
    currentState,
    stateInfo,
    uiMode,
    setUiMode,
    lastAction,
    brightness,
    level,
    availableTransitions,
    handleInput,
    startRamp,
    stopRamp,
    goToState,
    history,
    auxDisplay,
  } = useStateMachine("off");

  const { buttonHandlers, isButtonPressed, pendingInput } = useButtonInput({
    handleInput,
    startRamp,
    stopRamp,
  });

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
            buttonHandlers={buttonHandlers}
            isButtonPressed={isButtonPressed}
            pendingInput={pendingInput}
            auxDisplay={auxDisplay}
          />
          <TransitionPanel
            transitions={availableTransitions}
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
            level={level}
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
