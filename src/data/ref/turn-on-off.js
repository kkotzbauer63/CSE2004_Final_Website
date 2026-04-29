export default {
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
};
