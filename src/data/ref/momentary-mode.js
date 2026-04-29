export default {
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
};
