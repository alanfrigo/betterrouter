export default {
  id: "360ai",
  alias: "360ai",
  category: "apikey",
  display: {
    name: "360 AI",
    icon: "auto_awesome",
    color: "#00B96B",
    textIcon: "360",
    website: "https://ai.360.com/open",
    notice: { apiKeyUrl: "https://ai.360.com/open" },
  },
  transport: {
    format: "openai",
    baseUrl: "https://api.360.cn/v1/chat/completions",
    modelsUrl: "https://api.360.cn/v1/models",
    auth: { combined: true, header: "Authorization", scheme: "bearer" },
  },
  serviceKinds: ["llm"],
  passthroughModels: true,
  models: [{ id: "360gpt-pro", name: "360GPT Pro" }],
};
