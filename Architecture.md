
## File Structure

```
src/
├── data/
│   ├── constants.js          # Enums: UI modes, node types, transition kinds, conditions
│   ├── nodes/
│   │   ├── off.js
│   │   ├── ramp.js
│   │   ├── lockout.js
│   │   ├── blinkyGroup.js    # Container + its children (battCheck, tempCheck, beacon, sos)
│   │   ├── strobeGroup.js    # Container + its children (candle, bikeFlasher, etc.)
│   │   ├── tacticalMode.js   # Container + its slots
│   │   ├── momentaryMode.js
│   │   ├── configMenus.js    # All config_menu nodes in one file
│   │   └── actions.js        # VERSION_CHECK, FACTORY_RESET
│   ├── graph.js              # Assembles all nodes into the full graph + lookup helpers
│   └── auxLeds.js            # Aux LED patterns/colors reference data
│
├── hooks/
│   ├── useUIMode.js          # Tracks SIMPLE vs FULL toggle
│   ├── useConditions.js      # Tracks active hardware conditions
│   └── useNodeNavigation.js  # Current node, navigation history, breadcrumbs
│
├── components/
│   ├── NodeView/             # Renders a single node's detail panel
│   ├── TransitionList/       # Renders filtered transitions for current node
│   ├── ContainerView/        # Renders a container's children as tabs/cards
│   ├── ConfigMenuView/       # Renders config menu items
│   ├── GraphOverview/        # Full state diagram / map view
│   ├── UIToggle/             # SIMPLE / FULL switch
│   └── ConditionToggles/     # Hardware condition checkboxes
│
└── utils/
    └── filterGraph.js        # Pure functions: filter nodes/transitions by UI + conditions
```

## The Data Layer (plain JS)

### `constants.js` — your enums

```js
export const UI = Object.freeze({
  SIMPLE: "SIMPLE",
  FULL:   "FULL",
  ANY:    "ANY",
});

export const NODE_TYPE = Object.freeze({
  STATE:       "state",
  CONTAINER:   "container",
  CONFIG_MENU: "config_menu",
  ACTION:      "action",
});

export const TRANSITION_KIND = Object.freeze({
  NAVIGATE:  "navigate",
  INTERNAL:  "internal",
  MOMENTARY: "momentary",
  CONFIG:    "config",
});

export const CONDITION = Object.freeze({
  SINGLE_CHANNEL:  "single_channel",
  MULTI_CHANNEL:   "multi_channel",
  HAS_TINT:        "has_tint",
  NO_TINT:         "no_tint",
  SOME_LIGHTS:     "some_lights",
  EXTENDED_SIMPLE: "extended_simple",
  HAS_TEMP_SENSOR: "has_temp_sensor",
  HAS_RGB_AUX:     "has_rgb_aux",
});
```

### Per-node files — shape of a node object

Every node file exports one or more node objects that look like this:

```js
// data/nodes/off.js
import { UI, NODE_TYPE, TRANSITION_KIND, CONDITION } from "../constants";

export const OFF = {
  id: "OFF",
  name: "Off",
  ui: UI.ANY,
  type: NODE_TYPE.STATE,
  parent: null,
  description: "Light is off. Primary idle state. Aux LEDs may be active.",
  exitMethod: null,

  transitions: [
    {
      action: "1C",
      target: "RAMP",
      ui: UI.ANY,
      kind: TRANSITION_KIND.NAVIGATE,
      description: "Turn on at memorized brightness",
      condition: null,
    },
    {
      action: "2H",
      target: "RAMP",
      ui: UI.SIMPLE,
      kind: TRANSITION_KIND.MOMENTARY,
      description: "Momentary on at ceiling level",
      condition: null,
    },
    {
      action: "2H",
      target: "RAMP",
      ui: UI.FULL,
      kind: TRANSITION_KIND.MOMENTARY,
      description: "Momentary turbo",
      condition: null,
    },
    // ... rest of transitions
  ],
};
```

### Container nodes — same shape, plus `children` metadata

```js
// data/nodes/strobeGroup.js
export const STROBE_GROUP = {
  id: "STROBE_GROUP",
  name: "Strobe / Mood Modes",
  ui: UI.FULL,
  type: NODE_TYPE.CONTAINER,
  parent: null,
  description: "Special lighting effects...",

  // Container-specific fields
  entryPoint: "last_used",       // or a specific child ID
  childIds: ["CANDLE", "BIKE_FLASHER", "PARTY_STROBE", ...],
  cycleAction: { forward: "2C", backward: "4C" },

  // Shared transitions that every child inherits
  sharedTransitions: [
    { action: "1C", target: "OFF", ui: UI.FULL, kind: "navigate", description: "Turn off" },
    { action: "2C", target: "_next", ui: UI.FULL, kind: "navigate", description: "Next strobe mode" },
    // ...
  ],

  transitions: [],  // the container itself has no direct transitions beyond entry
};

export const CANDLE = {
  id: "CANDLE",
  name: "Candle Mode",
  ui: UI.FULL,
  type: NODE_TYPE.STATE,
  parent: "STROBE_GROUP",
  description: "Simulates candle flame...",

  // Only the transitions unique to this child — shared ones come from parent
  transitions: [
    { action: "1H", target: "_self", ui: UI.FULL, kind: "internal", description: "Brighter" },
    { action: "2H", target: "_self", ui: UI.FULL, kind: "internal", description: "Dimmer" },
    { action: "5H", target: "_self", ui: UI.FULL, kind: "internal", description: "Sunset timer +5 min" },
  ],
};
```

