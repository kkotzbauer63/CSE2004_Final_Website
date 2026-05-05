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

The state machine logic lives in plain JavaScript modules. React components only handle rendering and user interaction.

```
src/
├── data/
│   ├── constants.js        # UI, NODE_TYPE, TRANSITION_KIND, CONDITION enums
│   ├── graph.js            # Assembles nodeMap; exports helpers and stateGroups
│   ├── nodes/
│   │   ├── off.js          # OFF node
│   │   ├── ramp.js         # RAMP node
│   │   ├── lockout.js      # LOCKOUT node
│   │   ├── blinkyGroup.js  # BLINKY_GROUP container + children
│   │   ├── strobeGroup.js  # STROBE_GROUP container + children
│   │   ├── tacticalMode.js # TACTICAL_MODE container + children
│   │   ├── momentaryMode.js
│   │   ├── configMenus.js  # All 9 config menu nodes
│   │   └── actions.js      # VERSION_CHECK, FACTORY_RESET
│   └── ref/                # Reference guide entry files (one per task)
├── utils/
│   └── filterGraph.js      # isVisible(), filterTransitions() pure helpers
├── stateMachine/
│   ├── states.js           # Re-export shim → data/graph.js
│   └── engine.js           # Pure functions: processInput, getAvailableTransitions
├── services/
│   └── githubService.js    # GitHub API calls
├── components/
│   ├── FlashlightSimulator.jsx
│   ├── StateMap.jsx        # Orchestrator — picks sub-view based on currentState
│   ├── TransitionPanel.jsx
│   ├── ReferenceGuide.jsx
│   └── statemap/           # StateMapSimple, Advanced, Blinky, Strobe, Ramp, Primitives
├── hooks/
│   └── useStateMachine.js  # Thin bridge between engine and React state
└── App.jsx
```

### Node structure

Every node has a consistent shape. State IDs are `UPPER_SNAKE_CASE`.

```javascript
// Example — src/data/nodes/off.js
export const OFF = {
  id: "OFF",
  name: "Off",
  ui: UI.ANY,
  type: NODE_TYPE.STATE,   // state | container | config_menu | action
  parent: null,
  group: "core",           // for state map color coding
  brightness: 0,           // simulator display (0–100)
  transitions: [
    // action = button notation ("1C"), description = human text
    { action: "1C", target: "RAMP",          ui: UI.ANY,  description: "On (memorized level)" },
    { action: "3H", target: "STROBE_GROUP",  ui: UI.FULL, description: "Strobe / mood modes" },
    { action: "4C", target: "LOCKOUT",       ui: UI.ANY,  description: "Lockout mode" },
    // ... etc
  ],
};
```

**Container nodes** (BLINKY_GROUP, STROBE_GROUP, TACTICAL_MODE) have `childIds`, `entryPoint`, and `sharedTransitions` (inherited by all children). The engine resolves a container to its concrete entry child on navigation. `STROBE_GROUP` uses `entryPoint: "last_used"` to re-enter the last-used strobe mode.

**Action nodes** (VERSION_CHECK, FACTORY_RESET) have `type: NODE_TYPE.ACTION` and `returnsTo: "OFF"`. `useStateMachine` auto-returns via a 600ms `useEffect` timeout.

### Engine (`src/stateMachine/engine.js`)

Pure functions — no React.

