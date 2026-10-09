export default {
  "id": "naga-ac",
  "alias": "naga",
  "display": {
    "name": "Naga.ac",
    "icon": "bolt",
    "color": "#7C3AED",
    "textIcon": "NA",
    "website": "https://naga.ac"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.naga.ac/v1/chat/completions",
    "modelsUrl": "https://api.naga.ac/v1/models",
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
  "passthroughModels": true,
  "authHint": "Get API key at naga.ac — Google/GitHub/Discord signup available."
};
