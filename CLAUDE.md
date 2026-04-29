# CLAUDE.md — Anduril Interactive Guide

## Project overview

An interactive, web-based learning tool for **Anduril 2**, the open-source flashlight firmware developed by ToyKeeper. The site replaces dense text manuals and overwhelming flowchart diagrams with an interactive simulator, a dynamic state map, and a task-based reference guide.

Anduril controls an entire flashlight through a single button using sequences of clicks and holds (e.g., `1C` = one click, `3H` = click-click-hold). The firmware has dozens of states and hundreds of transitions. Existing resources — the 45KB+ text manual and community-made flowcharts — are thorough but inaccessible to newcomers. This project makes the UI explorable without requiring a physical flashlight.

### Target audience

- New Anduril flashlight owners overwhelmed by the manual and diagrams
- Experienced users who need a quick reference for less-used features (config menus, multi-channel cycling, etc.)
- Curious enthusiasts exploring Anduril's capabilities before purchasing

### Project requirements

- **Elaborate**: Multi-section site with simulator, state map, reference guide, and tutorials
- **Original**: No existing interactive Anduril learning tool exists
- **Interactive**: Users click/hold a virtual button and explore state transitions in real time
- **API integration (required)**: GitHub API to fetch manual content, release info, and changelogs from the ToyKeeper/anduril repository

---

## Core components

### 1. Flashlight simulator

A visual representation of a flashlight with a clickable/tappable button. Users perform real input sequences and the simulator responds:

- Beam visual changes brightness (off → moon → ramp → ceiling → turbo)
- Aux LEDs update to reflect current aux mode and color (RGB dots on the flashlight head)
- Status display shows current state name, brightness level, and what just happened
- Feedback blinks for battery check, version check, and config menus are animated
- The button must handle: single click, double click, triple click (up to 15+), hold, and click-then-hold (e.g., 2H = click, then click-and-hold)

### 2. Interactive state map

A dynamic visualization of the user's current position in the Anduril state machine:

- States displayed as nodes: Off, Ramp (Smooth/Stepped), Lockout, Strobe Modes, Blinky/Utility, Config Menus
- Available transitions from the current state are visually emphasized; unavailable paths are dimmed
- Clicking a transition on the map performs the action in the simulator (bidirectional sync)
- Simple UI vs Advanced UI toggle changes which states and transitions are visible/available

### 3. Structured reference guide

A searchable, categorized reference organized by task:

- "How do I…" entries: "How do I check my battery?", "How do I lock my light?", "How do I change aux LED colors?"
- Each entry shows the required button sequence, which UI mode it requires (Simple vs Advanced), and links to the simulator pre-loaded at the relevant starting state
- Notation primer explaining `1C`, `2H`, `3C`, etc. for first-time Anduril users

### 4. Guided tutorials

Step-by-step interactive walkthroughs for common tasks:

1. First time setup (factory reset, temperature calibration, basic controls)
2. Everyday use (on/off, ramping, ceiling, floor, memory modes)
3. Locking and safety (lockout mode, momentary activation, unlocking)
4. Customizing your ramp (floor, ceiling, steps, smooth vs stepped, turbo style)
5. Aux LEDs and channel modes (aux patterns, colors, multi-channel switching)

---

## Architecture

### Key principle: separate logic from rendering

The state machine logic lives in plain JavaScript modules. React components only handle rendering and user interaction. This keeps the codebase modular, testable, and understandable.

```
src/
├── stateMachine/
│   ├── states.js          # State definitions and transition data
│   ├── engine.js          # State machine engine (pure functions)
│   └── parser.js          # Parses GitHub manual table into state data
├── services/
│   └── githubService.js   # GitHub API calls (plain JS, no React)
├── components/
│   ├── FlashlightSimulator.jsx
│   ├── StateMap.jsx
│   ├── TransitionPanel.jsx
│   ├── ReferenceGuide.jsx
│   ├── VersionSelector.jsx
│   └── TutorialWalkthrough.jsx
├── hooks/
│   └── useStateMachine.js  # Custom hook connecting engine to React state
└── App.jsx
```

