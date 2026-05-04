# Anduril 2 UI — State Model Reference

> **Purpose**: Machine-readable reference for building an interactive Anduril 2 UI explorer website.
> Every state ("node") lists its transitions, UI availability, and parent group.
> The site can filter/render by `ui` property and collapse/expand container nodes.

---

## Data Model Conventions

### Node Properties

| Property       | Type                          | Description |
|----------------|-------------------------------|-------------|
| `id`           | string                        | Unique node identifier (UPPER_SNAKE_CASE) |
| `name`         | string                        | Human-readable display name |
| `ui`           | `SIMPLE` \| `FULL` \| `ANY`  | Which UI mode(s) can reach/use this node |
| `type`         | `state` \| `container` \| `config_menu` \| `action` | See below |
| `parent`       | string \| null                | ID of the container node this belongs to, or null for top-level |
| `description`  | string                        | Short explanation of what this state does |
| `exit_method`  | string \| null                | Special exit instructions (e.g. "disconnect power") |

### Node Types

- **state**: A mode the flashlight can be "in" (e.g. OFF, RAMP, LOCKOUT).
- **container**: A grouping node whose children are the actual states the user cycles through (e.g. STROBE_GROUP, BLINKY_GROUP). The container itself is entered via a single action, and the user lands on a specific child.
- **config_menu**: A modal configuration state. After completing, returns to the state it was entered from.
- **action**: A one-shot action that doesn't persist as a state (e.g. FACTORY_RESET, VERSION_CHECK).

### Transition Properties

| Property       | Type                          | Description |
|----------------|-------------------------------|-------------|
| `action`       | string                        | Button shorthand (e.g. `1C`, `3H`, `10C`) |
| `target`       | string                        | Target node ID |
| `ui`           | `SIMPLE` \| `FULL` \| `ANY`  | UI availability of this specific transition |
| `kind`         | `navigate` \| `internal` \| `momentary` \| `config` | See below |
| `description`  | string                        | What this transition does |
| `condition`    | string \| null                | Optional condition (e.g. "multi_channel", "single_channel", "some_lights") |

### Transition Kinds

- **navigate**: Leaves the current state and enters the target state.
- **internal**: An action within the current state (e.g. ramp up/down, change brightness). Target is the same node or `_self`.
- **momentary**: Active only while the button is held; returns to current state on release.
- **config**: Opens a config_menu node; returns to the invoking state when done.

---

## Top-Level Nodes (not inside any container)

```
OFF
RAMP
LOCKOUT
BLINKY_GROUP        (container)
STROBE_GROUP        (container)
TACTICAL_MODE       (container)
MOMENTARY_MODE
VERSION_CHECK
FACTORY_RESET
```

---

## Node Definitions

---

### OFF

- **id**: `OFF`
- **name**: Off
- **ui**: `ANY`
- **type**: `state`
- **parent**: `null`
- **description**: Light is off. Primary idle state. Aux LEDs may be active.

