export default {
  id: "cursor-api",
  priority: 51,
  alias: "cua",
  uiAlias: "cua",
  display: {
    name: "Cursor API",
    icon: "edit_note",
    color: "#00D4AA",
    website: "https://cursor.com",
    notice: { signupUrl: "https://cursor.com/dashboard/api" },
  },
  category: "apikey",
  authType: "apikey",
  authHint: "Cursor user API key (crsr_…) from cursor.com/dashboard/api. No machine ID required.",
  serviceKinds: ["llm"],
  transport: {
    baseUrl: "https://api2.cursor.sh/agent.v1.AgentService/Run",
    format: "openai",
    authType: "apikey",
  },
  models: [
  {
    "id": "auto",
    "name": "Auto (current, default)"
  },
  {
    "id": "auto-cost",
    "name": "Auto (cost)"
  },
  {
    "id": "auto-balance",
    "name": "Auto (balance)"
  },
  {
    "id": "auto-intelligence",
    "name": "Auto (intelligence)"
  },
  {
    "id": "cursor-grok-4.6-xhigh-fast",
    "name": "Cursor Grok 4.6 Xhigh Fast"
  },
  {
    "id": "cursor-grok-4.6-xhigh",
    "name": "Cursor Grok 4.6 Xhigh"
  },
  {
    "id": "cursor-grok-4.6-high-fast",
    "name": "Cursor Grok 4.6 High Fast"
  },
  {
    "id": "cursor-grok-4.6-high",
    "name": "Cursor Grok 4.6 High"
  },
  {
    "id": "cursor-grok-4.6-medium-fast",
    "name": "Cursor Grok 4.6 Medium Fast"
  },
  {
    "id": "cursor-grok-4.6-medium",
    "name": "Cursor Grok 4.6 Medium"
  },
  {
    "id": "cursor-grok-4.6-low-fast",
    "name": "Cursor Grok 4.6 Low Fast"
  },
  {
    "id": "cursor-grok-4.6-low",
    "name": "Cursor Grok 4.6 Low"
  },
  {
    "id": "composer-2.5-fast",
    "name": "Composer 2.5 Fast"
  },
  {
    "id": "composer-2.5",
    "name": "Composer 2.5"
  },
  {
    "id": "claude-fable-5-1-thinking-max-1m",
    "name": "Claude Fable 5.1 1M Max Thinking",
    "maxOutputTokens": 128000,
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-fable-5-1"
    ],
    "scoresAs": "claude-fable-5-1"
  },
  {
    "id": "claude-fable-5-1-thinking-max",
    "name": "Claude Fable 5.1 Max Thinking",
    "maxOutputTokens": 128000,
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-fable-5-1"
    ],
    "scoresAs": "claude-fable-5-1"
  },
  {
    "id": "claude-fable-5-1-thinking-xhigh-1m",
    "name": "Claude Fable 5.1 1M Xhigh Thinking",
    "maxOutputTokens": 128000,
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-fable-5-1"
    ],
    "scoresAs": "claude-fable-5-1"
  },
  {
    "id": "claude-fable-5-1-thinking-xhigh",
    "name": "Claude Fable 5.1 Xhigh Thinking",
    "maxOutputTokens": 128000,
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-fable-5-1"
    ],
    "scoresAs": "claude-fable-5-1"
  },
  {
    "id": "claude-fable-5-1-thinking-high-1m",
    "name": "Claude Fable 5.1 1M High Thinking",
    "maxOutputTokens": 128000,
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-fable-5-1"
    ],
    "scoresAs": "claude-fable-5-1"
  },
  {
    "id": "claude-fable-5-1-thinking-high",
    "name": "Claude Fable 5.1 High Thinking",
    "maxOutputTokens": 128000,
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-fable-5-1"
    ],
    "scoresAs": "claude-fable-5-1"
  },
  {
    "id": "claude-fable-5-1-thinking-medium-1m",
    "name": "Claude Fable 5.1 1M Medium Thinking",
    "maxOutputTokens": 128000,
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-fable-5-1"
    ],
    "scoresAs": "claude-fable-5-1"
  },
  {
    "id": "claude-fable-5-1-thinking-medium",
    "name": "Claude Fable 5.1 Medium Thinking",
    "maxOutputTokens": 128000,
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-fable-5-1"
    ],
    "scoresAs": "claude-fable-5-1"
  },
  {
    "id": "claude-fable-5-1-thinking-low-1m",
    "name": "Claude Fable 5.1 1M Low Thinking",
    "maxOutputTokens": 128000,
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-fable-5-1"
    ],
    "scoresAs": "claude-fable-5-1"
  },
  {
    "id": "claude-fable-5-1-thinking-low",
    "name": "Claude Fable 5.1 Low Thinking",
    "maxOutputTokens": 128000,
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-fable-5-1"
    ],
    "scoresAs": "claude-fable-5-1"
  },
  {
    "id": "claude-opus-5-5-max-fast",
    "name": "Claude Opus 5.5 Max Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5-5"
    ],
    "scoresAs": "claude-opus-5-5"
  },
  {
    "id": "claude-opus-5-5-max",
    "name": "Claude Opus 5.5 Max",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5-5"
    ],
    "scoresAs": "claude-opus-5-5"
  },
  {
    "id": "claude-opus-5-5-xhigh-fast",
    "name": "Claude Opus 5.5 Xhigh Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5-5"
    ],
    "scoresAs": "claude-opus-5-5"
  },
  {
    "id": "claude-opus-5-5-xhigh",
    "name": "Claude Opus 5.5 Xhigh",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5-5"
    ],
    "scoresAs": "claude-opus-5-5"
  },
  {
    "id": "claude-opus-5-5-high-fast",
    "name": "Claude Opus 5.5 High Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5-5"
    ],
    "scoresAs": "claude-opus-5-5"
  },
  {
    "id": "claude-opus-5-5-high",
    "name": "Claude Opus 5.5 High",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5-5"
    ],
    "scoresAs": "claude-opus-5-5"
  },
  {
    "id": "claude-opus-5-5-medium-fast",
    "name": "Claude Opus 5.5 Medium Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5-5"
    ],
    "scoresAs": "claude-opus-5-5"
  },
  {
    "id": "claude-opus-5-5-medium",
    "name": "Claude Opus 5.5 Medium",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5-5"
    ],
    "scoresAs": "claude-opus-5-5"
  },
  {
    "id": "claude-opus-5-5-low-fast",
    "name": "Claude Opus 5.5 Low Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5-5"
    ],
    "scoresAs": "claude-opus-5-5"
  },
  {
    "id": "claude-opus-5-5-low",
    "name": "Claude Opus 5.5 Low",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5-5"
    ],
    "scoresAs": "claude-opus-5-5"
  },
  {
    "id": "claude-opus-5-thinking-max-fast-1m",
    "name": "Claude Opus 5 1M Max Thinking Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-max-fast",
    "name": "Claude Opus 5 Max Thinking Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-max-1m",
    "name": "Claude Opus 5 1M Max Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-max",
    "name": "Claude Opus 5 Max Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-xhigh-fast-1m",
    "name": "Claude Opus 5 1M Xhigh Thinking Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-xhigh-fast",
    "name": "Claude Opus 5 Xhigh Thinking Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-xhigh-1m",
    "name": "Claude Opus 5 1M Xhigh Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-xhigh",
    "name": "Claude Opus 5 Xhigh Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-high-fast-1m",
    "name": "Claude Opus 5 1M High Thinking Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-high-fast",
    "name": "Claude Opus 5 High Thinking Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-high-1m",
    "name": "Claude Opus 5 1M High Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-high",
    "name": "Claude Opus 5 High Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-high-fast-1m",
    "name": "Claude Opus 5 1M High Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-high-fast",
    "name": "Claude Opus 5 High Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-high-1m",
    "name": "Claude Opus 5 1M High",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-high",
    "name": "Claude Opus 5 High",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-medium-fast-1m",
    "name": "Claude Opus 5 1M Medium Thinking Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-medium-fast",
    "name": "Claude Opus 5 Medium Thinking Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-medium-1m",
    "name": "Claude Opus 5 1M Medium Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-medium",
    "name": "Claude Opus 5 Medium Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-medium-fast-1m",
    "name": "Claude Opus 5 1M Medium Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-medium-fast",
    "name": "Claude Opus 5 Medium Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-medium-1m",
    "name": "Claude Opus 5 1M Medium",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-medium",
    "name": "Claude Opus 5 Medium",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-low-fast-1m",
    "name": "Claude Opus 5 1M Low Thinking Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-low-fast",
    "name": "Claude Opus 5 Low Thinking Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-low-1m",
    "name": "Claude Opus 5 1M Low Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-thinking-low",
    "name": "Claude Opus 5 Low Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-low-fast-1m",
    "name": "Claude Opus 5 1M Low Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-low-fast",
    "name": "Claude Opus 5 Low Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-low-1m",
    "name": "Claude Opus 5 1M Low",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-5-low",
    "name": "Claude Opus 5 Low",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-5"
    ],
    "scoresAs": "claude-opus-5"
  },
  {
    "id": "claude-opus-4-8-thinking-max-fast-1m",
    "name": "Claude Opus 4.8 1M Max Thinking Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-max-fast",
    "name": "Claude Opus 4.8 Max Thinking Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-max-1m",
    "name": "Claude Opus 4.8 1M Max Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-max",
    "name": "Claude Opus 4.8 Max Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-max-fast-1m",
    "name": "Claude Opus 4.8 1M Max Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-max-fast",
    "name": "Claude Opus 4.8 Max Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-max-1m",
    "name": "Claude Opus 4.8 1M Max",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-max",
    "name": "Claude Opus 4.8 Max",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-xhigh-fast-1m",
    "name": "Claude Opus 4.8 1M Xhigh Thinking Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-xhigh-fast",
    "name": "Claude Opus 4.8 Xhigh Thinking Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-xhigh-1m",
    "name": "Claude Opus 4.8 1M Xhigh Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-xhigh",
    "name": "Claude Opus 4.8 Xhigh Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-xhigh-fast-1m",
    "name": "Claude Opus 4.8 1M Xhigh Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-xhigh-fast",
    "name": "Claude Opus 4.8 Xhigh Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-xhigh-1m",
    "name": "Claude Opus 4.8 1M Xhigh",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-xhigh",
    "name": "Claude Opus 4.8 Xhigh",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-high-fast-1m",
    "name": "Claude Opus 4.8 1M High Thinking Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-high-fast",
    "name": "Claude Opus 4.8 High Thinking Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-high-1m",
    "name": "Claude Opus 4.8 1M High Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-high",
    "name": "Claude Opus 4.8 High Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-high-fast-1m",
    "name": "Claude Opus 4.8 1M High Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-high-fast",
    "name": "Claude Opus 4.8 High Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-high-1m",
    "name": "Claude Opus 4.8 1M High",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-high",
    "name": "Claude Opus 4.8 High",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-medium-fast-1m",
    "name": "Claude Opus 4.8 1M Medium Thinking Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-medium-fast",
    "name": "Claude Opus 4.8 Medium Thinking Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-medium-1m",
    "name": "Claude Opus 4.8 1M Medium Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-medium",
    "name": "Claude Opus 4.8 Medium Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-medium-fast-1m",
    "name": "Claude Opus 4.8 1M Medium Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-medium-fast",
    "name": "Claude Opus 4.8 Medium Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-medium-1m",
    "name": "Claude Opus 4.8 1M Medium",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-medium",
    "name": "Claude Opus 4.8 Medium",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-low-fast-1m",
    "name": "Claude Opus 4.8 1M Low Thinking Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-low-fast",
    "name": "Claude Opus 4.8 Low Thinking Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-low-1m",
    "name": "Claude Opus 4.8 1M Low Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-thinking-low",
    "name": "Claude Opus 4.8 Low Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-low-fast-1m",
    "name": "Claude Opus 4.8 1M Low Fast",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-low-fast",
    "name": "Claude Opus 4.8 Low Fast",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-low-1m",
    "name": "Claude Opus 4.8 1M Low",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-opus-4-8-low",
    "name": "Claude Opus 4.8 Low",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-opus-4-8"
    ],
    "scoresAs": "claude-opus-4-8"
  },
  {
    "id": "claude-sonnet-5-thinking-max-1m",
    "name": "Claude Sonnet 5 1M Max Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-thinking-max",
    "name": "Claude Sonnet 5 Max Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-max-1m",
    "name": "Claude Sonnet 5 1M Max",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-max",
    "name": "Claude Sonnet 5 Max",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-thinking-xhigh-1m",
    "name": "Claude Sonnet 5 1M Xhigh Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-thinking-xhigh",
    "name": "Claude Sonnet 5 Xhigh Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-xhigh-1m",
    "name": "Claude Sonnet 5 1M Xhigh",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-xhigh",
    "name": "Claude Sonnet 5 Xhigh",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-thinking-high-1m",
    "name": "Claude Sonnet 5 1M High Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-thinking-high",
    "name": "Claude Sonnet 5 High Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-high-1m",
    "name": "Claude Sonnet 5 1M High",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-high",
    "name": "Claude Sonnet 5 High",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-thinking-medium-1m",
    "name": "Claude Sonnet 5 1M Medium Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-thinking-medium",
    "name": "Claude Sonnet 5 Medium Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-medium-1m",
    "name": "Claude Sonnet 5 1M Medium",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-medium",
    "name": "Claude Sonnet 5 Medium",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-thinking-low-1m",
    "name": "Claude Sonnet 5 1M Low Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-thinking-low",
    "name": "Claude Sonnet 5 Low Thinking",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-low-1m",
    "name": "Claude Sonnet 5 1M Low",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-sonnet-5-low",
    "name": "Claude Sonnet 5 Low",
    "contextLength": 300000,
    "liveCatalogIds": [
      "claude-sonnet-5"
    ],
    "scoresAs": "claude-sonnet-5"
  },
  {
    "id": "claude-4.6-sonnet-max-thinking-1m",
    "name": "Claude Sonnet 4.6 1M Max Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-max-thinking",
    "name": "Claude Sonnet 4.6 Max Thinking",
    "contextLength": 200000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-max-1m",
    "name": "Claude Sonnet 4.6 1M Max",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-max",
    "name": "Claude Sonnet 4.6 Max",
    "contextLength": 200000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-high-thinking-1m",
    "name": "Claude Sonnet 4.6 1M High Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-high-thinking",
    "name": "Claude Sonnet 4.6 High Thinking",
    "contextLength": 200000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-high-1m",
    "name": "Claude Sonnet 4.6 1M High",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-high",
    "name": "Claude Sonnet 4.6 High",
    "contextLength": 200000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-medium-thinking-1m",
    "name": "Claude Sonnet 4.6 1M Medium Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-medium-thinking",
    "name": "Claude Sonnet 4.6 Medium Thinking",
    "contextLength": 200000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-medium-1m",
    "name": "Claude Sonnet 4.6 1M Medium",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-medium",
    "name": "Claude Sonnet 4.6 Medium",
    "contextLength": 200000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-low-thinking-1m",
    "name": "Claude Sonnet 4.6 1M Low Thinking",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-low-thinking",
    "name": "Claude Sonnet 4.6 Low Thinking",
    "contextLength": 200000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-low-1m",
    "name": "Claude Sonnet 4.6 1M Low",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.6-sonnet-low",
    "name": "Claude Sonnet 4.6 Low",
    "contextLength": 200000,
    "liveCatalogIds": [
      "claude-sonnet-4-6"
    ],
    "scoresAs": "claude-sonnet-4-6"
  },
  {
    "id": "claude-4.5-haiku-thinking",
    "name": "Claude Haiku 4.5 Thinking"
  },
  {
    "id": "claude-4.5-haiku",
    "name": "Claude Haiku 4.5"
  },
  {
    "id": "gpt-5.6-sol-max-fast",
    "name": "GPT-5.6 Sol Max Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-max-1m",
    "name": "GPT-5.6 Sol 1M Max",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-max",
    "name": "GPT-5.6 Sol Max",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-xhigh-fast",
    "name": "GPT-5.6 Sol Xhigh Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-xhigh-1m",
    "name": "GPT-5.6 Sol 1M Xhigh",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-xhigh",
    "name": "GPT-5.6 Sol Xhigh",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-high-fast",
    "name": "GPT-5.6 Sol High Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-high-1m",
    "name": "GPT-5.6 Sol 1M High",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-high",
    "name": "GPT-5.6 Sol High",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-medium-fast",
    "name": "GPT-5.6 Sol Medium Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-medium-1m",
    "name": "GPT-5.6 Sol 1M Medium",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-medium",
    "name": "GPT-5.6 Sol Medium",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-low-fast",
    "name": "GPT-5.6 Sol Low Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-low-1m",
    "name": "GPT-5.6 Sol 1M Low",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-low",
    "name": "GPT-5.6 Sol Low",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-none-fast",
    "name": "GPT-5.6 Sol None Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-none-1m",
    "name": "GPT-5.6 Sol 1M None",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-sol-none",
    "name": "GPT-5.6 Sol None",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-sol"
    ]
  },
  {
    "id": "gpt-5.6-terra-max-fast",
    "name": "GPT-5.6 Terra Max Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-max-1m",
    "name": "GPT-5.6 Terra 1M Max",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-max",
    "name": "GPT-5.6 Terra Max",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-xhigh-fast",
    "name": "GPT-5.6 Terra Xhigh Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-xhigh-1m",
    "name": "GPT-5.6 Terra 1M Xhigh",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-xhigh",
    "name": "GPT-5.6 Terra Xhigh",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-high-fast",
    "name": "GPT-5.6 Terra High Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-high-1m",
    "name": "GPT-5.6 Terra 1M High",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-high",
    "name": "GPT-5.6 Terra High",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-medium-fast",
    "name": "GPT-5.6 Terra Medium Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-medium-1m",
    "name": "GPT-5.6 Terra 1M Medium",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-medium",
    "name": "GPT-5.6 Terra Medium",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-low-fast",
    "name": "GPT-5.6 Terra Low Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-low-1m",
    "name": "GPT-5.6 Terra 1M Low",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-low",
    "name": "GPT-5.6 Terra Low",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-none-fast",
    "name": "GPT-5.6 Terra None Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-none-1m",
    "name": "GPT-5.6 Terra 1M None",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-terra-none",
    "name": "GPT-5.6 Terra None",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-terra"
    ]
  },
  {
    "id": "gpt-5.6-luna-max-fast",
    "name": "GPT-5.6 Luna Max Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-max-1m",
    "name": "GPT-5.6 Luna 1M Max",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-max",
    "name": "GPT-5.6 Luna Max",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-xhigh-fast",
    "name": "GPT-5.6 Luna Xhigh Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-xhigh-1m",
    "name": "GPT-5.6 Luna 1M Xhigh",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-xhigh",
    "name": "GPT-5.6 Luna Xhigh",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-high-fast",
    "name": "GPT-5.6 Luna High Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-high-1m",
    "name": "GPT-5.6 Luna 1M High",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-high",
    "name": "GPT-5.6 Luna High",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-medium-fast",
    "name": "GPT-5.6 Luna Medium Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-medium-1m",
    "name": "GPT-5.6 Luna 1M Medium",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-medium",
    "name": "GPT-5.6 Luna Medium",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-low-fast",
    "name": "GPT-5.6 Luna Low Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-low-1m",
    "name": "GPT-5.6 Luna 1M Low",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-low",
    "name": "GPT-5.6 Luna Low",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-none-fast",
    "name": "GPT-5.6 Luna None Fast",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-none-1m",
    "name": "GPT-5.6 Luna 1M None",
    "contextLength": 1000000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gpt-5.6-luna-none",
    "name": "GPT-5.6 Luna None",
    "contextLength": 272000,
    "liveCatalogIds": [
      "gpt-5.6-luna"
    ]
  },
  {
    "id": "gemini-3.7-flash-high",
    "name": "Gemini 3.7 Flash High"
  },
  {
    "id": "gemini-3.7-flash-medium",
    "name": "Gemini 3.7 Flash Medium"
  },
  {
    "id": "gemini-3.7-flash-low",
    "name": "Gemini 3.7 Flash Low"
  },
  {
    "id": "gemini-3.1-pro",
    "name": "Gemini 3.1 Pro"
  },
  {
    "id": "kimi-k3-max",
    "name": "Kimi K3 Max"
  },
  {
    "id": "kimi-k3-high",
    "name": "Kimi K3 High"
  },
  {
    "id": "kimi-k3-low",
    "name": "Kimi K3 Low"
  },
  {
    "id": "kimi-k2.7-code",
    "name": "Kimi K2.7 Code"
  },
  {
    "id": "glm-5.2-max",
    "name": "GLM 5.2 Max"
  },
  {
    "id": "glm-5.2-high",
    "name": "GLM 5.2 High"
  }
],
  passthroughModels: true,
  toolCalling: "native",
};
