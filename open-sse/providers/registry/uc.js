export default {
  "id": "uc",
  "priority": 300,
  "alias": "ucn",
  "display": {
    "name": "UC (uncensored.com)",
    "icon": "auto_awesome",
    "color": "#111827",
    "textIcon": "UC",
    "website": "https://uncensored.com"
  },
  "category": "webCookie",
  "authType": "cookie",
  authHint: "Paste JSON with ucClientCookie (__client), ucSid (Clerk session ID), ucUid (user ID), and ucCookies (cookie object) from a signed-in uncensored.com session. Fresh short-lived session tokens are minted automatically.",
  apiKeyOptionalWith: "ucClientCookie",
  credentialFields: [
    { name: "ucClientCookie", label: "Clerk __client cookie", required: true, secret: true },
    { name: "ucSid", label: "Clerk session ID", required: true, secret: true },
    { name: "ucUid", label: "UC user ID", required: true },
  ],
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://internal-6.pubyar.com",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "claude-opus-45",
      "name": "Claude Opus 4.5",
      "contextLength": 200000,
      "toolCalling": true,
      "maxOutputTokens": 64000,
      "supportsVision": true
    },
    {
      "id": "claude-opus-46",
      "name": "Claude Opus 4.6",
      "contextLength": 1000000,
      "toolCalling": true,
      "maxOutputTokens": 128000,
      "supportsVision": true
    },
    {
      "id": "claude-opus-46-v2",
      "name": "Claude Opus 4.6 (v2)",
      "contextLength": 1000000,
      "toolCalling": true,
      "maxOutputTokens": 128000,
      "supportsVision": true
    },
    {
      "id": "claude-opus-47",
      "name": "Claude Opus 4.7",
      "contextLength": 1000000,
      "toolCalling": true,
      "maxOutputTokens": 128000,
      "supportsVision": true
    },
    {
      "id": "claude-opus-47-v2",
      "name": "Claude Opus 4.7 (v2)",
      "contextLength": 1000000,
      "toolCalling": true,
      "maxOutputTokens": 128000,
      "supportsVision": true
    },
    {
      "id": "claude-opus-48-uncensored",
      "name": "Claude Opus 4.8 (Uncensored)",
      "contextLength": 1000000,
      "toolCalling": true,
      "maxOutputTokens": 128000,
      "supportsVision": true
    },
    {
      "id": "deepseek-r1",
      "name": "DeepSeek R1",
      "contextLength": 163840,
      "toolCalling": true,
      "maxOutputTokens": 16000,
      "supportsReasoning": true
    },
    {
      "id": "glm-5.1",
      "name": "GLM 5.1",
      "contextLength": 202752,
      "toolCalling": true,
      "maxOutputTokens": 131072
    },
    {
      "id": "gpt-5.5",
      "name": "GPT-5.5",
      "contextLength": 1050000,
      "toolCalling": true,
      "maxOutputTokens": 128000,
      "supportsVision": true
    },
    {
      "id": "gemini-3-flash",
      "name": "Gemini 3 Flash",
      "contextLength": 1048576,
      "toolCalling": true,
      "maxOutputTokens": 65536,
      "supportsVision": true
    },
    {
      "id": "gemini-31-uncensored",
      "name": "Gemini 3.1 (Uncensored)",
      "contextLength": 1048576,
      "toolCalling": true,
      "maxOutputTokens": 65536,
      "supportsVision": true
    },
    {
      "id": "gemini-emotional",
      "name": "Gemini (Emotional)",
      "contextLength": 1048576,
      "toolCalling": true,
      "maxOutputTokens": 65536,
      "supportsVision": true
    },
    {
      "id": "gemini-3-uncensored",
      "name": "Gemini 3 (Uncensored)",
      "contextLength": 1048576,
      "toolCalling": true,
      "maxOutputTokens": 65536,
      "supportsVision": true
    },
    {
      "id": "grok-4",
      "name": "Grok 4",
      "contextLength": 1000000,
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "grok-4-20",
      "name": "Grok 4.20",
      "contextLength": 2000000,
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "grok-4-3",
      "name": "Grok 4.3",
      "contextLength": 1000000,
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "kimi-k2-thinking",
      "name": "Kimi K2 Thinking",
      "contextLength": 262144,
      "toolCalling": true,
      "maxOutputTokens": 262144,
      "supportsReasoning": true
    },
    {
      "id": "kimi-k2.5",
      "name": "Kimi K2.5",
      "contextLength": 262144,
      "toolCalling": true,
      "maxOutputTokens": 262144,
      "supportsVision": true
    },
    {
      "id": "minimax-m2-her",
      "name": "MiniMax M2 (Her)",
      "contextLength": 204800,
      "toolCalling": true,
      "maxOutputTokens": 131072
    }
  ],
  "passthroughModels": false,
  "toolCalling": "emulated"
};
