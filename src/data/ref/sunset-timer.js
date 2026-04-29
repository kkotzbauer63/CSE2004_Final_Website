export default {
  id: "sunset-timer",
  question: "How do I use the sunset timer to auto-turn-off after a set time?",
  tags: ["sunset", "timer", "5h", "auto off", "candle", "ramp", "sleep timer"],
  answer: {
    summary: "Press 5H while on (ramp or candle mode) to activate a sunset timer. Each press adds 5 minutes.",
    requirement: "full",
    steps: [
      { input: "1C", from: "Off", description: "Step 1: Turn on" },
      { input: "1H / 2H", from: "Ramp (On)", description: "Step 2: Set desired brightness" },
      { input: "5H", from: "Ramp (On)", description: "Step 3: Hold button — light blinks once per second. Release to add 5 minutes." },
    ],
    notes: [
      "In ramp mode, the light gradually dims to its lowest level, then shuts off.",
      "In candle mode, the light maintains brightness until the final minute, then dims and extinguishes.",
      "Press 5H again during the countdown to add another 5 minutes.",
      "Ramping up during the final minutes resets the timer to at least 3 minutes.",
      "Requires Advanced UI.",
    ],
  },
};
