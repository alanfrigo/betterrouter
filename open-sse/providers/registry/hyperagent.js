export default {
  "id": "hyperagent",
  "alias": "ha",
  "display": {
    "id": "hyperagent",
    "serviceKinds": [
      "llm"
    ],
    "alias": "ha",
    "name": "HyperAgent (Unofficial/Experimental)",
    "icon": "auto_awesome",
    "color": "#6C5CE7",
    "textIcon": "HA",
    "website": "https://hyperagent.com",
    "subscriptionRisk": true,
    "riskNoticeVariant": "webCookie",
    "authHint": "Paste the full Cookie header from hyperagent.com (DevTools → Network → any request → Request Headers → Cookie). Session cookies power chat + billing usage."
  },
  "category": "webCookie",
  "authType": "apikey",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://hyperagent.com/api/threads",
    "format": "openai",
    "auth": {
      "header": "cookie",
      "scheme": "raw"
    }
  },
  "models": [
    {
      "id": "fable-latest",
      "name": "Fable 5",
      "contextLength": 1000000
    },
    {
      "id": "claude-fable-5",
      "name": "Claude Fable 5",
      "contextLength": 1000000
    },
    {
      "id": "opus-latest",
      "name": "Claude Opus Latest",
      "contextLength": 1000000
    },
    {
      "id": "claude-opus-4-8",
      "name": "Claude Opus 4.8",
      "contextLength": 1000000
    },
    {
      "id": "sonnet-latest",
      "name": "Claude Sonnet Latest",
      "contextLength": 1000000
    },
    {
      "id": "claude-sonnet-5",
      "name": "Claude Sonnet 5",
      "contextLength": 1000000
    }
  ],
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
