export default {
  "id": "maxai",
  "priority": 300,
  "alias": "mx",
  "display": {
    "name": "MaxAI",
    "icon": "auto_awesome",
    "color": "#6D28D9",
    "textIcon": "MX",
    "website": "https://www.maxai.co"
  },
  "category": "webCookie",
  "authType": "cookie",
  authHint: "Paste JSON with maxaiAccessToken, maxaiDeviceId, and maxaiUserId captured from a signed-in MaxAI browser session. Include maxaiRefreshToken to renew access. Residential proxy egress may be required.",
  apiKeyOptionalWith: "maxaiAccessToken",
  credentialFields: [
    { name: "maxaiAccessToken", label: "MaxAI access token", required: true, secret: true },
    { name: "maxaiDeviceId", label: "MaxAI device ID", required: true },
    { name: "maxaiUserId", label: "MaxAI user ID", required: true },
    { name: "maxaiRefreshToken", label: "MaxAI refresh token", secret: true },
  ],
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://api.maxai.me",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "gpt-5.6-luna",
      "name": "GPT-5.6 Luna",
      "contextLength": 1050000,
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "claude-haiku-4-5",
      "name": "Claude Haiku 4.5",
      "contextLength": 200000,
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "gemini-3-1-flash-lite",
      "name": "Gemini 3.1 Flash Lite",
      "contextLength": 1000000,
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "grok-4-1-fast-non-reasoning",
      "name": "Grok 4.1 Fast",
      "contextLength": 2000000,
      "toolCalling": true
    },
    {
      "id": "llama-3.3-70b",
      "name": "Llama 3.3 70B",
      "contextLength": 128000,
      "toolCalling": true
    },
    {
      "id": "deepseek-v3.2",
      "name": "DeepSeek V3.2",
      "contextLength": 128000,
      "toolCalling": true
    },
    {
      "id": "gpt-5.6",
      "name": "GPT-5.6",
      "contextLength": 1050000,
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "claude-5-sonnet",
      "name": "Claude 5 Sonnet",
      "contextLength": 1000000,
      "toolCalling": true
    },
    {
      "id": "grok-4-1-fast-reasoning",
      "name": "Grok 4.1 Fast (Reasoning)",
      "contextLength": 2000000,
      "toolCalling": true,
      "supportsReasoning": true
    },
    {
      "id": "gpt-5.6-thinking",
      "name": "GPT-5.6 Thinking",
      "contextLength": 1050000,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true
    },
    {
      "id": "gemini-3.1-pro-preview",
      "name": "Gemini 3.1 Pro Preview",
      "contextLength": 1000000,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true
    },
    {
      "id": "grok-4.5",
      "name": "Grok 4.5",
      "contextLength": 500000,
      "toolCalling": true,
      "supportsReasoning": true
    },
    {
      "id": "deepseek-r1",
      "name": "DeepSeek R1",
      "contextLength": 128000,
      "toolCalling": true,
      "supportsReasoning": true
    }
  ],
  "passthroughModels": false,
  "toolCalling": "emulated"
};