### State machine (plain JavaScript — no React)

The state machine is the heart of the project. It should be implemented as a data structure and pure functions, not as React components.

**State definition structure:**

```javascript
// states.js — this is just data, no React
const states = {
  off: {
    name: "Off",
    transitions: [
      { input: "1C", target: "ramp", action: "Turn on (memorized level)", ui: "any" },
      { input: "1H", target: "ramp", action: "Turn on at floor (moon)", ui: "any" },
      { input: "2C", target: "ramp", action: "Turn on at ceiling", ui: "any" },
      { input: "2H", target: "ramp", action: "Momentary turbo", ui: "full" },
      { input: "2H", target: "ramp", action: "Momentary ceiling", ui: "simple" },
      { input: "3C", target: "battcheck", action: "Battery check", ui: "any" },
      { input: "3H", target: "strobe", action: "Strobe mode (last used)", ui: "full" },
      { input: "4C", target: "lockout", action: "Lockout mode", ui: "any" },
      { input: "5C", target: "momentary", action: "Momentary mode", ui: "full" },
      { input: "6C", target: "tactical", action: "Tactical mode", ui: "full" },
      { input: "7C", target: "off", action: "Aux LEDs: next pattern", ui: "full" },
      { input: "7H", target: "off", action: "Aux LEDs: next color", ui: "full" },
      { input: "10C", target: "off", action: "Enable Simple UI", ui: "full" },
      { input: "10H", target: "off", action: "Disable Simple UI", ui: "simple" },
      { input: "13H", target: "off", action: "Factory reset", ui: "any" },
      { input: "15+C", target: "off", action: "Version check", ui: "any" },
    ]
  },
  ramp: {
    name: "Ramp",
    // ... transitions from ramp state
  },
  lockout: {
    name: "Lockout",
    // ... transitions from lockout state
  },
  // ... etc
};
```

**State machine engine:**

```javascript
// engine.js — pure functions, no React
export function getAvailableTransitions(state, uiMode) {
  const stateData = states[state];
  if (!stateData) return [];

  return stateData.transitions.filter(t =>
    t.ui === "any" || t.ui === uiMode
  );
}

export function processInput(currentState, input, uiMode) {
  const transitions = getAvailableTransitions(currentState, uiMode);
  const match = transitions.find(t => t.input === input);
  if (!match) return { state: currentState, action: null };

  return {
    state: match.target,
    action: match.action
  };
}
```

**Connecting to React via a custom hook:**

```javascript
// useStateMachine.js — thin bridge between engine and React
import { useState } from "react";
import { processInput, getAvailableTransitions } from "../stateMachine/engine";

export function useStateMachine(initialState = "off") {
  const [currentState, setCurrentState] = useState(initialState);
  const [uiMode, setUiMode] = useState("simple"); // "simple" or "full"
  const [lastAction, setLastAction] = useState(null);

  function handleInput(input) {
    const result = processInput(currentState, input, uiMode);
    if (result.action) {
      setCurrentState(result.state);
      setLastAction(result.action);
    }
  }

  const availableTransitions = getAvailableTransitions(currentState, uiMode);

  return { currentState, uiMode, setUiMode, lastAction, availableTransitions, handleInput };
}
```

This separation means:
- `states.js` and `engine.js` can be tested without React, without a browser, without any UI
- The React components are thin — they call `handleInput("1C")` and render whatever comes back
- If you later want to populate states from the GitHub API, you only change `states.js` or add a loader — the components don't need to know

### Button input handling

Anduril's input notation is based on sequences of clicks and holds within timing windows. The button handler needs to:

