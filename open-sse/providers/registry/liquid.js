export default {
  "id": "liquid",
  "alias": "liquid",
  "display": {
    "name": "Liquid AI",
    "icon": "water_drop",
    "color": "#06B6D4",
    "textIcon": "LQ",
    "website": "https://liquid.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://inference.liquid.ai/v1/chat/completions",
    "modelsUrl": "https://inference.liquid.ai/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "liquid-lfm-40b",
      "name": "Liquid LFM 40B"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true,
  "authHint": "Get API key at liquid.ai"
};
