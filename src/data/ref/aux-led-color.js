export default {
  id: "aux-led-color",
  question: "How do I change the aux LED color?",
  tags: ["aux led", "color", "7h", "rgb", "red green blue", "button led color", "voltage mode"],
  answer: {
    summary: "Press 7H from Off or Lockout mode to cycle through aux LED colors.",
    requirement: "full",
    steps: [
      { input: "7H", from: "Off", description: "Cycle to next aux LED color for off mode" },
      { input: "7H", from: "Lockout", description: "Cycle aux LED color in lockout mode (independent setting)" },
    ],
    notes: [
      "Color order: Red → Yellow → Green → Cyan → Blue → Purple → White → Disco → Rainbow → Voltage.",
      "Voltage mode: the aux color indicates battery charge level (red = low, orange = medium, green = good, blue/purple = full).",
      "Disco: rapid random color changes. Rainbow: slow continuous cycling through all colors.",
      "Off mode and lockout mode have separate color settings.",
      "Requires Advanced UI.",
    ],
  },
};
