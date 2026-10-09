export default {
  "id": "gemini-web",
  "priority": 300,
  "alias": "gweb",
  "display": {
    "name": "Gemini Web (Free)",
    "icon": "auto_awesome",
    "color": "#4285F4",
    "textIcon": "GWeb",
    "website": "https://gemini.google.com"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste the full cookie header, the __Secure-1PSID value, or the JSON export containing cookies from gemini.google.com. Include __Secure-1PSIDTS and __Secure-1PSIDCC when available.",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://gemini.google.com/app",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "gemini-3.1-pro",
      "name": "Gemini 3.1 Pro",
      "toolCalling": false,
      "supportsReasoning": false
    },
    {
      "id": "gemini-3.7-flash",
      "name": "Gemini 3.7 Flash",
      "toolCalling": false,
      "supportsReasoning": false
    },
    {
      "id": "gemini-3.1-flash-lite",
      "name": "Gemini 3.1 Flash-Lite",
      "toolCalling": false,
      "supportsReasoning": false
    }
  ],
  "passthroughModels": false,
  "toolCalling": "emulated",
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
