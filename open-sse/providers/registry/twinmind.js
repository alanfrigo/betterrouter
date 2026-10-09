export default {
  "id": "twinmind",
  "alias": "tm",
  "display": {
    "id": "twinmind",
    "serviceKinds": [
      "llm"
    ],
    "alias": "tm",
    "name": "Twinmind (Unofficial/Experimental)",
    "icon": "auto_awesome",
    "color": "#4F46E5",
    "textIcon": "TM",
    "website": "https://app.twinmind.com",
    "subscriptionRisk": true,
    "riskNoticeVariant": "webCookie",
    "toolCalling": "emulated",
    "authHint": "Paste the stsTokenManager JSON from app.twinmind.com IndexedDB (accessToken + refreshToken). Chat uses accessToken; refreshToken mints a new JWT when it expires."
  },
  "category": "webCookie",
  "authType": "apikey",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://api2.twinmind.com/api/v3",
    "format": "openai"
  },
  "models": [
    {
      "id": "auto",
      "name": "Auto",
      "toolCalling": true
    },
    {
      "id": "gemini-3.1-pro-thinking",
      "name": "Gemini 3.1 Pro Thinking",
      "toolCalling": true
    },
    {
      "id": "gemini-3.8-flash-thinking",
      "name": "Gemini 3.8 Flash Thinking",
      "toolCalling": true
    },
    {
      "id": "gemini-3.7-flash",
      "name": "Gemini 3.7 Flash",
      "toolCalling": true
    },
    {
      "id": "gemini-3.6-flash",
      "name": "Gemini 3.6 Flash",
      "toolCalling": true
    },
    {
      "id": "gpt-5.6-sol-thinking",
      "name": "GPT-5.6 Sol Thinking",
      "toolCalling": true
    },
    {
      "id": "gpt-5.5-thinking",
      "name": "GPT-5.5 Thinking",
      "toolCalling": true
    },
    {
      "id": "gpt-5.6-terra",
      "name": "GPT-5.6 Terra",
      "toolCalling": true
    },
    {
      "id": "gpt-5.6-luna",
      "name": "GPT-5.6 Luna",
      "toolCalling": true
    },
    {
      "id": "claude-opus-5-thinking",
      "name": "Claude Opus 5 Thinking",
      "toolCalling": true
    },
    {
      "id": "claude-opus-4-7-thinking",
      "name": "Claude Opus 4.7 Thinking",
      "toolCalling": true
    },
    {
      "id": "claude-sonnet-5",
      "name": "Claude Sonnet 5",
      "toolCalling": true
    },
    {
      "id": "claude-sonnet-4-6",
      "name": "Claude Sonnet 4.6",
      "toolCalling": true
    }
  ],
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie",
  "toolCalling": "emulated"
};
