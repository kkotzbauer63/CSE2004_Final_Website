export default {
  id: "autolock-config",
  question: "How do I set up auto-lock (automatic lockout after a timeout)?",
  tags: ["auto lock", "autolock", "lockout", "timeout", "10h", "automatic lock", "lock timeout"],
  answer: {
    summary: "From lockout mode, press 10H to set the auto-lock timeout in minutes.",
    requirement: "full",
    steps: [
      { input: "4C", from: "Off", description: "Step 1: Enter lockout mode" },
      { input: "10H", from: "Lockout", description: "Step 2: Enter Auto-Lock Config menu" },
      { input: "N clicks", from: "Config menu", description: "Click N times to set auto-lock timeout to N minutes (0 = disabled)" },
    ],
    menuItems: [
      {
        number: 1,
        title: "Auto-lock timeout in minutes",
        description: "How many minutes after the light enters Off mode before it automatically locks.",
        detail: "0 clicks = auto-lock disabled (default). N clicks = locks automatically after N minutes of being off.",
      },
    ],
    notes: [
      "Auto-lock is useful for EDC (everyday carry) to prevent accidental activation in a pocket or bag.",
      "Requires Advanced UI.",
    ],
  },
};
