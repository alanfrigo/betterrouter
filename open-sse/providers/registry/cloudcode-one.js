export default {
  "id": "cloudcode-one",
  "alias": "cloudcode-one",
  "display": {
    "name": "CloudCode.ONE",
    "icon": "router",
    "color": "#6366F1",
    "textIcon": "CC",
    "website": "https://cloudcode.one"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.cloudcode.one/v1/chat/completions",
    "modelsUrl": "https://api.cloudcode.one/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "glm-4.7-flash",
      "name": "GLM 4.7 Flash"
    },
    {
      "id": "glm-4.6v-flash",
      "name": "GLM 4.6V Flash"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true
};
