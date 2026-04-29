export default {
  id: "aux-led-pattern",
  question: "How do I change the aux LED pattern?",
  tags: ["aux led", "pattern", "7c", "off low high blinking", "button led", "standby"],
  answer: {
    summary: "Press 7C from Off or Lockout mode to cycle through aux LED patterns.",
    requirement: "full",
    steps: [
      { input: "7C", from: "Off", description: "Cycle to next aux LED pattern for off mode: Off → Low → High → Blinking" },
      { input: "7C", from: "Lockout", description: "Cycle aux LED pattern in lockout mode (independent setting)" },
    ],
    notes: [
      "Off mode and lockout mode have completely independent aux LED settings.",
      "Pattern descriptions: Off = no aux illumination, Low = dim standby, High = bright, Blinking = slow pulse.",
      "Default for off mode: High pattern + Voltage color. Default for lockout mode: Low pattern + Red color.",
      "Requires Advanced UI.",
    ],
  },
};
