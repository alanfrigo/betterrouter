export default {
  "id": "chatgpt-web-codex",
  "priority": 300,
  "alias": "cgpt-codex",
  "display": {
    "name": "ChatGPT Web (Codex)",
    "icon": "terminal",
    "color": "#10A37F",
    "textIcon": "CC",
    "website": "https://chatgpt.com"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste the full ChatGPT Cookie header. OmniRoute verifies it in an isolated headless browser profile.",
  credentialFields: [
    { name: "chromeExecutablePath", label: "Chrome/Chromium executable path (optional if auto-detected)" },
    { name: "browserCdpEndpoint", label: "Local browser CDP URL (loopback only, optional)" },
  ],
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://chatgpt.com",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "luna",
      "name": "ChatGPT Web — Luna",
      "targetFormat": "openai-responses",
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true,
      "supportsXHighEffort": true
    },
    {
      "id": "think",
      "name": "ChatGPT Web — Think",
      "targetFormat": "openai-responses",
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true,
      "supportsXHighEffort": true
    },
    {
      "id": "instant",
      "name": "ChatGPT Web — Instant",
      "targetFormat": "openai-responses",
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true,
      "supportsXHighEffort": true
    },
    {
      "id": "medium",
      "name": "ChatGPT Web — Medium",
      "targetFormat": "openai-responses",
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true,
      "supportsXHighEffort": true
    },
    {
      "id": "high",
      "name": "ChatGPT Web — High",
      "targetFormat": "openai-responses",
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true,
      "supportsXHighEffort": true
    },
    {
      "id": "extra-high",
      "name": "ChatGPT Web — Extra High",
      "targetFormat": "openai-responses",
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true,
      "supportsXHighEffort": true
    },
    {
      "id": "pro",
      "name": "ChatGPT Web — Pro",
      "targetFormat": "openai-responses",
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true,
      "supportsXHighEffort": true
    }
  ],
  "passthroughModels": false,
  "toolCalling": "native",
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
