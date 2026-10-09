export default {
  "id": "dit",
  "alias": "dai",
  "display": {
    "name": "DIT.ai",
    "icon": "hub",
    "color": "#0EA5E9",
    "textIcon": "DT",
    "website": "https://dit.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.dit.ai/v1/chat/completions",
    "modelsUrl": "https://api.dit.ai/v1/models",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "gpt-5.4",
      "name": "GPT-5.4 (DIT.ai)",
      "contextLength": 400000,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true
    },
    {
      "id": "claude-sonnet-4-6",
      "name": "Claude Sonnet 4.6 (DIT.ai)",
      "contextLength": 200000,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "max"
      ]
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "authHint": "Use your dit.ai API key in Authorization: Bearer <key>. Fully OpenAI-compatible — a drop-in replacement, just change the base URL to https://api.dit.ai/v1."
};
