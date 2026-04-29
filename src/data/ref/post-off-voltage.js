export default {
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
};
