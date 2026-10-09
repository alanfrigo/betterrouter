export default {
  "id": "kimi-web",
  "priority": 300,
  "alias": "kimi-web",
  "display": {
    "name": "Kimi Web",
    "icon": "auto_awesome",
    "color": "#2563EB",
    "textIcon": "KW",
    "website": "https://www.kimi.ai"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste access_token from www.kimi.ai DevTools → Application → Local Storage. A legacy kimi-auth cookie is also accepted.",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://www.kimi.ai",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "k3",
      "name": "K3",
      "supportsReasoning": true,
      "toolCalling": false
    },
    {
      "id": "k2d6",
      "name": "K2.6",
      "supportsReasoning": true,
      "toolCalling": false
    }
  ],
  "passthroughModels": false,
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
