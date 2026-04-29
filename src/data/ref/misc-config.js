export default {
  id: "misc-config",
  question: "How do I configure tint ramp style and jump start level?",
  tags: ["misc config", "9h", "tint", "jump start", "miscellaneous", "multi-channel", "channel"],
  answer: {
    summary: "From Off in Advanced UI, press 9H to open the Misc Config menu. Available on some lights only.",
    requirement: "full",
    steps: [
      { input: "9H", from: "Off (Advanced UI)", description: "Open Misc Config menu" },
    ],
    menuItems: [
      {
        number: 1,
        title: "Tint ramp style (multi-channel lights only)",
        description: "Controls how the tint ramp behaves when adjusting color temperature on lights with multiple LED channels.",
        detail: "0 = smooth ramp (blend channels continuously). 1 = middle tint only. 2 = extreme tints only (full warm or full cool, no blend). 3+ = stepped ramp with that many steps.",
      },
      {
        number: 2,
        title: "Jump Start level",
        description: "A brief higher-power pulse when transitioning from off to very low brightness, to ensure reliable LED startup at low levels.",
        detail: "Range: 1–150 (typically 20–50). Prevents slow or flickery startup on certain LEDs at very low ramp levels. 0 = disabled.",
      },
    ],
    notes: [
      "This menu is hardware-specific — not all lights have it, and not all items appear on every light.",
      "Tint ramp style only applies to lights with multiple LED channels or adjustable tint.",
      "Requires Advanced UI.",
    ],
  },
};
