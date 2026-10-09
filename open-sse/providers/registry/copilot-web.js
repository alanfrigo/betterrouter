export default {
  "id": "copilot-web",
  "priority": 300,
  "alias": "copilot",
  "display": {
    "name": "Microsoft Copilot Web",
    "icon": "auto_awesome",
    "color": "#0078D4",
    "textIcon": "CP",
    "website": "https://copilot.microsoft.com"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste the access_token from an authenticated copilot.microsoft.com request (DevTools → Network → Authorization), or export a HAR while logged in",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "wss://copilot.microsoft.com/c/api/chat?api-version=2",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "copilot-pro",
      "name": "Copilot Pro (web)",
      "toolCalling": false
    },
    {
      "id": "gpt-4-turbo",
      "name": "GPT-4 Turbo (via Copilot)",
      "toolCalling": false
    },
    {
      "id": "gpt-4",
      "name": "GPT-4 (via Copilot)",
      "toolCalling": false
    }
  ],
  "passthroughModels": false,
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
