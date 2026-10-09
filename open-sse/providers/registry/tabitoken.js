export default {
  "id": "tabitoken",
  "alias": "tabitoken",
  "display": {
    "name": "TabiToken",
    "icon": "hub",
    "color": "#F97316",
    "textIcon": "TT",
    "website": "https://tabitoken.com"
  },
  "category": "apikey",
  "transport": {
    "format": "claude",
    "baseUrl": "https://tabitoken.com/v1/messages",
    "modelsUrl": "https://tabitoken.com/v1/models",
    "headers": {
      "Anthropic-Version": "2023-06-01"
    },
    "auth": {
      "combined": true,
      "header": "x-api-key",
      "scheme": "raw"
    }
  },
  "models": [
    {
      "id": "claude-opus-5",
      "name": "Claude Opus 5",
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ]
    },
    {
      "id": "claude-opus-5-thinking",
      "name": "Claude Opus 5 (Thinking)"
    },
    {
      "id": "claude-opus-4-8",
      "name": "Claude Opus 4.8"
    },
    {
      "id": "claude-opus-4-8-thinking",
      "name": "Claude Opus 4.8 (Thinking)"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "passthroughModels": true,
  "transports": [
    {
      "format": "claude",
      "baseUrl": "https://tabitoken.com/v1/messages",
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
      "format": "openai",
      "baseUrl": "https://tabitoken.com/v1/chat/completions",
      "auth": {
        "combined": true,
        "header": "Authorization",
        "scheme": "bearer"
      }
    }
  ]
};
