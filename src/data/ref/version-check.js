export default {
  id: "version-check",
  question: "How do I check the firmware version?",
  tags: ["version", "firmware", "15c", "version check", "build date"],
  answer: {
    summary: "Press 15C or more (15+ rapid clicks) from Off to trigger the version check — the light blinks out the model and build date.",
    requirement: "any",
    steps: [
      { input: "15+C", from: "Off", description: "Trigger version check — blinks model number then build date (YYYY-MM-DD)" },
      { input: "1C", from: "Version check", description: "Stop the display and return to Off" },
    ],
    notes: [
      "Format: MODEL.YYYY-MM-DD. Sections are separated by a buzz/pause.",
      "In Advanced UI, the sequence repeats until you press 1C to stop.",
      "Anduril 2 from 2023-12+: MODEL-YYYY-MM-DD. Earlier versions: YYYYMMDDNNNN.",
      "If you see 1969-07-20, that indicates a firmware build error.",
    ],
  },
};
