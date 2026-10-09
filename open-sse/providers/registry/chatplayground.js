import { CHATPLAYGROUND_FALLBACK_MODELS } from "../../services/chatplaygroundModels.js";

export default {
  "id": "chatplayground",
  "priority": 300,
  "alias": "cpl",
  "display": {
    "name": "ChatPlayground",
    "icon": "auto_awesome",
    "color": "#7C3AED",
    "textIcon": "CP",
    "website": "https://web.chatplayground.ai"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste your Clerk session token or full cookie export containing __client and __session from web.chatplayground.ai. OmniRoute auto-mints fresh short-lived Clerk session JWTs.",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://app.chatplayground.ai/api/chat",
    "format": "openai",
    "authType": "cookie"
  },
  models: CHATPLAYGROUND_FALLBACK_MODELS,
  passthroughModels: true,
  "toolCalling": "emulated",
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
