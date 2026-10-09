export default {
  "id": "friendliai",
  "alias": "friendli",
  "display": {
    "name": "FriendliAI",
    "icon": "handshake",
    "color": "#EC4899",
    "textIcon": "FR",
    "website": "https://friendli.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.friendli.ai/serverless/v1/chat/completions",
    "modelsUrl": "https://api.friendli.ai/serverless/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "meta-llama-3.1-70b-instruct",
      "name": "meta-llama-3.1-70b-instruct"
    },
    {
      "id": "meta-llama-3.1-8b-instruct",
      "name": "meta-llama-3.1-8b-instruct"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true
};
