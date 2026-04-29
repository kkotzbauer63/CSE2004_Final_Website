export default {
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
};
