export default {
  id: "simple-ui-config",
  question: "How do I configure Simple UI settings (floor, ceiling, steps)?",
  tags: ["simple ui config", "10h", "configure simple ui", "floor", "ceiling", "steps", "simple"],
  answer: {
    summary: "From Off in Advanced UI, press 10H to open the Simple UI Config menu.",
    requirement: "full",
    steps: [
      { input: "10H", from: "Off (Advanced UI)", description: "Open Simple UI Config menu" },
    ],
    menuItems: [
      {
        number: 1,
        title: "Floor level",
        description: "Minimum brightness in Simple UI.",
        detail: "Default: 20/150. Click N times for level N.",
      },
      {
        number: 2,
        title: "Ceiling level",
        description: "Maximum brightness in Simple UI.",
        detail: "Default: 120/150. 1 click = highest possible, 2 clicks = second-highest, etc.",
      },
      {
        number: 3,
        title: "Number of steps",
        description: "How many discrete brightness levels appear in Simple UI's stepped ramp.",
        detail: "Default: 5 steps.",
      },
      {
        number: 4,
        title: "Turbo style",
        description: "Whether 2C in Simple UI jumps to ceiling or full turbo.",
        detail: "Default: 0 (ceiling only, no turbo in Simple UI).",
      },
    ],
    notes: [
      "These settings only affect Simple UI. Advanced UI has its own independent ramp config.",
      "You must be in Advanced UI to access this menu — Simple UI cannot configure itself.",
    ],
  },
};
