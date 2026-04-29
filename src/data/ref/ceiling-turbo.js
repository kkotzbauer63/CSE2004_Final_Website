export default {
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
};
