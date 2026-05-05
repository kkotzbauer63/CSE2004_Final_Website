# AGENT.md - Codex Guide for the Anduril Interactive Guide

## Project Overview

This project is an interactive React/Vite learning tool for Anduril 2, the flashlight firmware by ToyKeeper. It helps users explore Anduril's single-button interface without needing a physical flashlight.

The app has three main learning surfaces:

- Flashlight simulator: shows the current state, brightness, beam, aux LED/button indicator, config blinks, and readout flashes.
- Interactive state map: visualizes the user's current position in the Anduril state machine and lets users trigger transitions.
- Reference guide: searchable "How do I..." entries for common Anduril tasks.

The target user may be new to Anduril, so UI changes should make complex behavior easier to understand, not merely more complete.

## Local Commands

- `npm run dev` - start the Vite development server.
- `npm run build` - production build; use this as the primary verification check for most changes.
- `npm run lint` - run ESLint. If it reports broad pre-existing React hook or unused-variable issues, do not fix unrelated files unless the task asks for it.
- `npm run preview` - serve the production build locally.
- `npm run deploy` - publish `dist` with `gh-pages`.

## Architecture

State machine logic is intentionally separate from rendering. Prefer preserving this boundary.

```text
src/
  App.jsx                         App composition and cross-hook wiring
  components/
    FlashlightSimulator.jsx       Flashlight visual, beam, aux indicator, status panel
    StateMap.jsx                  Chooses the active state-map subview
    TransitionPanel.jsx           Clickable list of available actions
    ReferenceGuide.jsx            Searchable task reference
    statemap/                     State-map SVG/view components
  data/
    constants.js                  Shared enums
    graph.js                      Assembles nodeMap and state groups
    flashlightConfig.js           Ramp config, defaults, turbo style, step calculations
    nodes/                        State/container/config/action node definitions
    ref/                          Reference guide entries
  hooks/
    useStateMachine.js            React facade over the state machine engine
    useButtonInput.js             Physical button press/click/hold parser
    useConfigMenu.js              Config menu blink and value-entry behavior
    useReadout.js                 Battery/temp/version flash playback
    useSunTimes.js                Geolocation and sun phase hook
  services/
    sunTimeService.js             sunrise-sunset.org API call
  stateMachine/
    engine.js                     Pure transition processing helpers
  utils/
    configMenuEngine.js           Pure config-menu session logic
    filterGraph.js                Visibility/filter helpers
    readoutEncoder.js             Encodes values into flash sequences
```

## State Machine Conventions

- Node IDs are `UPPER_SNAKE_CASE`.
- Node definitions live in `src/data/nodes/`.
- `src/data/graph.js` assembles the source-of-truth `nodeMap`.
- `src/stateMachine/engine.js` should stay pure: no React state, DOM access, timers, or rendering.
- React components should call hook APIs such as `handleInput("1C")`; they should not duplicate transition logic.
- If a transition needs simulator-side effects, add explicit data to the transition object, such as `brightnessHint`, `rampEffect`, `auxEffect`, `toggleEffect`, `memoryEffect`, or `setsUiMode`.

Common node fields:

```js
{
  id: "RAMP",
  name: "Ramp",
  ui: UI.ANY,
  type: NODE_TYPE.STATE,
  parent: null,
  group: "core",
  brightness: 50,
  transitions: [
    { action: "1C", target: "OFF", ui: UI.ANY, kind: TRANSITION_KIND.NAVIGATE, description: "Off" },
  ],
}
```

Container nodes may define `childIds`, `entryPoint`, and `sharedTransitions`. Action nodes may define `returnsTo`.

## Simulator Notes

- Anduril brightness levels are represented as levels `1-150`; level `0` means off.
- Visual brightness percentages are derived in `useStateMachine.js` with `levelToPercent()`.
- Keep level math centralized. Avoid adding a second brightness conversion inside visual components.
- Aux LEDs are represented through `auxDisplay`; only off-like states and lockout currently show aux status.
- Config menus and readouts temporarily override normal beam brightness through `readoutLevel` / `configLevel`.
- The flashlight button is both an input target and the aux/button LED indicator, so color and pressed-state changes should remain readable.

## UI And Design Guidance

- This is a learning tool, not a marketing landing page. The first screen should stay useful and interactive.
- Favor clear, scannable controls over decorative UI.
- Keep the simulator, state map, and reference guide synchronized when behavior changes.
- Use existing CSS structure and naming patterns before adding new abstractions.
- Avoid large unrelated redesigns while fixing simulator/state-machine behavior.
- Test responsive behavior when changing layout, SVG sizing, or status text.

## External API

The ambient light bar uses the browser Geolocation API and `sunrise-sunset.org`.

- Service: `src/services/sunTimeService.js`
- Hook: `src/hooks/useSunTimes.js`
- Component: `src/components/SunTimeBar.jsx`

The API is client-side and does not require a key. Keep graceful fallback behavior for users who deny location access or lack geolocation support.

## Working Rules For Codex

- Read the relevant node, hook, and component files before changing behavior.
- Preserve user changes in the worktree. Do not revert unrelated edits.
- Keep state-machine changes data-driven where possible.
- Prefer small focused patches over broad rewrites.
- Run `npm run build` after code changes. Run focused lint checks for edited files when full lint is noisy.
- If full lint fails because of unrelated existing issues, report that clearly instead of silently fixing the world.
- Do not add network dependencies or new libraries unless the task clearly needs them.
- Use browser smoke tests for visual changes when local server/browser access is available.

## Feature Ideas Already Reflected In The Codebase

- Simple UI and Advanced UI mode filtering.
- Smooth and stepped ramp behavior.
- Aux LED pattern/color configuration.
- Battery, temperature, and version readouts.
- Config-menu blink/value-entry simulation.
- Sunset timer behavior.
- State-map-only transitions for some less common routes.