#### Transitions from OFF

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1C` | `RAMP` | `ANY` | navigate | Turn on at memorized brightness level | |
| `1H` | `RAMP` | `ANY` | navigate | Turn on at floor level; keep holding to ramp up | |
| `2C` | `RAMP` | `ANY` | navigate | Turn on at ceiling level | |
| `2H` | `RAMP` | `SIMPLE` | momentary | Momentary on at ceiling level (release to turn off) | |
| `2H` | `RAMP` | `FULL` | momentary | Momentary turbo (release to turn off) | |
| `3C` | `BATTERY_CHECK` | `ANY` | navigate | Enter battery check (blinky group entry point). In Simple UI shows voltage once then turns off. | |
| `3H` | `STROBE_GROUP` | `FULL` | navigate | Enter strobe/mood modes (last-used strobe) | |
| `4C` | `LOCKOUT` | `ANY` | navigate | Enter lockout mode | |
| `5C` | `MOMENTARY_MODE` | `FULL` | navigate | Enter momentary mode | |
| `6C` | `TACTICAL_MODE` | `FULL` | navigate | Enter tactical mode | |
| `7C` | `_self` | `FULL` | internal | Aux LEDs: cycle to next pattern (off mode pattern) | |
| `7H` | `_self` | `FULL` | internal | Aux LEDs: cycle to next color (off mode color) | |
| `9H` | `MISC_CONFIG` | `FULL` | config | Open misc config menu (hardware-specific) | some_lights |
| `10C` | `_self` | `FULL` | internal | Switch to Simple UI | |
| `10H` | `_self` | `SIMPLE` | internal | Switch to Advanced UI | |
| `10H` | `SIMPLE_UI_CONFIG` | `FULL` | config | Open Simple UI ramp config menu | |
| `13H` | `FACTORY_RESET` | `ANY` | action | Factory reset (hold ~4s). Also available via tailcap method. | some_lights |
| `15+C` | `VERSION_CHECK` | `ANY` | action | Display firmware version | |

**Extended Simple UI** (enabled on some lights by manufacturer):

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `7C` | `_self` | `SIMPLE` | internal | Aux LEDs: cycle to next pattern | extended_simple |
| `7H` | `_self` | `SIMPLE` | internal | Aux LEDs: cycle to next color | extended_simple |

---

### RAMP

- **id**: `RAMP`
- **name**: Ramp Mode (On)
- **ui**: `ANY`
- **type**: `state`
- **parent**: `null`
- **description**: Light is on. Smooth or stepped brightness ramping. Main operating state.

#### Transitions from RAMP

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1C` | `OFF` | `ANY` | navigate | Turn off | |
| `1H` | `_self` | `ANY` | internal | Ramp up (reverses direction if button released <1s ago, or if already at ceiling) | |
| `2H` | `_self` | `ANY` | internal | Ramp down | |
| `2C` | `_self` | `ANY` | internal | Go to/from ceiling or turbo (behavior depends on turbo style config) | |
| `3C` | `_self` | `FULL` | internal | Toggle ramp style (smooth ↔ stepped) | single_channel |
| `3C` | `_self` | `FULL` | internal | Next channel mode | multi_channel |
| `6C` | `_self` | `FULL` | internal | Toggle ramp style (smooth ↔ stepped) | multi_channel |
| `3H` | `_self` | `FULL` | momentary | Momentary turbo | single_channel, no_tint |
| `3H` | `_self` | `FULL` | internal | Tint ramp (adjust channel blend) | has_tint |
| `4H` | `_self` | `FULL` | momentary | Momentary turbo | multi_channel |
| `4C` | `LOCKOUT` | `ANY` | navigate | Enter lockout mode | |
| `5C` | `MOMENTARY_MODE` | `FULL` | navigate | Enter momentary mode (steady at current brightness) | |
| `5H` | `_self` | `FULL` | internal | Start/extend sunset timer (+5 min per blink while held) | |
| `7H` | `RAMP_CONFIG` | `FULL` | config | Open ramp config menu (floor, ceiling, speed/steps for current ramp style) | |
| `10C` | `_self` | `FULL` | internal | Activate manual memory; save current brightness and channel mode | |
| `10H` | `RAMP_EXTRAS_CONFIG` | `FULL` | config | Open ramp extras config menu | |

**Extended Simple UI** (enabled on some lights by manufacturer):

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `3C` | `_self` | `SIMPLE` | internal | Toggle ramp style (smooth ↔ stepped) | extended_simple |
| `5H` | `_self` | `SIMPLE` | internal | Start/extend sunset timer | extended_simple |

---

### LOCKOUT

- **id**: `LOCKOUT`
- **name**: Lockout Mode
- **ui**: `ANY`
- **type**: `state`
- **parent**: `null`
- **description**: Button lock to prevent accidental activation. Also serves as momentary moon mode. Aux LEDs use separate lockout pattern/color settings.

