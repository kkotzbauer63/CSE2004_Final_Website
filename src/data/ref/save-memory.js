export default {
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
};
