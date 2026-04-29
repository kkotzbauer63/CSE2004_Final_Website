export default {
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
};
