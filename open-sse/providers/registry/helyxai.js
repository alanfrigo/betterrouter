export default {
  "id": "helyxai",
  "alias": "helyxai",
  "display": {
    "name": "Helyx AI",
    "icon": "hub",
    "color": "#7C3AED",
    "textIcon": "HX",
    "website": "https://helyxai.space"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://helyxai.space/v1/chat/completions",
    "modelsUrl": "https://helyxai.space/v1/models",
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