#### Transitions from LOCKOUT

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1H` | `_self` | `ANY` | momentary | Momentary moon (lowest floor level) | |
| `2H` | `_self` | `ANY` | momentary | Momentary moon (highest floor level, or manual mem level) | |
| `3C` | `OFF` | `ANY` | navigate | Unlock → go to Off mode | |
| `3H` | `_self` | `ANY` | internal | Next channel mode | multi_channel |
| `4C` | `RAMP` | `ANY` | navigate | Unlock → turn on at memorized level | |
| `4H` | `RAMP` | `ANY` | navigate | Unlock → turn on at floor level | |
| `5C` | `RAMP` | `ANY` | navigate | Unlock → turn on at ceiling level | |
| `7C` | `_self` | `FULL` | internal | Aux LEDs: cycle to next pattern (lockout pattern) | |
| `7H` | `_self` | `FULL` | internal | Aux LEDs: cycle to next color (lockout color) | |
| `10H` | `AUTO_LOCK_CONFIG` | `FULL` | config | Open auto-lock config menu | |

**Extended Simple UI Lockout** (enabled on some lights by manufacturer):

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `7C` | `_self` | `SIMPLE` | internal | Aux LEDs: cycle to next pattern | extended_simple |
| `7H` | `_self` | `SIMPLE` | internal | Aux LEDs: cycle to next color | extended_simple |

**Simple UI Lockout** (slightly different mapping):

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1H` | `_self` | `SIMPLE` | momentary | Momentary moon | |
| `2H` | `_self` | `SIMPLE` | momentary | Momentary low | |
| `3C` | `OFF` | `SIMPLE` | navigate | Unlock → turn off | |
| `4C` | `RAMP` | `SIMPLE` | navigate | Unlock → turn on | |
| `4H` | `RAMP` | `SIMPLE` | navigate | Unlock → turn on at low level | |
| `5C` | `RAMP` | `SIMPLE` | navigate | Unlock → turn on at high level | |

---

## Container: BLINKY_GROUP

- **id**: `BLINKY_GROUP`
- **name**: Blinky / Utility Modes
- **ui**: `ANY` (entry is `ANY`, but cycling through children requires `FULL`)
- **type**: `container`
- **parent**: `null`
- **description**: Utility modes for diagnostics and signaling. Entered via `OFF → 3C`. Always starts at BATTERY_CHECK. In Simple UI, only BATTERY_CHECK is accessible (shows once, then off). In Advanced UI, user can cycle through all children with 2C.
- **entry_point**: `BATTERY_CHECK`
- **children**: `[BATTERY_CHECK, TEMPERATURE_CHECK, BEACON, SOS]`
- **cycle_action**: `2C` (next blinky mode, wraps around)

### BATTERY_CHECK

- **id**: `BATTERY_CHECK`
- **name**: Battery Check
- **ui**: `ANY`
- **type**: `state`
- **parent**: `BLINKY_GROUP`
- **description**: Blinks out battery voltage (e.g. 4.16V = "4, 1, 6"). In Simple UI, displays once then turns off. In Advanced UI, repeats continuously.

#### Transitions from BATTERY_CHECK

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1C` | `OFF` | `ANY` | navigate | Turn off | |
| `2C` | `TEMPERATURE_CHECK` | `FULL` | navigate | Next blinky mode | |
| `3C` | `_self` | `FULL` | internal | Next channel mode (which LEDs blink numbers) | multi_channel |
| `7H` | `VOLTAGE_CONFIG` | `FULL` | config | Open voltage config menu | |

### TEMPERATURE_CHECK

- **id**: `TEMPERATURE_CHECK`
- **name**: Temperature Check
- **ui**: `FULL`
- **type**: `state`
- **parent**: `BLINKY_GROUP`
- **description**: Blinks out current temperature in °C. Requires temperature sensor.

#### Transitions from TEMPERATURE_CHECK

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1C` | `OFF` | `FULL` | navigate | Turn off | |
| `2C` | `BEACON` | `FULL` | navigate | Next blinky mode | |
| `7H` | `THERMAL_CONFIG` | `FULL` | config | Open thermal config menu | |

