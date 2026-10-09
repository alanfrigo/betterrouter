export default {
  "id": "notrack-web",
  "priority": 300,
  "alias": "ntw",
  "display": {
    "name": "NoTrack Web (Free)",
    "icon": "auto_awesome",
    "color": "#0EA5E9",
    "textIcon": "NT",
    "website": "https://notrack.ai"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Log in to notrack.ai, then paste the full Cookie header (DevTools → Network → any /api request → Request Headers → Cookie). It must contain uid, si_usr_id, and si_ses_id.",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://notrack.ai/api/dispatch",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "notrack-c",
      "name": "NoTrack C",
      "aliases": [
        "C",
        "notrack",
        "ntw"
      ],
      "toolCalling": true,
      "supportsReasoning": false
    }
  ],
  "passthroughModels": false,
  "toolCalling": "emulated",
  "riskNoticeVariant": "webCookie"
};
