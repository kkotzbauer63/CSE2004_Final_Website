export default {
  id: "tactical-config",
  question: "How do I configure tactical mode slots?",
  tags: ["tactical", "config", "7h", "slots", "configure tactical", "slot 1", "slot 2", "slot 3"],
  answer: {
    summary: "Enter tactical mode (6C from Off), then press 7H to configure the three momentary slots.",
    requirement: "full",
    steps: [
      { input: "6C", from: "Off", description: "Step 1: Enter tactical mode" },
      { input: "7H", from: "Tactical", description: "Step 2: Enter Tactical Config menu" },
      { input: "Release at blink 1, 2, or 3", from: "Config menu", description: "Release when it blinks to configure that slot number" },
      { input: "Clicks + holds", from: "Number entry", description: "Enter value: click = +1, hold = +10" },
    ],
    menuItems: [
      {
        number: 1,
        title: "Slot 1 (activated by 1H — High)",
        description: "Brightness level or mode for the first tactical slot.",
        detail: "1–150 = a specific brightness level. 0 = last-used strobe mode. 151 = party strobe. 152 = tactical strobe. 153+ = other strobes in sequence.",
      },
      {
        number: 2,
        title: "Slot 2 (activated by 2H — Low)",
        description: "Brightness level or mode for the second tactical slot.",
        detail: "Same options as Slot 1.",
      },
      {
        number: 3,
        title: "Slot 3 (activated by 3H — Strobe)",
        description: "Mode for the third tactical slot (usually configured as a strobe).",
        detail: "0 = last-used strobe. 151 = party strobe. 152 = tactical strobe. 153+ = other strobes. 1–150 = steady brightness level.",
      },
    ],
    notes: [
      "Each slot activates only while holding — releasing the button turns it off.",
      "Exit tactical mode with 6C.",
      "Aux LED settings in tactical mode are inherited from lockout mode's aux settings.",
      "Requires Advanced UI.",
    ],
  },
};