### BEACON

- **id**: `BEACON`
- **name**: Beacon Mode
- **ui**: `FULL`
- **type**: `state`
- **parent**: `BLINKY_GROUP`
- **description**: Periodic blink. 100ms on, configurable interval between blinks. Brightness follows ramp memory.

#### Transitions from BEACON

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1C` | `OFF` | `FULL` | navigate | Turn off | |
| `1H` | `_self` | `FULL` | internal | Configure beacon timing (hold = 1 blink/sec, release to set interval) | |
| `2C` | `SOS` | `FULL` | navigate | Next blinky mode | |

### SOS

- **id**: `SOS`
- **name**: SOS Mode
- **ui**: `FULL`
- **type**: `state`
- **parent**: `BLINKY_GROUP`
- **description**: Distress signal (· · · — — — · · ·). Repeats until off or battery low. Brightness follows ramp memory.

#### Transitions from SOS

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1C` | `OFF` | `FULL` | navigate | Turn off | |
| `2C` | `BATTERY_CHECK` | `FULL` | navigate | Next blinky mode (wraps to start) | |

---

## Container: STROBE_GROUP

- **id**: `STROBE_GROUP`
- **name**: Strobe / Mood Modes
- **ui**: `FULL`
- **type**: `container`
- **parent**: `null`
- **description**: Special lighting effects. Entered via `OFF → 3H` (click, click, hold). Remembers last-used strobe mode.
- **entry_point**: last used child (defaults to first)
- **children**: `[CANDLE, BIKE_FLASHER, PARTY_STROBE, TACTICAL_STROBE, POLICE_STROBE, LIGHTNING]`
- **cycle_action**: `2C` (next), `4C` (previous)

#### Shared Transitions (all children)

These transitions are available in every strobe/mood child state:

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1C` | `OFF` | `FULL` | navigate | Turn off | |
| `2C` | `(next child)` | `FULL` | navigate | Next strobe/mood mode | |
| `4C` | `(prev child)` | `FULL` | navigate | Previous strobe/mood mode | |
| `5C` | `MOMENTARY_MODE` | `FULL` | navigate | Enter momentary mode (using current strobe settings) | |
| `3C` | `_self` | `FULL` | internal | Next channel mode (saved per strobe mode) | multi_channel |

### CANDLE

- **id**: `CANDLE`
- **name**: Candle Mode
- **ui**: `FULL`
- **type**: `state`
- **parent**: `STROBE_GROUP`
- **description**: Simulates candle flame with random brightness flickering. Configurable brightness. Supports sunset timer.

#### Additional Transitions (beyond shared)

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1H` | `_self` | `FULL` | internal | Increase brightness | |
| `2H` | `_self` | `FULL` | internal | Decrease brightness | |
| `5H` | `_self` | `FULL` | internal | Start/extend sunset timer (+5 min) | |

### BIKE_FLASHER

- **id**: `BIKE_FLASHER`
- **name**: Bike Flasher
- **ui**: `FULL`
- **type**: `state`
- **parent**: `STROBE_GROUP`
- **description**: Medium brightness with periodic brighter stutter once per second. Configurable brightness.

#### Additional Transitions (beyond shared)

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1H` | `_self` | `FULL` | internal | Increase brightness | |
| `2H` | `_self` | `FULL` | internal | Decrease brightness | |

### PARTY_STROBE

- **id**: `PARTY_STROBE`
- **name**: Party Strobe
- **ui**: `FULL`
- **type**: `state`
- **parent**: `STROBE_GROUP`
- **description**: Motion-freezing strobe. Can freeze spinning fans and falling water. Configurable speed.

#### Additional Transitions (beyond shared)

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1H` | `_self` | `FULL` | internal | Faster strobe | |
| `2H` | `_self` | `FULL` | internal | Slower strobe | |

