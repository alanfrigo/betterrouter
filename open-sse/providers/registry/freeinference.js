export default {
  "id": "freeinference",
  "alias": "freeinference",
  "display": {
    "name": "FreeInference",
    "icon": "science",
    "color": "#8B5CF6",
    "textIcon": "FI",
    "website": "https://freeinference.org"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://freeinference.org/v1/chat/completions",
    "modelsUrl": "https://freeinference.org/v1/models",
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
