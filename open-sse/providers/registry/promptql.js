export default {
  "id": "promptql",
  "alias": "pql",
  "display": {
    "id": "promptql",
    "serviceKinds": [
      "llm"
    ],
    "alias": "pql",
    "name": "PromptQL (Unofficial/Experimental)",
    "icon": "auto_awesome",
    "color": "#5B21B6",
    "textIcon": "PQL",
    "website": "https://prompt.ql.app",
    "subscriptionRisk": true,
    "riskNoticeVariant": "webCookie",
    "authHint": "Paste the Bearer JWT from prompt.ql.app DevTools → Network → graphql → Authorization (token only). Optional projectId + session Cookie for refresh."
  },
  "category": "webCookie",
  "authType": "apikey",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://data.prompt.ql.app/promptql/playground-v2-hge/v1/graphql",
    "format": "openai",
    "auth": {
      "header": "authorization",
      "scheme": "raw"
    }
  },
  "models": [
    {
      "id": "bedrock-claude-fable-5",
      "name": "Claude Fable 5",
      "supportsVision": true
    },
    {
      "id": "bedrock-claude-opus-5",
      "name": "Claude Opus 5",
      "supportsVision": true
    },
    {
      "id": "bedrock-claude-sonnet-4-5",
      "name": "Claude Sonnet 4.5",
      "supportsVision": true
    },
    {
      "id": "deepseek-v4-pro-0813",
      "name": "DeepSeek V4 Pro 0813",
      "supportsVision": true
    },
    {
      "id": "deepseek-v4-flash-0731",
      "name": "DeepSeek V4 Flash 0731",
      "supportsVision": true
    },
    {
      "id": "gemini-3.1-pro-preview",
      "name": "Gemini 3.1 Pro Preview",
      "supportsVision": true
    },
    {
      "id": "gemini-3.7-flash",
      "name": "Gemini 3.7 Flash",
      "supportsVision": true
    },
    {
      "id": "gpt-5.6-sol",
      "name": "GPT-5.6 Sol",
      "supportsVision": true
    },
    {
      "id": "gpt-5.6-terra",
      "name": "GPT-5.6 Terra",
      "supportsVision": true
    },
    {
      "id": "gpt-5.6-luna",
      "name": "GPT-5.6 Luna",
      "supportsVision": true
    },
    {
      "id": "xai-grok-4-6",
      "name": "Grok 4.6",
      "supportsVision": true
    },
    {
      "id": "kimi-k3",
      "name": "Kimi K3",
      "supportsVision": true
    },
    {
      "id": "glm-5.2",
      "name": "GLM 5.2"
    },
    {
      "id": "minimax-m3",
      "name": "Minimax M3"
    }
  ],
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
