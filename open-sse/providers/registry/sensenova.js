export default {
  "id": "sensenova",
  "alias": "sensenova",
  "display": {
    "name": "SenseNova",
    "icon": "auto_awesome",
    "color": "#0066FF",
    "textIcon": "SN",
    "website": "https://platform.sensenova.cn",
    "notice": {
      "text": "SenseNova registration appears to require a Chinese (+86) phone number for SMS verification — no international sign-up path is documented, so users outside mainland China may be unable to obtain an API key.",
      "signupUrl": "https://platform.sensenova.cn/console"
    }
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://token.sensenova.cn/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "sensenova-6.7-flash-lite",
      "name": "SenseNova 6.7 Flash-Lite",
      "contextLength": 262144,
      "maxOutputTokens": 65536,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "deepseek-v4-flash",
      "name": "DeepSeek V4 Flash",
      "contextLength": 1048576,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "none",
        "low",
        "medium",
        "high"
      ],
      "supportsXHighEffort": false,
      "interleavedField": "reasoning_content"
    },
    {
      "id": "glm-5.2",
      "name": "GLM 5.2",
      "contextLength": 1048576,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "interleavedField": "reasoning_content"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true,
  "authHint": "Get API key at platform.sensenova.cn"
};
