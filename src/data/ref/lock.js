export default {
  id: "lock",
  question: "How do I lock the light?",
  tags: ["lock", "lockout", "4c", "safety", "carry", "pocket"],
  answer: {
    summary: "Press 4C (four rapid clicks) from Off or while on to enter lockout mode.",
    requirement: "any",
    steps: [
      { input: "4C", from: "Off", description: "Enter lockout mode" },
      { input: "4C", from: "Ramp (On)", description: "Enter lockout mode from on state" },
    ],
    notes: [
      "In lockout mode, the light cannot be accidentally turned on to full brightness.",
      "Only brief moon-level momentary light is available in lockout (1H or 2H).",
      "The aux LEDs may still be active in lockout mode, with settings independent from off-mode aux settings.",
    ],
  },
};
