export default {
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
};
