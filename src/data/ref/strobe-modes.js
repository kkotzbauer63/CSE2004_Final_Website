export default {
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
};
