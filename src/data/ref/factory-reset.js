export default {
  id: "factory-reset",
  question: "How do I factory reset my light?",
  tags: ["factory reset", "reset", "13h", "defaults", "simple ui", "restore"],
  answer: {
    summary: "Press 13H from Off (hold until the light ramps to full power) to factory reset.",
    requirement: "any",
    steps: [
      { input: "13H", from: "Off", description: "Hold button — light flickers then brightens. Keep holding until maximum brightness to complete reset. Release early to abort." },
    ],
    notes: [
      "Alternative method: loosen the tailcap, hold the button, retighten, keep holding for ~4 seconds.",
      "After a successful reset, Simple UI is enabled and all settings return to factory defaults.",
      "All configured settings are cleared: memory, aux LED settings, ramp config, thermal limits, etc.",
      "Release before the light reaches full power to abort the reset.",
    ],
  },
};
