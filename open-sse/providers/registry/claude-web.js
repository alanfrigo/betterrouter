export default {
  "id": "claude-web",
  "priority": 300,
  "alias": "cw",
  "display": {
    "name": "Claude Web",
    "icon": "auto_awesome",
    "color": "#D97757",
    "textIcon": "CW",
    "website": "https://claude.ai"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste your session cookie from claude.ai",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://claude.ai/api/organizations",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "claude-fable-5-1",
      "name": "Claude Fable 5.1 (web)",
      "toolCalling": false,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ],
      "supportsXHighEffort": true,
      "supportsVision": true,
      "contextLength": 1000000,
      "maxOutputTokens": 128000
    },
    {
      "id": "claude-fable-5",
      "name": "Claude Fable 5 (web)",
      "toolCalling": false
    },
    {
      "id": "claude-opus-5",
      "name": "Claude Opus 5 (web)",
      "toolCalling": false,
      "supportsReasoning": true,
      "supportsVision": true,
      "contextLength": 1000000,
      "maxOutputTokens": 128000
    },
    {
      "id": "claude-opus-4-8",
      "name": "Claude Opus 4.8 (web)",
      "toolCalling": false
    },
    {
      "id": "claude-opus-4-7",
      "name": "Claude Opus 4.7 (web)",
      "toolCalling": false
    },
    {
      "id": "claude-opus-4-6",
      "name": "Claude Opus 4.6 (web)",
      "toolCalling": false
    },
    {
      "id": "claude-sonnet-5",
      "name": "Claude Sonnet 5 (web)",
      "toolCalling": false
    },
    {
      "id": "claude-sonnet-5-5",
      "name": "Claude Sonnet 5.5 (web)",
      "toolCalling": false
    },
    {
      "id": "claude-sonnet-4-6",
      "name": "Claude Sonnet 4.6 (web)",
      "toolCalling": false
    },
    {
      "id": "claude-haiku-4-5-20251001",
      "name": "Claude Haiku 4.5 (web)",
      "toolCalling": false
    }
  ],
  "passthroughModels": false,
  "toolCalling": "none",
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