1. Track individual press/release events
2. Distinguish click (short press + release) from hold (press without release for ~500ms)
3. Count consecutive clicks within a timing window (~300ms between clicks)
4. Detect click-then-hold (e.g., 2H = click, release, click-and-hold)
5. After the timing window expires with no new input, resolve the sequence to a notation like "3C" or "2H"

This is a non-trivial piece of logic, but it is also pure JavaScript — no React rendering involved. It should live in its own module (e.g., `buttonHandler.js`) and emit resolved input strings like `"1C"`, `"3H"`, etc. to the state machine.

A simpler MVP approach: skip real-time button detection initially and instead show the available transitions as clickable items in the transition panel. Users click "1C — Turn on" directly. Add the physical button simulation later as a stretch goal.

---

## GitHub API integration

### What to fetch

The GitHub REST API (no authentication required for public repos, 60 requests/hour rate limit) provides:

1. **Raw manual content**: `GET https://api.github.com/repos/ToyKeeper/anduril/contents/docs/anduril-manual.md?ref={tag}`
   - Returns base64-encoded file content
   - Use the `ref` parameter to fetch specific release versions (e.g., `ref=r2025-07-07`)
   - The response includes the raw markdown which contains the UI Reference Table

2. **Releases list**: `GET https://api.github.com/repos/ToyKeeper/anduril/releases`
   - Returns all tagged releases with names, dates, and changelog bodies
   - Known release tags: `r2023-12-03`, `r2024-04-01`, `r2024-04-20`, `r2025-07-07`

3. **Changelog**: `GET https://api.github.com/repos/ToyKeeper/anduril/contents/ChangeLog.md`

### UI Reference Table parsing

The table at the end of `anduril-manual.md` is a fixed-width plain text table with four columns:

```
Mode        UI       Button    Action
----        --       ------    ------
Off         Any      1C        On (ramp mode, memorized level)
Off         Any      1H        On (ramp mode, floor level)
Off         Full     3H        Strobe mode (whichever was used last)
Ramp        Any      1C        Off
Lockout     Any      1H        Momentary moon (floor level)
```

The table heading is `## UI Reference Table` in the markdown version. To parse it:

1. Find the section by searching for "UI Reference Table" in the markdown
2. Skip the header row and separator row
3. Split each subsequent line by whitespace (columns are whitespace-delimited)
4. Extract: Mode, UI (Any/Simple/Full), Button (e.g., 1C, 3H), Action (remainder of line)
5. Group by Mode to produce the state machine data structure

**Important caveats:**
- The table has existed in the manual since at least the GitHub migration (late 2023), but may not exist in every historical version
- Some actions span multiple lines or include sub-items (e.g., config menu options listed as `?1:`, `?2:`)
- The Action column may contain parenthetical notes
- Always validate parsed data against expected states before using it to populate the simulator

### Version selector feature

Let users pick a firmware version from a dropdown populated by the GitHub Releases API. When they select a version:

- Fetch the manual at that release tag
- Parse the UI Reference Table
- Display the release notes/changelog for that version
- Show what changed from the previous version (added/removed transitions)

This is valuable because most users do not have flashing kits and are running whatever firmware shipped with their light, which could be from any of the past few releases.

### Implementation approach (recommended order)

1. **First**: Manually define the state machine data from the current (trunk) UI Reference Table. Get the simulator working with hardcoded data.
2. **Second**: Add the GitHub API integration to fetch and display release info (version number, date, changelog). This satisfies the API requirement immediately.
3. **Third**: Build the markdown parser to extract the UI Reference Table from fetched manual content.
4. **Fourth** (stretch goal): Use the parsed table to dynamically populate or validate the state machine, with the manual data as fallback.

This order ensures you always have a working project at each step, and the API integration adds genuine value rather than being a fragile dependency.

---

## Technical details

### Stack

- **Framework**: React (functional components with hooks)
- **Styling**: CSS (or Tailwind if preferred by the class)
- **State visualization**: SVG or a library like D3.js for the interactive state map
- **No backend required**: All logic runs client-side; GitHub API is called directly from the browser
- **Data source**: ToyKeeper/anduril repository on GitHub (GPL v3)

