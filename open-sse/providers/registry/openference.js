export default {
  "id": "openference",
  "alias": "of",
  aliases: ["openference-api"],
  "category": "oauth",
  "authType": "oauth",
  "display": {
    "name": "Openference",
    "icon": "openference",
    "color": "#6366F1",
    "textIcon": "OF",
    "website": "https://openference.com",
    "notice": {
      "text": "Sign in with your Openference account to route requests through api.openference.com. Includes free-tier access to Qwen3.8 27b and Llama 3.2 3B — see openference.com/pricing for current plan terms."
    }
  },
  "models": [
    {
      "id": "GLM-5.2",
      "name": "GLM 5.2",
      "contextLength": 850000
    },
    {
      "id": "Qwen3.8 27b",
      "name": "Qwen3.8 27B",
      "contextLength": 262144
    },
    {
      "id": "Llama 3.2 3B",
      "name": "Llama 3.2 3B",
      "contextLength": 131072
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasOAuth": true,
  "authModes": [
    "oauth"
  ],
  "transport": {
    "baseUrl": "https://api.openference.com/v1/chat/completions",
    "format": "openai",
    "headers": {},
    "responsesUrl": "https://api.openference.com/v1/responses",
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "oauth": {
    "clientIdDefault": "omniroute",
    "tokenUrl": "https://openference.com/oauth/token"
  },
  "passthroughModels": true,
  "hasProviderSpecificData": true
};
