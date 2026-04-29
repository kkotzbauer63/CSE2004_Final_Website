export default {
  id: "smooth-vs-stepped",
  question: "How do I switch between smooth and stepped ramping?",
  tags: ["smooth", "stepped", "ramp style", "3c", "ramp type", "switch"],
  answer: {
    summary: "Press 3C while on to toggle between smooth ramp and stepped ramp.",
    requirement: "full",
    steps: [
      { input: "3C", from: "Ramp (On)", description: "Toggle between smooth ramp and stepped ramp" },
    ],
    notes: [
      "Smooth ramp: continuously adjustable from floor to ceiling with no discrete steps.",
      "Stepped ramp: discrete brightness levels (default 7 steps, max 150). Configure step count in Ramp Config.",
      "On multi-channel lights, 3C may switch channel modes instead — use 6C to change ramp style in that case.",
      "Requires Advanced UI.",
    ],
  },
};
