export default {
  id: "beacon-sos",
  question: "How do I use beacon mode or SOS mode?",
  tags: ["beacon", "sos", "blinky", "signal", "distress", "3c", "2c"],
  answer: {
    summary: "Enter blinky modes with 3C from Off, then press 2C to cycle through Battery Check → Temp Check → Beacon → SOS.",
    requirement: "full",
    steps: [
      { input: "3C", from: "Off", description: "Enter Battery Check mode" },
      { input: "2C", from: "Battery Check", description: "Go to Temp Check" },
      { input: "2C", from: "Temp Check", description: "Go to Beacon mode" },
      { input: "2C", from: "Beacon", description: "Go to SOS mode" },
      { input: "1H", from: "Beacon", description: "Configure beacon interval — light blinks once/second, release to set" },
      { input: "1C", from: "Any Blinky", description: "Turn off" },
    ],
    notes: [
      "Beacon: single flash at a configurable slow interval. Brightness follows memorized ramp level.",
      "SOS: blinks · · · — — — · · · (Morse SOS) until turned off or battery is critically low.",
      "Both modes use the memorized ramp level for brightness.",
      "Requires Advanced UI (Advanced UI needed to cycle through modes; Basic Check only in Simple UI).",
    ],
  },
};