### React patterns to use

- **`useState`** for tracking current state, UI mode, brightness level, aux settings
- **`useEffect`** for GitHub API calls on mount or when the selected version changes
- **`useRef`** for button press timing (needs to persist between renders without causing re-renders)
- **Custom hooks** (like `useStateMachine` above) to encapsulate state machine logic cleanly
- **Props** to pass state down to child components (FlashlightVisual, TransitionPanel, StateMap)

### What NOT to do

- Don't use React class components — the entire ecosystem has moved to functions + hooks
- Don't put the state machine logic inside React components — keep it in plain JS modules
- Don't try to dynamically build the state machine from the GitHub API as the first step — get it working with hardcoded data first
- Don't implement real-time button press detection before the basic simulator works — start with clickable transition items, add physical button simulation later

### OOP and design patterns

Even though React is function-based, several OOP design patterns from your coursework apply directly:

- **State pattern**: The entire project is a state machine. Each Anduril mode (Off, Ramp, Lockout, etc.) is a state with defined transitions. This maps 1:1.
- **Observer pattern**: React's re-rendering model is essentially observer/subscriber — when state changes, all subscribed components update. You get this for free with `useState`.
- **Strategy pattern**: The Simple UI vs Advanced UI toggle changes which transitions are available without changing the underlying structure — this is swapping a filtering strategy.
- **Facade pattern**: Your custom `useStateMachine` hook is a facade over the raw state machine engine, exposing a simple interface to components.

You can implement these patterns using plain functions and objects in JavaScript rather than classes — the concepts transfer even if the syntax doesn't look like Java.

---

## Design direction

- **Avoid:** Inter, Roboto, gradients of any kind, rounded corners greater than 4px, glowing hover states.
- **Typography:** Use a clean, rigid sans-serif like 'Helvetica Neue' or 'Geist' for headers. You MUST use a monospace font (like 'JetBrains Mono' or 'Fira Code') for all numerical data, API readouts, and table alignments.
- **Colors:** Use a strict matte industrial palette. Backgrounds should be deep charcoal (`#1C1C1E` to `#2C2C2E`). Text should be silver/light grey. 
- **Accents:** Use only single, flat, high-visibility colors for states (e.g., a flat amber or muted teal).
- **Layout:** Rely on sharp inner borders (`1px solid #333`), dense information hierarchy, and minimal whitespace. UI elements should look machined, not soft.
- **Dark theme by default** — appropriate for a flashlight tool, comfortable for users likely in low-light environments
- **Mobile-responsive** — users often reference guides on their phone while holding a flashlight in the other hand
- **Minimal and functional** — the existing flowcharts fail because they're visually overwhelming. This tool should feel calm and navigable.
- The flashlight visual should be simple and iconic, not photorealistic
- Aux LED colors should be visually accurate (red, green, blue, amber, cyan, purple, white)
- Beam visualization should suggest brightness changes without trying to simulate real optics

---

## Authoritative references

- **Anduril 2 manual (primary source)**: https://github.com/ToyKeeper/anduril/blob/trunk/docs/anduril-manual.md
- **Anduril source code**: https://github.com/ToyKeeper/anduril
- **containerfan's UI diagrams**: https://github.com/containerfan/anduril2-diagrams
- **Ivan's formatted manual**: https://ivanthinking.net/manuals/anduril2-manual/
- **Lux-Perpetua's BLF diagrams**: https://budgetlightforum.com/t/anduril-2-ui-diagrams-generic-lumintop-sofirn/65927
- **Anduril button notation**: `nC` = n clicks, `nH` = n-1 clicks then hold the last press
- **UI modes**: "Simple" = limited safe mode (default after factory reset), "Full"/"Advanced" = all features unlocked
- **Anduril 2 release tags on GitHub**: r2023-12-03, r2024-04-01, r2024-04-20, r2025-07-07