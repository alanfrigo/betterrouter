export default {
  "id": "agnes-cn",
  "alias": "agnescn",
  "display": {
    "name": "Agnes AI (China)",
    "icon": "auto_awesome",
    "color": "#047857",
    "textIcon": "AC",
    "website": "https://api.agnes-ai.cn"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.agnes-ai.cn/v1/chat/completions",
    "modelsUrl": "https://api.agnes-ai.cn/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "agnes-2.0-flash",
      "name": "Agnes 2.0 Flash",
      "contextLength": 262144,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "none",
        "low",
        "medium",
        "high",
        "max"
      ],
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "agnes-2.5-flash",
      "name": "Agnes 2.5 Flash",
      "contextLength": 524288,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "none",
        "low",
        "medium",
        "high",
        "max"
      ],
      "supportsVision": true,
      "toolCalling": true,
      "interleavedField": "reasoning_content"
    },
    {
      "id": "agnes-3.0-flash",
      "name": "Agnes 3.0 Flash",
      "contextLength": 524288,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "none",
        "minimal",
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ],
      "supportsVision": true,
      "toolCalling": true,
      "interleavedField": "reasoning_content"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "authHint": "Get API key from the Agnes CN site."
};