- `getAvailableTransitions(nodeId, uiMode)` — calls `getEffectiveTransitions` (merges parent `sharedTransitions` + node's own), then filters by `ui`.
- `processInput(nodeId, input, uiMode, lastUsedStrobeId)` — finds matching transition by `t.action`, resolves containers via `resolveContainerEntry`, returns `{ state, action, transition }`.
- `getStateInfo(nodeId)` — returns node metadata for display.

### Hook (`src/hooks/useStateMachine.js`)

Bridges the engine to React. Manages `currentState`, `uiMode`, `level`, `history`, `auxDisplay`, and `lastUsedStrobe` ref. Calls `processInput` on input, handles ramp timers, and applies simulator extensions from transitions (`rampEffect`, `brightnessHint`, `auxEffect`, `setsUiMode`).

React components call `handleInput("1C")` and render whatever comes back — they don't contain state machine logic.

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

## API integration — Ambient light level (sunrise-sunset.org)

The site uses the browser Geolocation API combined with the free **sunrise-sunset.org** REST API to show users where they currently are in the day/night cycle. This is directly relevant to Anduril use: different twilight phases map onto different flashlight needs.

### Step 1 — Get coordinates with Geolocation

```javascript
navigator.geolocation.getCurrentPosition(
  ({ coords: { latitude, longitude } }) => {
    const tzid = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetchSunTimes(latitude, longitude, tzid);
  },
  (error) => { /* fallback: show generic unavailable message */ }
);
```

### Step 2 — Fetch from sunrise-sunset.org

```
GET https://api.sunrise-sunset.org/json?lat=38.627&lng=-90.197&formatted=0&tzid=America/Chicago
```

- `formatted=0` returns ISO 8601 UTC timestamps (easy to parse with `new Date()`)
- `tzid` (from `Intl.DateTimeFormat().resolvedOptions().timeZone`) ensures the correct local day is used for the calculation
- No API key required; free tier is sufficient for this use case

**Response fields used:**

| Field | Meaning |
|---|---|
| `sunrise` / `sunset` | Sun crosses the horizon |
| `civil_twilight_end` | Sun 6° below horizon — aux LEDs become useful |
| `nautical_twilight_end` | Sun 12° below — main emitter useful at low-mid levels |
| `astronomical_twilight_end` | Sun 18° below — true darkness, full ramp range relevant |

### Step 3 — Light phase → Anduril relevance

| Phase | What it means for Anduril |
|---|---|
| Daylight | No flashlight needed |
| Civil twilight | Aux LEDs becoming visible; low modes sufficient |
| Nautical twilight | Main emitter useful at low–mid levels |
| Astronomical twilight | Full ramp range relevant; moonlight mode practical |
| Night | True darkness — deepest Anduril features shine |

### Implementation

- `src/services/sunTimeService.js` — the `fetch()` call
- `src/hooks/useSunTimes.js` — geolocation + API call; exports `useSunTimes()` and `getCurrentPhase(phases, now)`
- `src/components/SunTimeBar.jsx` — header bar component; desktop shows full timeline, mobile shows compact phase label

### Implementation approach (recommended order)

1. **First**: Manually define the state machine data. Get the simulator working with hardcoded data.
2. **Second**: Add the sunrise-sunset.org API integration to show the ambient light level bar. This satisfies the API requirement immediately and adds genuine user value.

This order ensures a working project at each step, and the API integration is load-bearing from day one rather than a cosmetic add-on.

---

## Technical details

### Stack

- **Framework**: React (functional components with hooks)
- **Styling**: CSS (or Tailwind if preferred by the class)
- **State visualization**: SVG or a library like D3.js for the interactive state map
- **No backend required**: All logic runs client-side; external APIs are called directly from the browser
- **External API**: sunrise-sunset.org (free, no key required) for ambient light level data
- **State machine data**: Hardcoded from the ToyKeeper/anduril manual (GPL v3)

### React patterns to use

- **`useState`** for tracking current state, UI mode, brightness level, aux settings
- **`useEffect`** for API calls on mount (geolocation + sun times)
- **`useRef`** for button press timing (needs to persist between renders without causing re-renders)
- **Custom hooks** (like `useStateMachine` above) to encapsulate state machine logic cleanly
- **Props** to pass state down to child components (FlashlightVisual, TransitionPanel, StateMap)

### What NOT to do

- Don't use React class components — the entire ecosystem has moved to functions + hooks
- Don't put the state machine logic inside React components — keep it in plain JS modules
- Don't try to dynamically build the state machine from fetched data — the hardcoded node definitions are the source of truth
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