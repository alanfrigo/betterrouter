export default {
  "id": "hcnsec",
  "alias": "hcnsec",
  "display": {
    "name": "Huancheng Public API",
    "icon": "security",
    "color": "#0EA5E9",
    "textIcon": "HC",
    "website": "https://api.hcnsec.cn"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.hcnsec.cn/v1/chat/completions",
    "modelsUrl": "https://api.hcnsec.cn/v1/models",
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
  "authHint": "Get API key at api.hcnsec.cn",
  "transports": [
    {
      "format": "openai",
      "baseUrl": "https://api.hcnsec.cn/v1/chat/completions",
      "headers": {},
      "auth": {
        "combined": true,
        "header": "Authorization",
        "scheme": "bearer"
      }
    },
    {
      "format": "claude",
      "baseUrl": "https://api.hcnsec.cn/v1/messages",
      "headers": {
        "Anthropic-Version": "2023-06-01"
      },
      "auth": {
        "combined": true,
        "header": "x-api-key",
        "scheme": "raw"
      }
    },
    {
      "format": "openai-responses",
      "baseUrl": "https://api.hcnsec.cn/v1/responses",
      "auth": {
        "combined": true,
        "header": "Authorization",
        "scheme": "bearer"
      }
    },
    {
      "format": "gemini",
      "baseUrl": "https://api.hcnsec.cn/v1beta/models",
      "auth": {
        "combined": true,
        "header": "x-goog-api-key",
        "scheme": "raw"
      }
    }
  ]
};
