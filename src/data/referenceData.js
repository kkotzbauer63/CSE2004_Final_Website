// referenceData.js — Q&A content for the Anduril 2 reference guide
// Sourced from the Anduril 2 manual (r2025-07-07)
// https://github.com/ToyKeeper/anduril/blob/trunk/docs/anduril-manual.md

export const referenceData = [

  // ─── Basic Operation ─────────────────────────────────────────────────────

  {
    id: "turn-on-off",
    question: "How do I turn the light on and off?",
    tags: ["on", "off", "toggle", "basic", "click", "1c"],
    answer: {
      summary: "A single click toggles the light on and off at the memorized brightness level.",
      requirement: "any",
      steps: [
        { input: "1C", from: "Off", description: "Turn on at memorized brightness level" },
        { input: "1C", from: "Ramp (On)", description: "Turn off" },
      ],
      notes: [
        "The memorized level defaults to the last-ramped brightness (automatic memory).",
        "If you've saved a manual memory with 10C while on, the light turns on to that saved level instead.",
        "1H from off turns on at the floor (minimum) level instead of the memorized level.",
      ],
    },
  },

  {
    id: "adjust-brightness",
    question: "How do I adjust brightness?",
    tags: ["brightness", "ramp", "dim", "bright", "hold", "1h", "2h", "up", "down"],
    answer: {
      summary: "Hold to ramp up. Release, then hold again to ramp down. Or hold 2H to ramp down directly.",
      requirement: "any",
      steps: [
        { input: "1H", from: "Ramp (On)", description: "Ramp up (or down if you just ramped up — auto-reverses)" },
        { input: "2H", from: "Ramp (On)", description: "Ramp down" },
        { input: "1H", from: "Off", description: "Turn on at floor level, then continue holding to ramp up" },
      ],
      notes: [
        "After ramping up, releasing and holding again ramps down automatically.",
        "Configure the floor (minimum) and ceiling (maximum) in the Ramp Config menu (7H while on).",
        "Switch between smooth and stepped ramping with 3C while on.",
      ],
    },
  },

  {
    id: "ceiling-turbo",
    question: "How do I jump to maximum brightness (ceiling or turbo)?",
    tags: ["turbo", "ceiling", "max", "2c", "bright", "full power", "maximum"],
    answer: {
      summary: "Double-click while on to toggle between ceiling and current level. From off, double-click to turn on at ceiling.",
      requirement: "any",
      steps: [
        { input: "2C", from: "Off", description: "Turn on directly at ceiling level" },
        { input: "2C", from: "Ramp (On)", description: "Jump to ceiling (or turbo if configured) — press again to return to previous level" },
        { input: "2H", from: "Off", description: "Momentary turbo (Advanced UI) or momentary ceiling (Simple UI) — on while held only" },
        { input: "3H", from: "Ramp (On)", description: "Momentary turbo — full power while held, returns to previous level on release (Advanced UI)" },
      ],
      notes: [
        "Whether 2C goes to ceiling or true turbo depends on the turbo style setting in Ramp Extras Config (item 4).",
        "Turbo style 0: 2C only goes to ceiling. Style 1: 2C always jumps to full power. Style 2: 2C goes to ceiling, then to turbo if pressed again at ceiling.",
      ],
    },
  },

  {
    id: "floor-moon",
    question: "How do I go to minimum brightness (floor / moon)?",
    tags: ["floor", "moon", "minimum", "lowest", "1h", "dim", "low"],
    answer: {
      summary: "Hold from off to turn on at the floor (minimum) level.",
      requirement: "any",
      steps: [
        { input: "1H", from: "Off", description: "Turn on at floor (minimum) level" },
      ],
      notes: [
        "The floor level is configurable in the Ramp Config menu (7H while on). Default for smooth ramp: level 1/150. Stepped ramp: 20/150.",
        "After turning on at floor, keep holding to ramp up from there.",
        "You can configure whether 1H from off stays at floor or ramps up: Ramp Extras Config item 3.",
      ],
    },
  },

  {
    id: "save-memory",
    question: "How do I save my current brightness as the memorized level?",
    tags: ["memory", "save", "memorized", "10c", "manual memory", "remember"],
    answer: {
      summary: "Press 10C while on to save the current brightness as manual memory. The light will always turn on to this level.",
      requirement: "full",
      steps: [
        { input: "1C", from: "Off", description: "Step 1: Turn on" },
        { input: "1H / 2H", from: "Ramp (On)", description: "Step 2: Adjust to desired brightness" },
        { input: "10C", from: "Ramp (On)", description: "Step 3: Save current brightness as manual memory" },
      ],
      notes: [
        "Manual memory overrides automatic memory. The light always turns on to the saved level until you reset it.",
        "To return to automatic memory (tracks last-ramped level), use Ramp Extras Config item 1.",
        "Set a memory timer in Ramp Extras Config item 2 to create hybrid memory: manual level for short periods, then auto.",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "smooth-vs-stepped",
    question: "How do I switch between smooth and stepped ramping?",
    tags: ["smooth", "stepped", "ramp style", "3c", "ramp type", "switch"],
    answer: {
      summary: "Press 3C while on to toggle between smooth ramp and stepped ramp.",
      requirement: "full",
      steps: [
        { input: "3C", from: "Ramp (On)", description: "Toggle between smooth ramp and stepped ramp" },
      ],
      notes: [
        "Smooth ramp: continuously adjustable from floor to ceiling with no discrete steps.",
        "Stepped ramp: discrete brightness levels (default 7 steps, max 150). Configure step count in Ramp Config.",
        "On multi-channel lights, 3C may switch channel modes instead — use 6C to change ramp style in that case.",
        "Requires Advanced UI.",
      ],
    },
  },

  // ─── Locking ─────────────────────────────────────────────────────────────

  {
    id: "lock",
    question: "How do I lock the light?",
    tags: ["lock", "lockout", "4c", "safety", "carry", "pocket"],
    answer: {
      summary: "Press 4C (four rapid clicks) from Off or while on to enter lockout mode.",
      requirement: "any",
      steps: [
        { input: "4C", from: "Off", description: "Enter lockout mode" },
        { input: "4C", from: "Ramp (On)", description: "Enter lockout mode from on state" },
      ],
      notes: [
        "In lockout mode, the light cannot be accidentally turned on to full brightness.",
        "Only brief moon-level momentary light is available in lockout (1H or 2H).",
        "The aux LEDs may still be active in lockout mode, with settings independent from off-mode aux settings.",
      ],
    },
  },

  {
    id: "unlock",
    question: "How do I unlock the light?",
    tags: ["unlock", "lockout", "3c", "4c", "exit lock", "off"],
    answer: {
      summary: "Press 3C from lockout to go to Off, or 4C to turn on directly.",
      requirement: "any",
      steps: [
        { input: "3C", from: "Lockout", description: "Unlock — go to Off mode" },
        { input: "4C", from: "Lockout", description: "Unlock and turn on at memorized level" },
        { input: "4H", from: "Lockout", description: "Unlock and turn on at floor level" },
        { input: "5C", from: "Lockout", description: "Unlock and turn on at ceiling level" },
      ],
      notes: [
        "1H and 2H in lockout produce momentary moon-level light without unlocking.",
      ],
    },
  },

  // ─── UI Mode ─────────────────────────────────────────────────────────────

  {
    id: "switch-to-advanced",
    question: "How do I switch to Advanced UI?",
    tags: ["advanced ui", "full ui", "10h", "unlock features", "advanced mode", "switch ui"],
    answer: {
      summary: "From Off in Simple UI, press 10H to switch to Advanced UI and unlock all features.",
      requirement: "any",
      steps: [
        { input: "10H", from: "Off (Simple UI)", description: "Switch to Advanced UI — all features unlocked" },
      ],
      notes: [
        "Advanced UI enables strobe modes, all config menus, momentary mode, tactical mode, aux LED config, and more.",
        "Simple UI is the safe default that limits access to complex features.",
        "The light remembers which UI mode you last used.",
        "To verify your current mode: 3C from off (battery check) — Simple UI blinks once and turns off; Advanced UI blinks repeatedly.",
      ],
    },
  },

  {
    id: "switch-to-simple",
    question: "How do I switch back to Simple UI?",
    tags: ["simple ui", "10c", "basic mode", "restrict", "switch ui"],
    answer: {
      summary: "From Off in Advanced UI, press 10C to switch to Simple UI.",
      requirement: "full",
      steps: [
        { input: "10C", from: "Off (Advanced UI)", description: "Switch to Simple UI" },
      ],
      notes: [
        "Simple UI is enabled by default after a factory reset.",
        "Simple UI limits access to strobe modes and advanced config — good for everyday carry safety.",
      ],
    },
  },

  // ─── Config Menus ─────────────────────────────────────────────────────────

  {
    id: "config-menu-how-to",
    question: "How do config menus work?",
    tags: ["config menu", "how to use", "number entry", "hold skip", "blinking", "configure"],
    answer: {
      summary: "Config menus step through numbered items. Hold to skip; release when it blinks to configure that item.",
      requirement: "full",
      steps: [
        { input: "(Enter any config menu)", from: "Various", description: "Menu starts: the light blinks once, then dims" },
        { input: "Hold", from: "Config item prompt", description: "Skip this item without changing it — wait for the next blink" },
        { input: "Release (when it blinks)", from: "Config item prompt", description: "Enter number-entry mode for this item" },
        { input: "1C = +1, 1H = +10", from: "Number entry", description: "Enter the desired value by clicking and holding" },
        { input: "(wait ~1s)", from: "Number entry", description: "Confirm value and advance to next item" },
      ],
      notes: [
        "The menu always starts from item 1. Hold through any item you don't want to change.",
        "To set a value of 0, just wait without clicking.",
        "Click once per unit: e.g., for 21°C calibration, click 21 times. For value 10, hold once (adds 10) or click 10 times.",
        "After all items are processed, the menu exits and returns to the prior mode.",
      ],
    },
  },

  {
    id: "ramp-config",
    question: "How do I configure the ramp floor, ceiling, and speed?",
    tags: ["ramp config", "floor", "ceiling", "speed", "steps", "7h", "configure ramp", "minimum", "maximum"],
    answer: {
      summary: "Press 7H while on to open the Ramp Config menu. Configures floor, ceiling, and ramp speed (or step count in stepped mode).",
      requirement: "full",
      steps: [
        { input: "1C", from: "Off", description: "Step 1: Turn on" },
        { input: "7H", from: "Ramp (On)", description: "Step 2: Enter Ramp Config menu" },
      ],
      menuItems: [
        {
          number: 1,
          title: "Floor level",
          description: "Sets the minimum brightness. Click N times to set floor to level N out of 150.",
          detail: "Smooth default: 1/150. Stepped default: 20/150. Example: 5 clicks sets floor to level 5. Hold to keep current value.",
        },
        {
          number: 2,
          title: "Ceiling level",
          description: "Sets the maximum brightness. Click N times to set ceiling N steps below maximum.",
          detail: "Default: 120/150. 1 click = highest possible (150), 2 clicks = 149, 30 clicks = 120 (default), etc.",
        },
        {
          number: 3,
          title: "Ramp speed (smooth) / Number of steps (stepped)",
          description: "In smooth mode: controls how fast the ramp travels. In stepped mode: sets the number of discrete levels.",
          detail: "Smooth: 1=full speed (~2.5s end-to-end), 2=half speed (~5s), 3=third (~7.5s), 4=quarter (~10s). Stepped: click count = number of steps (default 7, max 150).",
        },
      ],
      notes: [
        "This configures the ramp for the current channel/mode. Multi-channel lights may have separate ramp settings per channel.",
        "To configure Simple UI's ramp separately, use Off → 10H (in Advanced UI).",
      ],
    },
  },

  {
    id: "ramp-extras-config",
    question: "How do I configure memory type, turbo style, and ramp extras?",
    tags: ["ramp extras", "memory", "turbo style", "10h", "smooth steps", "auto memory", "manual memory", "hybrid"],
    answer: {
      summary: "Press 10H while on to open the Ramp Extras Config menu.",
      requirement: "full",
      steps: [
        { input: "1C", from: "Off", description: "Step 1: Turn on" },
        { input: "10H", from: "Ramp (On)", description: "Step 2: Enter Ramp Extras Config menu" },
      ],
      menuItems: [
        {
          number: 1,
          title: "Manual memory on/off",
          description: "Enables or disables manual memory. When enabled, the light always turns on to the level saved with 10C.",
          detail: "1 click = enable manual memory. 0 clicks (just hold/skip) = check current, or use to disable. After enabling, save a level with 10C while on.",
        },
        {
          number: 2,
          title: "Manual memory timer (minutes)",
          description: "How many minutes before manual memory expires and the light reverts to automatic memory.",
          detail: "0 clicks = manual memory never expires (pure manual). N clicks = timer of N minutes. With a non-zero timer, you get 'hybrid' memory: manual for short gaps, automatic for longer ones.",
        },
        {
          number: 3,
          title: "Ramp-after-moon behavior",
          description: "What happens after you turn on at floor via 1H from Off.",
          detail: "0 clicks = keeps ramping up if you continue holding (default). 1 click = stays at floor level without ramping.",
        },
        {
          number: 4,
          title: "Advanced UI turbo style",
          description: "Controls what 2C does when at or near the ceiling level.",
          detail: "0 = no turbo (2C only goes to ceiling). 1 = Anduril 1 style: 2C always jumps to full power (150). 2 = Anduril 2 style: 2C goes to ceiling, then to turbo if already at ceiling.",
        },
        {
          number: 5,
          title: "Smooth steps",
          description: "Enables smooth animation between steps in stepped ramp mode.",
          detail: "0 = instant step changes. 1 = smooth animated transitions between each step.",
        },
      ],
      notes: [
        "Memory type summary: Automatic (item 1 off) = tracks last-ramped level. Manual (item 1 on, item 2 = 0) = always returns to saved level. Hybrid (item 1 on, item 2 > 0) = uses manual level until timer expires.",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "simple-ui-config",
    question: "How do I configure Simple UI settings (floor, ceiling, steps)?",
    tags: ["simple ui config", "10h", "configure simple ui", "floor", "ceiling", "steps", "simple"],
    answer: {
      summary: "From Off in Advanced UI, press 10H to open the Simple UI Config menu.",
      requirement: "full",
      steps: [
        { input: "10H", from: "Off (Advanced UI)", description: "Open Simple UI Config menu" },
      ],
      menuItems: [
        {
          number: 1,
          title: "Floor level",
          description: "Minimum brightness in Simple UI.",
          detail: "Default: 20/150. Click N times for level N.",
        },
        {
          number: 2,
          title: "Ceiling level",
          description: "Maximum brightness in Simple UI.",
          detail: "Default: 120/150. 1 click = highest possible, 2 clicks = second-highest, etc.",
        },
        {
          number: 3,
          title: "Number of steps",
          description: "How many discrete brightness levels appear in Simple UI's stepped ramp.",
          detail: "Default: 5 steps.",
        },
        {
          number: 4,
          title: "Turbo style",
          description: "Whether 2C in Simple UI jumps to ceiling or full turbo.",
          detail: "Default: 0 (ceiling only, no turbo in Simple UI).",
        },
      ],
      notes: [
        "These settings only affect Simple UI. Advanced UI has its own independent ramp config.",
        "You must be in Advanced UI to access this menu — Simple UI cannot configure itself.",
      ],
    },
  },

  {
    id: "voltage-config",
    question: "How do I configure voltage correction and battery display?",
    tags: ["voltage config", "battery", "calibration", "aux leds", "post-off", "7h", "battcheck", "voltage correction", "povd"],
    answer: {
      summary: "Enter Battery Check (3C from Off), then press 7H to open the Voltage Config menu.",
      requirement: "full",
      steps: [
        { input: "3C", from: "Off", description: "Step 1: Enter Battery Check mode" },
        { input: "7H", from: "Battery Check", description: "Step 2: Open Voltage Config menu" },
      ],
      menuItems: [
        {
          number: 1,
          title: "Voltage correction factor",
          description: "Adjusts the battery voltage reading by ±0.30V in 0.05V steps to fix measurement inaccuracies.",
          detail: "1 click = −0.30V offset. 7 clicks = 0V (default, no correction). 13 clicks = +0.30V. Use if battery check reads too high or low compared to a multimeter.",
        },
        {
          number: 2,
          title: "Post-off voltage display timeout",
          description: "How many seconds the aux LEDs show battery charge by color after the light turns off.",
          detail: "Click N times for N seconds. 0 clicks = disabled (no post-off display). Default is 4 seconds.",
        },
        {
          number: 3,
          title: "Aux low ramp level",
          description: "Below this brightness level, the button/aux LEDs stay off while the main LEDs are on.",
          detail: "0 = button LEDs always off while main emitters are on. Higher values keep them off up to a higher brightness. Also affects post-off voltage display brightness.",
        },
        {
          number: 4,
          title: "Aux high ramp level",
          description: "At or above this brightness level, button/aux LEDs switch to high brightness while the main LEDs are on.",
          detail: "0 = high mode for button LEDs is disabled while main emitters are on. Also affects post-off voltage display brightness.",
        },
      ],
      notes: [
        "Post-off voltage display colors: red = low battery (~3.0V), orange/yellow = medium, green = good (~4.0V), blue/purple = full (~4.2V).",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "thermal-config",
    question: "How do I calibrate the temperature sensor and set a thermal limit?",
    tags: ["thermal", "temperature", "calibration", "limit", "7h", "tempcheck", "overheat", "thermal regulation"],
    answer: {
      summary: "Enter Temp Check mode (3C → 2C from Off), then press 7H to open the Thermal Config menu.",
      requirement: "full",
      steps: [
        { input: "3C", from: "Off", description: "Step 1: Enter Battery Check mode" },
        { input: "2C", from: "Battery Check", description: "Step 2: Advance to Temp Check mode" },
        { input: "7H", from: "Temp Check", description: "Step 3: Open Thermal Config menu" },
      ],
      menuItems: [
        {
          number: 1,
          title: "Current temperature calibration",
          description: "Tell the firmware the actual ambient temperature right now so it can calibrate the sensor.",
          detail: "Click once per degree Celsius. For 21°C ambient, click 21 times. Place the light on a surface for a few minutes at room temperature before calibrating.",
        },
        {
          number: 2,
          title: "Temperature limit",
          description: "Maximum temperature before the firmware steps down brightness to prevent overheating.",
          detail: "Click once per degree above 30°C. Default: 45°C (15 clicks). Maximum: 70°C (40 clicks). Higher limit = allows more heat before throttling. Anduril will gradually reduce output to stay at or below this limit.",
        },
      ],
      notes: [
        "Always calibrate at ambient room temperature for accurate thermal regulation.",
        "The thermal limit protects the LED and driver. Setting it very high can damage the light during sustained high-output use.",
        "Thermal regulation adjusts brightness gradually and imperceptibly, unlike the sudden steps of low-voltage protection.",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "autolock-config",
    question: "How do I set up auto-lock (automatic lockout after a timeout)?",
    tags: ["auto lock", "autolock", "lockout", "timeout", "10h", "automatic lock", "lock timeout"],
    answer: {
      summary: "From lockout mode, press 10H to set the auto-lock timeout in minutes.",
      requirement: "full",
      steps: [
        { input: "4C", from: "Off", description: "Step 1: Enter lockout mode" },
        { input: "10H", from: "Lockout", description: "Step 2: Enter Auto-Lock Config menu" },
        { input: "N clicks", from: "Config menu", description: "Click N times to set auto-lock timeout to N minutes (0 = disabled)" },
      ],
      menuItems: [
        {
          number: 1,
          title: "Auto-lock timeout in minutes",
          description: "How many minutes after the light enters Off mode before it automatically locks.",
          detail: "0 clicks = auto-lock disabled (default). N clicks = locks automatically after N minutes of being off.",
        },
      ],
      notes: [
        "Auto-lock is useful for EDC (everyday carry) to prevent accidental activation in a pocket or bag.",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "tactical-config",
    question: "How do I configure tactical mode slots?",
    tags: ["tactical", "config", "7h", "slots", "configure tactical", "slot 1", "slot 2", "slot 3"],
    answer: {
      summary: "Enter tactical mode (6C from Off), then press 7H to configure the three momentary slots.",
      requirement: "full",
      steps: [
        { input: "6C", from: "Off", description: "Step 1: Enter tactical mode" },
        { input: "7H", from: "Tactical", description: "Step 2: Enter Tactical Config menu" },
        { input: "Release at blink 1, 2, or 3", from: "Config menu", description: "Release when it blinks to configure that slot number" },
        { input: "Clicks + holds", from: "Number entry", description: "Enter value: click = +1, hold = +10" },
      ],
      menuItems: [
        {
          number: 1,
          title: "Slot 1 (activated by 1H — High)",
          description: "Brightness level or mode for the first tactical slot.",
          detail: "1–150 = a specific brightness level. 0 = last-used strobe mode. 151 = party strobe. 152 = tactical strobe. 153+ = other strobes in sequence.",
        },
        {
          number: 2,
          title: "Slot 2 (activated by 2H — Low)",
          description: "Brightness level or mode for the second tactical slot.",
          detail: "Same options as Slot 1.",
        },
        {
          number: 3,
          title: "Slot 3 (activated by 3H — Strobe)",
          description: "Mode for the third tactical slot (usually configured as a strobe).",
          detail: "0 = last-used strobe. 151 = party strobe. 152 = tactical strobe. 153+ = other strobes. 1–150 = steady brightness level.",
        },
      ],
      notes: [
        "Each slot activates only while holding — releasing the button turns it off.",
        "Exit tactical mode with 6C.",
        "Aux LED settings in tactical mode are inherited from lockout mode's aux settings.",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "misc-config",
    question: "How do I configure tint ramp style and jump start level?",
    tags: ["misc config", "9h", "tint", "jump start", "miscellaneous", "multi-channel", "channel"],
    answer: {
      summary: "From Off in Advanced UI, press 9H to open the Misc Config menu. Available on some lights only.",
      requirement: "full",
      steps: [
        { input: "9H", from: "Off (Advanced UI)", description: "Open Misc Config menu" },
      ],
      menuItems: [
        {
          number: 1,
          title: "Tint ramp style (multi-channel lights only)",
          description: "Controls how the tint ramp behaves when adjusting color temperature on lights with multiple LED channels.",
          detail: "0 = smooth ramp (blend channels continuously). 1 = middle tint only. 2 = extreme tints only (full warm or full cool, no blend). 3+ = stepped ramp with that many steps.",
        },
        {
          number: 2,
          title: "Jump Start level",
          description: "A brief higher-power pulse when transitioning from off to very low brightness, to ensure reliable LED startup at low levels.",
          detail: "Range: 1–150 (typically 20–50). Prevents slow or flickery startup on certain LEDs at very low ramp levels. 0 = disabled.",
        },
      ],
      notes: [
        "This menu is hardware-specific — not all lights have it, and not all items appear on every light.",
        "Tint ramp style only applies to lights with multiple LED channels or adjustable tint.",
        "Requires Advanced UI.",
      ],
    },
  },

  // ─── Aux LEDs ─────────────────────────────────────────────────────────────

  {
    id: "aux-led-pattern",
    question: "How do I change the aux LED pattern?",
    tags: ["aux led", "pattern", "7c", "off low high blinking", "button led", "standby"],
    answer: {
      summary: "Press 7C from Off or Lockout mode to cycle through aux LED patterns.",
      requirement: "full",
      steps: [
        { input: "7C", from: "Off", description: "Cycle to next aux LED pattern for off mode: Off → Low → High → Blinking" },
        { input: "7C", from: "Lockout", description: "Cycle aux LED pattern in lockout mode (independent setting)" },
      ],
      notes: [
        "Off mode and lockout mode have completely independent aux LED settings.",
        "Pattern descriptions: Off = no aux illumination, Low = dim standby, High = bright, Blinking = slow pulse.",
        "Default for off mode: High pattern + Voltage color. Default for lockout mode: Low pattern + Red color.",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "aux-led-color",
    question: "How do I change the aux LED color?",
    tags: ["aux led", "color", "7h", "rgb", "red green blue", "button led color", "voltage mode"],
    answer: {
      summary: "Press 7H from Off or Lockout mode to cycle through aux LED colors.",
      requirement: "full",
      steps: [
        { input: "7H", from: "Off", description: "Cycle to next aux LED color for off mode" },
        { input: "7H", from: "Lockout", description: "Cycle aux LED color in lockout mode (independent setting)" },
      ],
      notes: [
        "Color order: Red → Yellow → Green → Cyan → Blue → Purple → White → Disco → Rainbow → Voltage.",
        "Voltage mode: the aux color indicates battery charge level (red = low, orange = medium, green = good, blue/purple = full).",
        "Disco: rapid random color changes. Rainbow: slow continuous cycling through all colors.",
        "Off mode and lockout mode have separate color settings.",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "post-off-voltage",
    question: "Why do the aux LEDs light up briefly when I turn off? What is post-off voltage display?",
    tags: ["post off", "povd", "aux leds", "voltage display", "battery color", "after off"],
    answer: {
      summary: "Many lights with RGB aux LEDs briefly show battery charge by color after entering Off mode. This is the post-off voltage display (POVD).",
      requirement: "any",
      steps: [],
      notes: [
        "The aux LEDs show battery level by color for a few seconds (default 4s), then transition to the configured standby pattern.",
        "Colors: red = low (~3.0V), orange/yellow = medium, green = good (~4.0V), blue/purple = fully charged (~4.2V).",
        "Configure or disable this in the Voltage Config menu (Battery Check → 7H), item 2.",
        "The color can change immediately after high-output use due to battery voltage sag — this is normal and recovers within seconds.",
      ],
    },
  },

  // ─── Special Modes ─────────────────────────────────────────────────────────

  {
    id: "battery-check",
    question: "How do I check my battery level?",
    tags: ["battery", "voltage", "check", "3c", "blinks", "battcheck", "battery level"],
    answer: {
      summary: "Press 3C (three rapid clicks) from Off to enter Battery Check mode. The light blinks out the voltage.",
      requirement: "any",
      steps: [
        { input: "3C", from: "Off", description: "Enter Battery Check mode" },
        { input: "1C", from: "Battery Check", description: "Turn off and return to Off mode" },
      ],
      notes: [
        "Reading the blinks: whole volts first, pause, tenths digit, pause, hundredths digit. Example: 4 blinks — pause — 1 blink — pause — 6 blinks = 4.16V.",
        "A very short/quick blink represents 0 (e.g., 4.00V = 4 blinks, quick blink, quick blink).",
        "Full charge: ~4.20V. Safe operating minimum: ~3.00V. Below ~2.8V, low-voltage protection steps the light down.",
        "In Simple UI, blinks once and turns off. In Advanced UI, repeats until you click.",
      ],
    },
  },

  {
    id: "strobe-modes",
    question: "How do I access strobe and mood modes?",
    tags: ["strobe", "3h", "party strobe", "tactical strobe", "candle", "lightning", "biking", "police"],
    answer: {
      summary: "Press 3H (click-click-hold) from Off to enter strobe modes. The last-used strobe is remembered.",
      requirement: "full",
      steps: [
        { input: "3H", from: "Off", description: "Enter the last-used strobe mode" },
        { input: "2C", from: "Any Strobe", description: "Advance to next strobe mode" },
        { input: "4C", from: "Any Strobe", description: "Go back to previous strobe mode" },
        { input: "1H / 2H", from: "Party / Tactical Strobe", description: "Speed up / slow down" },
        { input: "1H / 2H", from: "Candle / Biking", description: "Increase / decrease brightness" },
        { input: "1C", from: "Any Strobe", description: "Turn off" },
      ],
      notes: [
        "Strobe order: Party → Tactical → Police → Lightning → Candle → Biking → (wraps back to Party).",
        "Lightning mode flashes at random brightness — do not look directly at the light.",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "sunset-timer",
    question: "How do I use the sunset timer to auto-turn-off after a set time?",
    tags: ["sunset", "timer", "5h", "auto off", "candle", "ramp", "sleep timer"],
    answer: {
      summary: "Press 5H while on (ramp or candle mode) to activate a sunset timer. Each press adds 5 minutes.",
      requirement: "full",
      steps: [
        { input: "1C", from: "Off", description: "Step 1: Turn on" },
        { input: "1H / 2H", from: "Ramp (On)", description: "Step 2: Set desired brightness" },
        { input: "5H", from: "Ramp (On)", description: "Step 3: Hold button — light blinks once per second. Release to add 5 minutes." },
      ],
      notes: [
        "In ramp mode, the light gradually dims to its lowest level, then shuts off.",
        "In candle mode, the light maintains brightness until the final minute, then dims and extinguishes.",
        "Press 5H again during the countdown to add another 5 minutes.",
        "Ramping up during the final minutes resets the timer to at least 3 minutes.",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "momentary-mode",
    question: "How do I use momentary mode (on only while holding)?",
    tags: ["momentary", "5c", "hold to activate", "morse code", "light painting"],
    answer: {
      summary: "Press 5C from Off or Ramp to enter momentary mode — the light is on only while the button is held.",
      requirement: "full",
      steps: [
        { input: "5C", from: "Off", description: "Enter momentary mode" },
        { input: "1H", from: "Momentary", description: "Light on while held, off when released" },
        { input: "Disconnect power", from: "Momentary", description: "Only way to exit — unscrew tailcap or battery tube" },
      ],
      notes: [
        "Momentary mode uses the memorized ramp level.",
        "To exit, physically disconnect power by unscrewing the tailcap or battery tube.",
        "Useful for Morse code, light painting, or precise momentary bursts.",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "tactical-mode",
    question: "How do I use tactical mode (three configurable momentary slots)?",
    tags: ["tactical", "6c", "three slots", "momentary", "high low strobe", "tactical mode"],
    answer: {
      summary: "Press 6C from Off to enter tactical mode. Three configurable momentary slots activate with 1H, 2H, 3H.",
      requirement: "full",
      steps: [
        { input: "6C", from: "Off", description: "Enter tactical mode" },
        { input: "1H", from: "Tactical", description: "Activate slot 1 (default: High) while held" },
        { input: "2H", from: "Tactical", description: "Activate slot 2 (default: Low) while held" },
        { input: "3H", from: "Tactical", description: "Activate slot 3 (default: Strobe) while held" },
        { input: "6C", from: "Tactical", description: "Exit tactical mode — return to Off" },
      ],
      notes: [
        "Each slot activates only while holding — release to turn off immediately.",
        "All three slots are independently configurable via 7H from tactical mode.",
        "Slots can be set to any brightness level (1–150) or a strobe mode.",
        "Requires Advanced UI.",
      ],
    },
  },

  {
    id: "beacon-sos",
    question: "How do I use beacon mode or SOS mode?",
    tags: ["beacon", "sos", "blinky", "signal", "distress", "3c", "2c"],
    answer: {
      summary: "Enter blinky modes with 3C from Off, then press 2C to cycle through Battery Check → Temp Check → Beacon → SOS.",
      requirement: "full",
      steps: [
        { input: "3C", from: "Off", description: "Enter Battery Check mode" },
        { input: "2C", from: "Battery Check", description: "Go to Temp Check" },
        { input: "2C", from: "Temp Check", description: "Go to Beacon mode" },
        { input: "2C", from: "Beacon", description: "Go to SOS mode" },
        { input: "1H", from: "Beacon", description: "Configure beacon interval — light blinks once/second, release to set" },
        { input: "1C", from: "Any Blinky", description: "Turn off" },
      ],
      notes: [
        "Beacon: single flash at a configurable slow interval. Brightness follows memorized ramp level.",
        "SOS: blinks · · · — — — · · · (Morse SOS) until turned off or battery is critically low.",
        "Both modes use the memorized ramp level for brightness.",
        "Requires Advanced UI (Advanced UI needed to cycle through modes; Basic Check only in Simple UI).",
      ],
    },
  },

  // ─── Factory Reset / Version ──────────────────────────────────────────────

  {
    id: "factory-reset",
    question: "How do I factory reset my light?",
    tags: ["factory reset", "reset", "13h", "defaults", "simple ui", "restore"],
    answer: {
      summary: "Press 13H from Off (hold until the light ramps to full power) to factory reset.",
      requirement: "any",
      steps: [
        { input: "13H", from: "Off", description: "Hold button — light flickers then brightens. Keep holding until maximum brightness to complete reset. Release early to abort." },
      ],
      notes: [
        "Alternative method: loosen the tailcap, hold the button, retighten, keep holding for ~4 seconds.",
        "After a successful reset, Simple UI is enabled and all settings return to factory defaults.",
        "All configured settings are cleared: memory, aux LED settings, ramp config, thermal limits, etc.",
        "Release before the light reaches full power to abort the reset.",
      ],
    },
  },

  {
    id: "version-check",
    question: "How do I check the firmware version?",
    tags: ["version", "firmware", "15c", "version check", "build date"],
    answer: {
      summary: "Press 15C or more (15+ rapid clicks) from Off to trigger the version check — the light blinks out the model and build date.",
      requirement: "any",
      steps: [
        { input: "15+C", from: "Off", description: "Trigger version check — blinks model number then build date (YYYY-MM-DD)" },
        { input: "1C", from: "Version check", description: "Stop the display and return to Off" },
      ],
      notes: [
        "Format: MODEL.YYYY-MM-DD. Sections are separated by a buzz/pause.",
        "In Advanced UI, the sequence repeats until you press 1C to stop.",
        "Anduril 2 from 2023-12+: MODEL-YYYY-MM-DD. Earlier versions: YYYYMMDDNNNN.",
        "If you see 1969-07-20, that indicates a firmware build error.",
      ],
    },
  },
];
