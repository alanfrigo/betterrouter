export default {
  "id": "llmgateway",
  "alias": "llmgateway",
  "display": {
    "name": "LLM Gateway",
    "icon": "router",
    "color": "#6366F1",
    "textIcon": "LG",
    "website": "https://llmgateway.io"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.llmgateway.io/v1/chat/completions",
    "modelsUrl": "https://api.llmgateway.io/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true
};
