export default {
  id: "thermal-config",
  question: "How do I calibrate the temperature sensor and set a thermal limit?",
  tags: ["thermal", "temperature", "calibration", "limit", "7h", "tempcheck", "overheat", "thermal regulation"],
  answer: {
    summary: "Enter Temp Check mode (3C → 2C from Off), then press 7H to open the Thermal Config menu.",
    requirement: "full",
    steps: [
      { input: "3C", from: "Off", description: "Step 1: Enter Battery Check mode" },
      { input: "2C", from: "Battery Check", description: "Step 2: Advance to Temp Check mode" },
      { input: "7H", from: "Temp Check", description: "Step 3: Open Thermal Config menu" },
    ],
    menuItems: [
      {
        number: 1,
        title: "Current temperature calibration",
        description: "Tell the firmware the actual ambient temperature right now so it can calibrate the sensor.",
        detail: "Click once per degree Celsius. For 21°C ambient, click 21 times. Place the light on a surface for a few minutes at room temperature before calibrating.",
      },
      {
        number: 2,
        title: "Temperature limit",
        description: "Maximum temperature before the firmware steps down brightness to prevent overheating.",
        detail: "Click once per degree above 30°C. Default: 45°C (15 clicks). Maximum: 70°C (40 clicks). Higher limit = allows more heat before throttling. Anduril will gradually reduce output to stay at or below this limit.",
      },
    ],
    notes: [
      "Always calibrate at ambient room temperature for accurate thermal regulation.",
      "The thermal limit protects the LED and driver. Setting it very high can damage the light during sustained high-output use.",
      "Thermal regulation adjusts brightness gradually and imperceptibly, unlike the sudden steps of low-voltage protection.",
      "Requires Advanced UI.",
    ],
  },
};
