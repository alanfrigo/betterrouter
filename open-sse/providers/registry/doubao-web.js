export default {
  "id": "doubao-web",
  "priority": 300,
  "alias": "db",
  "display": {
    "name": "Dola Web (ByteDance)",
    "icon": "auto_awesome",
    "color": "#3B82F6",
    "textIcon": "DA",
    "website": "https://www.dola.com"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste the full Cookie header from www.dola.com. It should include sessionid, ttwid, and s_v_web_id. If s_v_web_id is unavailable, fp=verify_... from a chat/completion request URL can be used as a fallback.",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://www.dola.com/chat/completion",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "dola-speed",
      "name": "Dola Speed",
      "toolCalling": false
    },
    {
      "id": "dola-pro",
      "name": "Dola Pro",
      "toolCalling": false
    }
  ],
  "passthroughModels": false,
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