### TACTICAL_STROBE

- **id**: `TACTICAL_STROBE`
- **name**: Tactical Strobe
- **ui**: `FULL`
- **type**: `state`
- **parent**: `STROBE_GROUP`
- **description**: Disorienting strobe with 33% duty cycle. Configurable speed. Caution: heat buildup with extended use.

#### Additional Transitions (beyond shared)

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1H` | `_self` | `FULL` | internal | Faster strobe | |
| `2H` | `_self` | `FULL` | internal | Slower strobe | |

### POLICE_STROBE

- **id**: `POLICE_STROBE`
- **name**: Police Strobe
- **ui**: `FULL`
- **type**: `state`
- **parent**: `STROBE_GROUP`
- **description**: Two-color police-style strobe. Brightness follows ramp memory. No user-adjustable parameters.
- **condition**: `some_lights` (requires 2+ LED colors)

#### Additional Transitions (beyond shared)

None. No `1H`/`2H` adjustments.

### LIGHTNING

- **id**: `LIGHTNING`
- **name**: Lightning Storm Mode
- **ui**: `FULL`
- **type**: `state`
- **parent**: `STROBE_GROUP`
- **description**: Random brightness and speed simulating lightning. WARNING: may suddenly reach full power.

#### Additional Transitions (beyond shared)

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1H` | `_self` | `FULL` | internal | Interrupt current flash or start new one | |

---

## Container: TACTICAL_MODE

- **id**: `TACTICAL_MODE`
- **name**: Tactical Mode
- **ui**: `FULL`
- **type**: `container`
- **parent**: `null`
- **description**: Instant momentary access to configurable high/low/strobe slots. Entered via `OFF → 6C`. Aux LEDs inherit from lockout mode settings. Each slot is configurable (brightness level 1–150, or strobe mode at 0 / 151+).
- **entry_point**: (awaits user hold input)
- **children**: `[TACTICAL_SLOT_1, TACTICAL_SLOT_2, TACTICAL_SLOT_3]`

#### Transitions from TACTICAL_MODE

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `1H` | `TACTICAL_SLOT_1` | `FULL` | momentary | Activate slot 1 (default: High) while held | |
| `2H` | `TACTICAL_SLOT_2` | `FULL` | momentary | Activate slot 2 (default: Low) while held | |
| `3H` | `TACTICAL_SLOT_3` | `FULL` | momentary | Activate slot 3 (default: Strobe) while held | |
| `6C` | `OFF` | `FULL` | navigate | Exit tactical mode → Off | |
| `7H` | `TACTICAL_CONFIG` | `FULL` | config | Open tactical mode config menu | |

### TACTICAL_SLOT_1

- **id**: `TACTICAL_SLOT_1`
- **name**: Tactical Slot 1 (High)
- **ui**: `FULL`
- **type**: `state`
- **parent**: `TACTICAL_MODE`
- **description**: Default: high brightness. Configurable to any ramp level (1–150) or strobe mode (0, 151+).

### TACTICAL_SLOT_2

- **id**: `TACTICAL_SLOT_2`
- **name**: Tactical Slot 2 (Low)
- **ui**: `FULL`
- **type**: `state`
- **parent**: `TACTICAL_MODE`
- **description**: Default: low brightness. Configurable to any ramp level (1–150) or strobe mode (0, 151+).

### TACTICAL_SLOT_3

- **id**: `TACTICAL_SLOT_3`
- **name**: Tactical Slot 3 (Strobe)
- **ui**: `FULL`
- **type**: `state`
- **parent**: `TACTICAL_MODE`
- **description**: Default: last-used strobe mode. Configurable to any ramp level (1–150) or strobe mode (0, 151+).

---

## Standalone States

### MOMENTARY_MODE

