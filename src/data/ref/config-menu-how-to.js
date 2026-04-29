export default {
  id: "config-menu-how-to",
  question: "How do config menus work?",
  tags: ["config menu", "how to use", "number entry", "hold skip", "blinking", "configure"],
  answer: {
    summary: "Config menus step through numbered items. Hold to skip; release when it blinks to configure that item.",
    requirement: "full",
    steps: [
      { input: "(Enter any config menu)", from: "Various", description: "Menu starts: the light blinks once, then dims" },
      { input: "Hold", from: "Config item prompt", description: "Skip this item without changing it — wait for the next blink" },
      { input: "Release (when it blinks)", from: "Config item prompt", description: "Enter number-entry mode for this item" },
      { input: "1C = +1, 1H = +10", from: "Number entry", description: "Enter the desired value by clicking and holding" },
      { input: "(wait ~1s)", from: "Number entry", description: "Confirm value and advance to next item" },
    ],
    notes: [
      "The menu always starts from item 1. Hold through any item you don't want to change.",
      "To set a value of 0, just wait without clicking.",
      "Click once per unit: e.g., for 21°C calibration, click 21 times. For value 10, hold once (adds 10) or click 10 times.",
      "After all items are processed, the menu exits and returns to the prior mode.",
    ],
  },
};
