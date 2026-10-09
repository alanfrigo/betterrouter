export default {
  "id": "freetheai",
  "alias": "fta",
  "display": {
    "name": "FreeTheAi",
    "icon": "hub",
    "color": "#22C55E",
    "textIcon": "FTA",
    "website": "https://freetheai.org"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.freetheai.org/v1/chat/completions",
    "modelsUrl": "https://api.freetheai.org/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "fta/zai/glm-5.3",
      "name": "GLM 5.3 (zai)"
    },
    {
      "id": "fta/kimi/k3",
      "name": "Kimi K3"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true,
  "authHint": "Sign up at https://freetheai.org/signup for a free API key. A daily check-in unlocks the free models; linking Discord is optional and only raises the daily limit."
};
