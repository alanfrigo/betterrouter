export default {
  "id": "chatgpt-web",
  "priority": 300,
  "alias": "chatgpt-web",
  "display": {
    "name": "ChatGPT Web (Clean Room)",
    "icon": "auto_awesome",
    "color": "#10A37F",
    "textIcon": "CG",
    "website": "https://chatgpt.com"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste Playwright-compatible storage-state JSON exported from a logged-in chatgpt.com browser context. Cookie headers and individual token values are not accepted.",
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
      "id": "gpt-5-6",
      "name": "GPT-5.6 Sol — Instant",
      "toolCalling": false,
      "supportsVision": true
    },
    {
      "id": "gpt-5-6-thinking",
      "name": "GPT-5.6 Sol — Thinking",
      "aliases": [
        "gpt-5-6-sol"
      ],
      "toolCalling": false,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ],
      "supportsVision": true
    },
    {
      "id": "gpt-5-6-pro",
      "name": "GPT-5.6 Sol — Pro",
      "toolCalling": false,
      "supportsVision": true,
      "supportsReasoning": true
    },
    {
      "id": "gpt-5.6-luna-free",
      "name": "GPT-5.6 Luna — Free",
      "toolCalling": false,
      "supportsVision": true
    },
    {
      "id": "gpt-5.6-luna-free-thinking",
      "name": "GPT-5.6 Luna — Free Thinking",
      "toolCalling": false,
      "supportsVision": true,
      "supportsReasoning": true
    },
    {
      "id": "gpt-5-5-instant",
      "name": "GPT-5.5 — Instant",
      "toolCalling": false,
      "supportsVision": true
    },
    {
      "id": "gpt-5-5-thinking",
      "name": "GPT-5.5 — Thinking",
      "aliases": [
        "gpt-5-5"
      ],
      "toolCalling": false,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ],
      "supportsVision": true
    },
    {
      "id": "gpt-5-5-pro",
      "name": "GPT-5.5 — Pro",
      "toolCalling": false,
      "supportsVision": true,
      "supportsReasoning": true
    }
  ],
  "passthroughModels": false,
  "toolCalling": "none",
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