### Config menu nodes — add `menuItems`

```js
export const RAMP_CONFIG = {
  id: "RAMP_CONFIG",
  name: "Ramp Config Menu",
  ui: UI.FULL,
  type: NODE_TYPE.CONFIG_MENU,
  parent: null,
  enteredFrom: "RAMP",
  enteredVia: "7H",
  returnsTo: "RAMP",

  // Varies by active ramp style — represent both variants
  menuVariants: {
    smooth: [
      { position: 1, name: "Floor level", default: "1/150", valueScheme: "clicks = ramp level" },
      { position: 2, name: "Ceiling level", default: "120/150", valueScheme: "clicks down from max" },
      { position: 3, name: "Ramp speed", default: 1, valueScheme: "1=fastest, 4=slowest" },
    ],
    stepped: [
      { position: 1, name: "Floor level", default: "20/150", valueScheme: "clicks = ramp level" },
      { position: 2, name: "Ceiling level", default: "120/150", valueScheme: "clicks down from max" },
      { position: 3, name: "Number of steps", default: 7, valueScheme: "1–150" },
    ],
  },

  transitions: [],
};
```

### `graph.js` — assembles everything and provides lookups

```js
import { OFF } from "./nodes/off";
import { RAMP } from "./nodes/ramp";
import { STROBE_GROUP, CANDLE, BIKE_FLASHER, ... } from "./nodes/strobeGroup";
// ... all other imports

const ALL_NODES = [
  OFF, RAMP, LOCKOUT,
  STROBE_GROUP, CANDLE, BIKE_FLASHER, PARTY_STROBE, /* ... */
  BLINKY_GROUP, BATTERY_CHECK, TEMPERATURE_CHECK, BEACON, SOS,
  TACTICAL_MODE, TACTICAL_SLOT_1, TACTICAL_SLOT_2, TACTICAL_SLOT_3,
  MOMENTARY_MODE,
  VERSION_CHECK, FACTORY_RESET,
  RAMP_CONFIG, RAMP_EXTRAS_CONFIG, SIMPLE_UI_CONFIG,
  VOLTAGE_CONFIG, THERMAL_CONFIG, AUTO_LOCK_CONFIG,
  MISC_CONFIG, TACTICAL_CONFIG, CHANNEL_MODE_CONFIG,
];

// Keyed lookup: nodeMap["OFF"] → node object
export const nodeMap = Object.fromEntries(ALL_NODES.map(n => [n.id, n]));

// Get a node's effective transitions (own + inherited from parent container)
export function getEffectiveTransitions(nodeId) {
  const node = nodeMap[nodeId];
  if (!node) return [];
  const parent = node.parent ? nodeMap[node.parent] : null;
  const shared = parent?.sharedTransitions ?? [];
  return [...shared, ...node.transitions];
}

// All top-level node IDs (no parent)
export const topLevelIds = ALL_NODES.filter(n => !n.parent).map(n => n.id);

// All container IDs
export const containerIds = ALL_NODES.filter(n => n.type === "container").map(n => n.id);

export default ALL_NODES;
```

## The React Layer

The React components **never define node data** — they just read from `graph.js` and filter based on hook state. Here's what each component is responsible for:

**`UIToggle`** — renders a SIMPLE/FULL switch. Drives the `useUIMode` hook which stores the active mode.

**`ConditionToggles`** — renders checkboxes for hardware conditions (multi-channel, has tint, extended simple, etc.). Drives `useConditions`.

**`NodeView`** — given a `nodeId`, pulls the node from `nodeMap`, calls `getEffectiveTransitions()`, filters both the node and its transitions through `filterGraph.js` using the current UI mode + conditions, and renders the description, transition list, and (for config menus) menu items.

**`ContainerView`** — for container nodes, renders the children as a tabbed or card layout. Each child tab renders a `NodeView`. Shows the shared transitions once at the container level.

**`TransitionList`** — takes a filtered transitions array and renders each one as a row. Transitions with `kind: "navigate"` are clickable links that call `useNodeNavigation` to change the current node. Internal/momentary ones are displayed but not clickable.

**`GraphOverview`** — the "map" view. Iterates `topLevelIds`, renders each as a box, draws arrows for all `navigate` transitions between them. Containers are rendered as grouped boxes with their children inside.

## The key filtering utility

```js
// utils/filterGraph.js

export function isVisible(uiProp, activeUI) {
  // ANY is always visible; otherwise must match
  return uiProp === "ANY" || uiProp === activeUI;
}

export function filterTransitions(transitions, activeUI, activeConditions) {
  return transitions.filter(t => {
    if (!isVisible(t.ui, activeUI)) return false;
    if (t.condition && !activeConditions.has(t.condition)) return false;
    return true;
  });
}
```
