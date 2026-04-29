export default {
  id: "ramp-extras-config",
  question: "How do I configure memory type, turbo style, and ramp extras?",
  tags: ["ramp extras", "memory", "turbo style", "10h", "smooth steps", "auto memory", "manual memory", "hybrid"],
  answer: {
    summary: "Press 10H while on to open the Ramp Extras Config menu.",
    requirement: "full",
    steps: [
      { input: "1C", from: "Off", description: "Step 1: Turn on" },
      { input: "10H", from: "Ramp (On)", description: "Step 2: Enter Ramp Extras Config menu" },
    ],
    menuItems: [
      {
        number: 1,
        title: "Manual memory on/off",
        description: "Enables or disables manual memory. When enabled, the light always turns on to the level saved with 10C.",
        detail: "1 click = enable manual memory. 0 clicks (just hold/skip) = check current, or use to disable. After enabling, save a level with 10C while on.",
      },
      {
        number: 2,
        title: "Manual memory timer (minutes)",
        description: "How many minutes before manual memory expires and the light reverts to automatic memory.",
        detail: "0 clicks = manual memory never expires (pure manual). N clicks = timer of N minutes. With a non-zero timer, you get 'hybrid' memory: manual for short gaps, automatic for longer ones.",
      },
      {
        number: 3,
        title: "Ramp-after-moon behavior",
        description: "What happens after you turn on at floor via 1H from Off.",
        detail: "0 clicks = keeps ramping up if you continue holding (default). 1 click = stays at floor level without ramping.",
      },
      {
        number: 4,
        title: "Advanced UI turbo style",
        description: "Controls what 2C does when at or near the ceiling level.",
        detail: "0 = no turbo (2C only goes to ceiling). 1 = Anduril 1 style: 2C always jumps to full power (150). 2 = Anduril 2 style: 2C goes to ceiling, then to turbo if already at ceiling.",
      },
      {
        number: 5,
        title: "Smooth steps",
        description: "Enables smooth animation between steps in stepped ramp mode.",
        detail: "0 = instant step changes. 1 = smooth animated transitions between each step.",
      },
    ],
    notes: [
      "Memory type summary: Automatic (item 1 off) = tracks last-ramped level. Manual (item 1 on, item 2 = 0) = always returns to saved level. Hybrid (item 1 on, item 2 > 0) = uses manual level until timer expires.",
      "Requires Advanced UI.",
    ],
  },
};
