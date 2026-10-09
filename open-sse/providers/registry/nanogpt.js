export default {
  "id": "nanogpt",
  "alias": "nanogpt",
  "display": {
    "name": "NanoGPT",
    "icon": "chat",
    "color": "#4F46E5",
    "textIcon": "NG",
    "website": "https://nano-gpt.com"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://nano-gpt.com/api/v1/chat/completions",
    "modelsUrl": "https://nano-gpt.com/api/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "chatgpt-4o-latest",
      "name": "chatgpt-4o-latest"
    },
    {
      "id": "claude-3.5-sonnet",
      "name": "claude-3.5-sonnet"
    },
    {
      "id": "gpt-4o-mini",
      "name": "gpt-4o-mini"
    }
  ],
  "serviceKinds": [
    "llm"
  ]
};
