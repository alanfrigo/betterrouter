export default {
  "id": "laozhang",
  "alias": "lz",
  "category": "apikey",
  "display": {
    "name": "LaoZhang AI",
    "icon": "hub",
    "color": "#FF1744",
    "textIcon": "LZ",
    "website": "https://api.laozhang.ai"
  },
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.laozhang.ai/v1/chat/completions",
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "gpt-5.4-mini",
      "name": "GPT-5.4 Mini"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "passthroughModels": true
};