- **id**: `MOMENTARY_MODE`
- **name**: Momentary Mode
- **ui**: `FULL`
- **type**: `state`
- **parent**: `null`
- **description**: Light is on only while button is held. Uses steady brightness (ramp memory) or strobe (copies last strobe settings), depending on which mode was active before entry. Entered from OFF (5C), RAMP (5C), or any STROBE child (5C).
- **exit_method**: `disconnect_power` (physically unscrew tailcap or battery tube)

#### Transitions from MOMENTARY_MODE

| Action | Target | UI | Kind | Description | Condition |
|--------|--------|----|------|-------------|-----------|
| `hold` | `_self` | `FULL` | momentary | Light on while button held | |
| `disconnect_power` | `OFF` | `FULL` | navigate | Exit momentary mode (unscrew tailcap) | |

---

## Action Nodes (non-persistent states)

### VERSION_CHECK

- **id**: `VERSION_CHECK`
- **name**: Version Check
- **ui**: `ANY`
- **type**: `action`
- **parent**: `null`
- **description**: Blinks out firmware version (MODEL.YYYY-MM-DD format). Entered via `OFF → 15+C`. After display, returns to OFF.

### FACTORY_RESET

- **id**: `FACTORY_RESET`
- **name**: Factory Reset
- **ui**: `ANY`
- **type**: `action`
- **parent**: `null`
- **description**: Resets all settings to defaults and auto-calibrates temperature sensor. Entered via `OFF → 13H` (hold ~4s) or tailcap method (loosen, hold button, tighten, keep holding). Light flickers brighter during hold; release early to abort. Simple UI is enabled after reset. Returns to OFF.

---

## Config Menu Nodes

All config menus share a common interaction pattern:
1. Light blinks once per menu item.
2. **Hold through a blink** to skip that item.
3. **Release on a blink** to configure that item → enters number entry sub-state.
4. In number entry: **click = +1**, **hold = +10**, **wait = confirm and move on**.
5. After all items (or all skipped), returns to the invoking state.

---

### RAMP_CONFIG

- **id**: `RAMP_CONFIG`
- **name**: Ramp Config Menu
- **ui**: `FULL`
- **type**: `config_menu`
- **parent**: `null`
- **description**: Configure floor, ceiling, and speed/steps for the currently active ramp style.
- **entered_from**: `RAMP → 7H`
- **returns_to**: `RAMP`

#### Menu Items

**Smooth ramp active:**
1. Floor level (default ~1/150)
2. Ceiling level (default ~120/150; each click = 1 level lower from max)
3. Ramp speed (1 = fastest ~2.5s, 2 = ~5s, 3 = ~7.5s, 4 = ~10s)

**Stepped ramp active:**
1. Floor level (default ~20/150)
2. Ceiling level (default ~120/150)
3. Number of steps (1–150; 1 = special case at midpoint)

---

### RAMP_EXTRAS_CONFIG

- **id**: `RAMP_EXTRAS_CONFIG`
- **name**: Ramp Extras Config Menu
- **ui**: `FULL`
- **type**: `config_menu`
- **parent**: `null`
- **description**: Advanced ramp behavior settings.
- **entered_from**: `RAMP → 10H`
- **returns_to**: `RAMP`

#### Menu Items

1. **Disable manual memory** → revert to automatic memory (any value entered)
2. **Manual memory timer** → N clicks = N minutes (0 = timer off, makes it pure manual memory)
3. **Ramp-after-moon style** → 0: ramp up after moon, 1: stay at floor
4. **Advanced UI turbo style** → 0: no turbo (ceiling only), 1: Anduril 1 style (2C = full power), 2: Anduril 2 style (2C = ceiling, then full power if already at ceiling). Also affects momentary turbo.
5. **Smooth steps** → 0: disable, 1: enable (animated transitions between stepped levels)

---

### SIMPLE_UI_CONFIG

