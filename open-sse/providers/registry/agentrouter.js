export default {
  "id": "agentrouter",
  "alias": "agentrouter",
  "display": {
    "name": "AgentRouter",
    "icon": "router",
    "color": "#10B981",
    "textIcon": "AR",
    "website": "https://agentrouter.org"
  },
  "category": "apikey",
  "transport": {
    "format": "claude",
    "baseUrl": "https://agentrouter.org/v1/messages",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "x-api-key",
      "scheme": "raw"
    }
  },
  "models": [
    {
      "id": "claude-opus-4-8",
      "name": "Claude Opus 4.8",
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ]
    },
    {
      "id": "claude-opus-5",
      "name": "Claude Opus 5",
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ]
    },
    {
      "id": "gpt-5.6-sol",
      "name": "GPT-5.6 Sol"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true,
  "transports": [
    {
      "format": "claude",
      "baseUrl": "https://agentrouter.org/v1/messages",
      "headers": {},
      "auth": {
        "combined": true,
        "header": "x-api-key",
        "scheme": "raw"
      }
    },
    {
      "format": "openai",
      "baseUrl": "https://agentrouter.org/v1/chat/completions",
      "headers": {
        "User-Agent": "codex_cli_rs/0.159.2",
        "originator": "codex_cli_rs"
      },
      "auth": {
        "combined": true,
        "header": "Authorization",
        "scheme": "bearer"
      }
    },
    {
      "format": "openai-responses",
      "baseUrl": "https://agentrouter.org/v1/responses",
      "headers": {
        "User-Agent": "codex_cli_rs/0.159.2",
        "originator": "codex_cli_rs"
      },
      "auth": {
        "combined": true,
        "header": "Authorization",
        "scheme": "bearer"
      }
    }
  ]
};
