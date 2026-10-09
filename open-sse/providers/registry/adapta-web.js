export default {
  "id": "adapta-web",
  "priority": 300,
  "alias": "adp-web",
  "display": {
    "name": "Adapta.org (Adapta One Web)",
    "icon": "auto_awesome",
    "color": "#6E3AD3",
    "textIcon": "AW",
    "website": "https://agent.adapta.one"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste your __client cookie value from .clerk.agent.adapta.one (DevTools → Application → Cookies)",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://agent.adapta.one/api/chat/stream/v1",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "adapta-one",
      "name": "Adapta ONE (Auto)",
      "toolCalling": false
    },
    {
      "id": "adapta-gpt",
      "name": "GPT-5 (via Adapta)",
      "toolCalling": false
    },
    {
      "id": "adapta-claude",
      "name": "Claude Sonnet 4.6 (via Adapta)",
      "toolCalling": false
    },
    {
      "id": "adapta-gemini",
      "name": "Gemini 2.5 Pro (via Adapta)",
      "toolCalling": false
    },
    {
      "id": "adapta-grok",
      "name": "Grok 4 (via Adapta)",
      "toolCalling": false
    },
    {
      "id": "adapta-deepseek",
      "name": "DeepSeek R2 (via Adapta)",
      "toolCalling": false
    },
    {
      "id": "adapta-llama",
      "name": "Llama 4 (via Adapta)",
      "toolCalling": false
    }
  ],
  "passthroughModels": false,
  "toolCalling": "emulated",
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