- **id**: `SIMPLE_UI_CONFIG`
- **name**: Simple UI Config Menu
- **ui**: `FULL`
- **type**: `config_menu`
- **parent**: `null`
- **description**: Configure Simple UI's ramp parameters. Only accessible from Advanced UI.
- **entered_from**: `OFF → 10H` (while in Advanced UI)
- **returns_to**: `OFF`

#### Menu Items

1. Floor level (default ~20/150)
2. Ceiling level (default ~120/150)
3. Number of steps (default ~5)
4. Turbo style (default 0 = no turbo)

---

### VOLTAGE_CONFIG

- **id**: `VOLTAGE_CONFIG`
- **name**: Voltage Config Menu
- **ui**: `FULL`
- **type**: `config_menu`
- **parent**: `null`
- **description**: Battery voltage calibration and aux LED behavior settings.
- **entered_from**: `BATTERY_CHECK → 7H`
- **returns_to**: `BATTERY_CHECK`

#### Menu Items

1. **Voltage correction factor** → adjusts sensor ±0.30V in 0.05V steps (1C = −0.30V ... 7C = 0V default ... 13C = +0.30V)
2. **Post-off voltage display timeout** → N clicks = N seconds of RGB aux voltage color after sleep (default 4, 0 = off). Requires RGB aux LEDs.
3. **Aux low ramp level** → below this level button LEDs stay off while main is on; at/above this level they light at "low". 0 = always off. Also controls post-off display brightness.
4. **Aux high ramp level** → at/above this level button LEDs light at "high". 0 = disabled. Also controls post-off display brightness.

---

### THERMAL_CONFIG

- **id**: `THERMAL_CONFIG`
- **name**: Thermal Config Menu
- **ui**: `FULL`
- **type**: `config_menu`
- **parent**: `null`
- **description**: Temperature sensor calibration and thermal limit.
- **entered_from**: `TEMPERATURE_CHECK → 7H`
- **returns_to**: `TEMPERATURE_CHECK`

#### Menu Items

1. **Current temperature** → click once per degree C (e.g. 21 clicks for 21°C)
2. **Temperature limit** → clicks = degrees above 30°C (e.g. 20 clicks = 50°C limit; default 45°C; max 70°C)

---

### AUTO_LOCK_CONFIG

- **id**: `AUTO_LOCK_CONFIG`
- **name**: Auto-Lock Config Menu
- **ui**: `FULL`
- **type**: `config_menu`
- **parent**: `null`
- **description**: Configure automatic lockout after turning off.
- **entered_from**: `LOCKOUT → 10H`
- **returns_to**: `LOCKOUT`

#### Menu Items

1. **Auto-lock timeout** → N clicks = N minutes (0 = disabled)

---

### MISC_CONFIG

- **id**: `MISC_CONFIG`
- **name**: Misc Config Menu
- **ui**: `FULL`
- **type**: `config_menu`
- **parent**: `null`
- **description**: Hardware-specific settings. Number and type of items varies by light model.
- **entered_from**: `OFF → 9H`
- **returns_to**: `OFF`
- **condition**: `some_lights`

#### Menu Items (varies by hardware)

1. **Tint ramp style** (if applicable) → 0: smooth, 1: middle only, 2: extremes only, 3+: stepped with N steps
2. **Jump start level** (if applicable) → ramp level 1–150 for low-level startup pulse (typically 20–50)

---

### TACTICAL_CONFIG

- **id**: `TACTICAL_CONFIG`
- **name**: Tactical Mode Config Menu
- **ui**: `FULL`
- **type**: `config_menu`
- **parent**: `null`
- **description**: Configure what each tactical slot does.
- **entered_from**: `TACTICAL_MODE → 7H`
- **returns_to**: `TACTICAL_MODE`

#### Menu Items

1. **Tactical slot 1** → enter value (click = +1, hold = +10): 1–150 = ramp level, 0 = last-used strobe, 151 = party strobe, 152 = tactical strobe, 153+ = other strobes in order
2. **Tactical slot 2** → same value scheme
3. **Tactical slot 3** → same value scheme

---

