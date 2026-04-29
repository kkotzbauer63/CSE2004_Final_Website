export default {
  id: "switch-to-simple",
  question: "How do I switch back to Simple UI?",
  tags: ["simple ui", "10c", "basic mode", "restrict", "switch ui"],
  answer: {
    summary: "From Off in Advanced UI, press 10C to switch to Simple UI.",
    requirement: "full",
    steps: [
      { input: "10C", from: "Off (Advanced UI)", description: "Switch to Simple UI" },
    ],
    notes: [
      "Simple UI is enabled by default after a factory reset.",
      "Simple UI limits access to strobe modes and advanced config — good for everyday carry safety.",
    ],
  },
};
