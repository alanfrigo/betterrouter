export default {
  id: "auto",
  alias: "auto",
  category: "apikey",
  noAuth: true,
  systemOnly: true,
  serviceKinds: ["llm"],
  display: {
    name: "Auto (Zero-Config)",
    icon: "auto_awesome",
    color: "#6366F1",
    textIcon: "AU",
    notice: { text: "Routes automatically across connected providers. No separate credentials required. Use auto or auto/best-coding, auto/best-fast, auto/best-vision, auto/best-free. Existing account cooldown and fallback apply." },
  },
  models: [
    { id: "best-coding", name: "Best Coding" },
    { id: "best-reasoning", name: "Best Reasoning" },
    { id: "best-fast", name: "Best Fast" },
    { id: "best-vision", name: "Best Vision" },
    { id: "best-chat", name: "Best Chat" },
    { id: "best-free", name: "Best Free" },
  ],
};
