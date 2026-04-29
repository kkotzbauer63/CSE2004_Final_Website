export default {
  id: "ramp-config",
  question: "How do I configure the ramp floor, ceiling, and speed?",
  tags: ["ramp config", "floor", "ceiling", "speed", "steps", "7h", "configure ramp", "minimum", "maximum"],
  answer: {
    summary: "Press 7H while on to open the Ramp Config menu. Configures floor, ceiling, and ramp speed (or step count in stepped mode).",
    requirement: "full",
    steps: [
      { input: "1C", from: "Off", description: "Step 1: Turn on" },
      { input: "7H", from: "Ramp (On)", description: "Step 2: Enter Ramp Config menu" },
    ],
    menuItems: [
      {
        number: 1,
        title: "Floor level",
        description: "Sets the minimum brightness. Click N times to set floor to level N out of 150.",
        detail: "Smooth default: 1/150. Stepped default: 20/150. Example: 5 clicks sets floor to level 5. Hold to keep current value.",
      },
      {
        number: 2,
        title: "Ceiling level",
        description: "Sets the maximum brightness. Click N times to set ceiling N steps below maximum.",
        detail: "Default: 120/150. 1 click = highest possible (150), 2 clicks = 149, 30 clicks = 120 (default), etc.",
      },
      {
        number: 3,
        title: "Ramp speed (smooth) / Number of steps (stepped)",
        description: "In smooth mode: controls how fast the ramp travels. In stepped mode: sets the number of discrete levels.",
        detail: "Smooth: 1=full speed (~2.5s end-to-end), 2=half speed (~5s), 3=third (~7.5s), 4=quarter (~10s). Stepped: click count = number of steps (default 7, max 150).",
      },
    ],
    notes: [
      "This configures the ramp for the current channel/mode. Multi-channel lights may have separate ramp settings per channel.",
      "To configure Simple UI's ramp separately, use Off → 10H (in Advanced UI).",
    ],
  },
};
