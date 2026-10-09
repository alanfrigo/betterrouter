export default {
  "id": "copilot-m365-web",
  "priority": 300,
  "alias": "m365copilot",
  "display": {
    "name": "Microsoft 365 Copilot (BizChat)",
    "icon": "business_center",
    "color": "#0078D4",
    "textIcon": "M365",
    "website": "https://m365.cloud.microsoft/chat"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Sign in at m365.cloud.microsoft/chat, then open DevTools → Network → filter 'WS' → click the Chathub WebSocket connection. Copy both the access_token query parameter AND the account-specific Chathub path segment from its request URL (wss://…/Chathub/<path>?…&access_token=…). It is NOT an Authorization: Bearer header on an XHR/Fetch request. The token is short-lived; this is an unofficial integration. Optional: store a refresh_token in providerSpecificData.refreshToken (any Microsoft device-code/refresh flow for the substrate.office.com/sydney scopes) and OmniRoute pre-flight-refreshes the access token itself — otherwise re-capture after every ~75 min expiry.",
  credentialFields: [
    { name: "chathubPath", label: "Chathub account path (or paste full WebSocket URL as credential)" },
    { name: "refreshToken", label: "Microsoft refresh token (optional)", secret: true },
  ],
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "wss://substrate.office.com/m365Copilot/Chathub",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "copilot-m365",
      "name": "Microsoft 365 Copilot (BizChat)",
      "toolCalling": false
    },
    {
      "id": "copilot-m365-claude-opus",
      "name": "Microsoft 365 Copilot — Claude Opus",
      "toolCalling": false
    },
    {
      "id": "copilot-m365-gpt-5-6-reasoning",
      "name": "Microsoft 365 Copilot — GPT 5.6 Reasoning",
      "toolCalling": false
    },
    {
      "id": "copilot-m365-gpt-5-5-chat",
      "name": "Microsoft 365 Copilot — GPT 5.5 Chat",
      "toolCalling": false
    }
  ],
  "passthroughModels": false,
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
