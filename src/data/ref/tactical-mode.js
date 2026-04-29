export default {
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
};
