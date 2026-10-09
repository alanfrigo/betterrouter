export default {
  "id": "blackbox-web",
  "priority": 300,
  "alias": "bb-web",
  "display": {
    "name": "Blackbox Web (Subscription)",
    "icon": "view_in_ar",
    "color": "#1A1A2E",
    "textIcon": "BW",
    "website": "https://app.blackbox.ai"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste your __Secure-authjs.session-token value or full cookie header from app.blackbox.ai",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://app.blackbox.ai/api/chat",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "gpt-4-turbo",
      "name": "GPT-4 Turbo",
      "toolCalling": false
    },
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "toolCalling": false
    },
    {
      "id": "gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
      "toolCalling": false
    },
    {
      "id": "claude-3-opus",
      "name": "Claude 3 Opus",
      "toolCalling": false
    },
    {
      "id": "claude-3-sonnet",
      "name": "Claude 3 Sonnet",
      "toolCalling": false
    },
    {
      "id": "gemini-pro",
      "name": "Gemini Pro",
      "toolCalling": false
    }
  ],
  "passthroughModels": false,
  "toolCalling": "emulated",
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
