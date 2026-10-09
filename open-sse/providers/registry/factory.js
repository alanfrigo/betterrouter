export default {
  "id": "factory",
  "alias": "factory",
  "display": {
    "name": "Factory",
    "icon": "smart_toy",
    "color": "#0F172A",
    "textIcon": "FA",
    "website": "https://factory.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.factory.ai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "auto",
      "name": "Factory Auto (best model)"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "passthroughModels": true,
  "authHint": "Bearer API key for the Factory OpenAI-compatible gateway."
};
