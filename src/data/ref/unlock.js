export default {
  id: "unlock",
  question: "How do I unlock the light?",
  tags: ["unlock", "lockout", "3c", "4c", "exit lock", "off"],
  answer: {
    summary: "Press 3C from lockout to go to Off, or 4C to turn on directly.",
    requirement: "any",
    steps: [
      { input: "3C", from: "Lockout", description: "Unlock — go to Off mode" },
      { input: "4C", from: "Lockout", description: "Unlock and turn on at memorized level" },
      { input: "4H", from: "Lockout", description: "Unlock and turn on at floor level" },
      { input: "5C", from: "Lockout", description: "Unlock and turn on at ceiling level" },
    ],
    notes: [
      "1H and 2H in lockout produce momentary moon-level light without unlocking.",
    ],
  },
};
