export default {
  id: "battery-check",
  question: "How do I check my battery level?",
  tags: ["battery", "voltage", "check", "3c", "blinks", "battcheck", "battery level"],
  answer: {
    summary: "Press 3C (three rapid clicks) from Off to enter Battery Check mode. The light blinks out the voltage.",
    requirement: "any",
    steps: [
      { input: "3C", from: "Off", description: "Enter Battery Check mode" },
      { input: "1C", from: "Battery Check", description: "Turn off and return to Off mode" },
    ],
    notes: [
      "Reading the blinks: whole volts first, pause, tenths digit, pause, hundredths digit. Example: 4 blinks — pause — 1 blink — pause — 6 blinks = 4.16V.",
      "A very short/quick blink represents 0 (e.g., 4.00V = 4 blinks, quick blink, quick blink).",
      "Full charge: ~4.20V. Safe operating minimum: ~3.00V. Below ~2.8V, low-voltage protection steps the light down.",
      "In Simple UI, blinks once and turns off. In Advanced UI, repeats until you click.",
    ],
  },
};
