export default {
  id: "floor-moon",
  question: "How do I go to minimum brightness (floor / moon)?",
  tags: ["floor", "moon", "minimum", "lowest", "1h", "dim", "low"],
  answer: {
    summary: "Hold from off to turn on at the floor (minimum) level.",
    requirement: "any",
    steps: [
      { input: "1H", from: "Off", description: "Turn on at floor (minimum) level" },
    ],
    notes: [
      "The floor level is configurable in the Ramp Config menu (7H while on). Default for smooth ramp: level 1/150. Stepped ramp: 20/150.",
      "After turning on at floor, keep holding to ramp up from there.",
      "You can configure whether 1H from off stays at floor or ramps up: Ramp Extras Config item 3.",
    ],
  },
};