### CHANNEL_MODE_CONFIG

- **id**: `CHANNEL_MODE_CONFIG`
- **name**: Channel Mode Config Menu
- **ui**: `FULL`
- **type**: `config_menu`
- **parent**: `null`
- **description**: Enable/disable individual channel modes. When only 1 remains, 3C reverts to ramp style toggle and 3H reverts to momentary turbo.
- **entered_from**: `RAMP → 9H` (while on, multi-channel lights)
- **returns_to**: `RAMP`
- **condition**: `multi_channel`

#### Menu Items

- N items, one per channel mode on the light
- For each: 1 = enable, 0 (no clicks) = disable

---

## Aux LED Reference

Aux LED patterns and colors are configured independently for OFF mode and LOCKOUT mode, allowing the user to visually distinguish locked vs unlocked at a glance.

### Patterns (cycled with 7C)

- Off
- Low
- High
- Blinking

### Colors (cycled with 7H, hold to scroll)

- Red
- Yellow (Red+Green)
- Green
- Cyan (Green+Blue)
- Blue
- Purple (Blue+Red)
- White (Red+Green+Blue)
- Disco (fast random)
- Rainbow (slow cycle)
- Voltage (color = battery charge: red = low → purple = full)

---

## Memory System Reference

Three memory styles determine what brightness `OFF → 1C` uses:

| Style | Manual Mem | Manual Mem Timer | Behavior |
|-------|-----------|-----------------|----------|
| Automatic | off | any | Always uses last-ramped brightness |
| Manual | on | 0 | Always uses the saved brightness |
| Hybrid | on | non-zero | Uses last-ramped if off < N minutes, else saved brightness |

"Last-ramped" means the most recent brightness set by ramping (1H/2H). Shortcut levels (turbo, ceiling, floor) do not update automatic memory.

---

## Conditions Reference

These condition strings appear in the `condition` field of transitions and nodes. Use them to filter what is shown based on the user's light hardware.

| Condition | Meaning |
|-----------|---------|
| `single_channel` | Light has only one set of LEDs / one channel mode enabled |
| `multi_channel` | Light has 2+ sets of LEDs with multiple channel modes enabled |
| `has_tint` | Current channel mode supports tint ramping (3H adjusts blend) |
| `no_tint` | Current channel mode has no tint to adjust |
| `some_lights` | Feature is hardware-dependent; not all lights support it |
| `extended_simple` | Light's manufacturer has enabled extended Simple UI features |
| `has_temp_sensor` | Light has a temperature sensor |
| `has_rgb_aux` | Light has RGB aux LEDs (not just single-color) |

---

## Protection Features (not user-navigable states)

These are automatic behaviors, not states the user enters:

- **Low Voltage Protection (LVP)**: Steps down brightness at 2.8V; turns off if already at minimum. Adjustments are sudden, large steps.
- **Thermal Regulation**: Gradually adjusts output to stay at/below configured temperature limit. Adjustments are imperceptibly small steps.

---

## Adding New Nodes — Checklist

When adding a new node to this model:

1. **Choose a unique `id`** in UPPER_SNAKE_CASE.
2. **Set `type`**: Is it a persistent state, a container, a config menu, or a one-shot action?
3. **Set `ui`**: SIMPLE, FULL, or ANY.
4. **Set `parent`**: Does it belong inside a container (BLINKY_GROUP, STROBE_GROUP, TACTICAL_MODE), or is it top-level (null)?
5. **Define transitions**: For each button action, specify target, ui, kind, description, and any condition.
6. **If it's a container**: Define `children`, `entry_point`, and `cycle_action`.
7. **If it's a config_menu**: Define `entered_from`, `returns_to`, and list menu items with their value schemes.
8. **If it has conditions**: Use the conditions reference table, or add a new condition.

---

## Source

Based on the official Anduril 2 manual:
https://github.com/ToyKeeper/anduril/blob/r2025-07-07/docs/anduril-manual.md