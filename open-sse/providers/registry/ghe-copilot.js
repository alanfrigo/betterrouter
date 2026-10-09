export default {
  "id": "ghe-copilot",
  "alias": "ghe-copilot",
  "category": "oauth",
  "authType": "oauth",
  "display": {
    "name": "GitHub Enterprise Copilot",
    "icon": "code",
    "color": "#10B981",
    "notice": {
      "text": "Enter your GHE instance URL (e.g., https://ghe.company.com) in provider settings, then authenticate via device flow."
    }
  },
  "models": [
    {
      "id": "claude-fable-5",
      "name": "Claude Fable 5",
      "targetFormat": "claude",
      "contextLength": 1000000,
      "maxOutputTokens": 64000,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ],
      "supportsXHighEffort": true
    },
    {
      "id": "claude-opus-5",
      "name": "Claude Opus 5",
      "targetFormat": "claude",
      "contextLength": 1000000,
      "maxOutputTokens": 64000,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ],
      "supportsXHighEffort": true,
      "unsupportedParams": [
        "temperature",
        "top_p",
        "top_k"
      ]
    },
    {
      "id": "claude-opus-4.8-fast",
      "name": "Claude Opus 4.8 (fast mode)",
      "targetFormat": "claude",
      "contextLength": 1000000,
      "maxOutputTokens": 64000,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ],
      "supportsXHighEffort": true,
      "unsupportedParams": [
        "temperature",
        "top_p",
        "top_k"
      ]
    },
    {
      "id": "claude-opus-4.8",
      "name": "Claude Opus 4.8",
      "targetFormat": "claude",
      "contextLength": 1000000,
      "maxOutputTokens": 64000,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ],
      "supportsXHighEffort": true,
      "unsupportedParams": [
        "temperature",
        "top_p",
        "top_k"
      ]
    },
    {
      "id": "claude-opus-4.7",
      "name": "Claude Opus 4.7",
      "targetFormat": "claude",
      "contextLength": 1000000,
      "maxOutputTokens": 64000,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh",
        "max"
      ],
      "supportsXHighEffort": true
    },
    {
      "id": "claude-sonnet-4.6",
      "name": "Claude Sonnet 4.6",
      "targetFormat": "claude",
      "contextLength": 1000000,
      "maxOutputTokens": 64000
    },
    {
      "id": "claude-opus-4.5",
      "name": "Claude Opus 4.5",
      "targetFormat": "claude",
      "contextLength": 200000,
      "maxOutputTokens": 32000,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high"
      ]
    },
    {
      "id": "claude-sonnet-5",
      "name": "Claude Sonnet 5",
      "targetFormat": "claude",
      "contextLength": 1000000,
      "maxOutputTokens": 64000
    },
    {
      "id": "claude-sonnet-5-5",
      "name": "Claude Sonnet 5.5",
      "targetFormat": "claude",
      "contextLength": 1000000,
      "maxOutputTokens": 128000,
      "supportedThinkingEfforts": [
        "low",
        "medium",
        "high",
        "xhigh"
      ]
    },
    {
      "id": "claude-sonnet-4.5",
      "name": "Claude Sonnet 4.5",
      "targetFormat": "claude",
      "contextLength": 200000,
      "maxOutputTokens": 32000
    },
    {
      "id": "claude-haiku-4.5",
      "name": "Claude Haiku 4.5",
      "targetFormat": "claude",
      "contextLength": 200000,
      "maxOutputTokens": 32000
    },
    {
      "id": "gemini-3.1-pro-preview",
      "name": "Gemini 3.1 Pro",
      "contextLength": 1000000,
      "maxOutputTokens": 64000
    },
    {
      "id": "gemini-3.7-flash",
      "name": "Gemini 3.7 Flash",
      "contextLength": 1000000,
      "maxOutputTokens": 64000
    },
    {
      "id": "gpt-5.6-sol",
      "name": "GPT-5.6 Sol",
      "targetFormat": "openai-responses",
      "maxOutputTokens": 128000
    },
    {
      "id": "gpt-5.6-terra",
      "name": "GPT-5.6 Terra",
      "targetFormat": "openai-responses",
      "maxOutputTokens": 128000
    },
    {
      "id": "gpt-5.6-luna",
      "name": "GPT-5.6 Luna",
      "targetFormat": "openai-responses",
      "maxOutputTokens": 128000
    },
    {
      "id": "gpt-5.5",
      "name": "GPT-5.5",
      "targetFormat": "openai-responses",
      "toolCalling": true,
      "supportsReasoning": true,
      "supportsVision": true,
      "supportsXHighEffort": true,
      "contextLength": 1050000,
      "maxOutputTokens": 128000
    },
    {
      "id": "gpt-5.4",
      "name": "GPT-5.4",
      "targetFormat": "openai-responses",
      "supportsXHighEffort": true,
      "contextLength": 1050000,
      "maxOutputTokens": 128000
    },
    {
      "id": "gpt-5.4-mini",
      "name": "GPT-5.4 mini",
      "targetFormat": "openai-responses",
      "contextLength": 400000,
      "maxOutputTokens": 128000
    },
    {
      "id": "gpt-5.3-codex",
      "name": "GPT-5.3-Codex",
      "targetFormat": "openai-responses",
      "contextLength": 400000,
      "maxOutputTokens": 128000
    },
    {
      "id": "gpt-5-mini",
      "name": "GPT-5 mini",
      "targetFormat": "openai-responses",
      "contextLength": 264000,
      "maxOutputTokens": 64000
    },
    {
      "id": "gpt-4o-2024-11-20",
      "name": "GPT-4o",
      "contextLength": 128000,
      "maxOutputTokens": 16384
    },
    {
      "id": "gpt-4o-mini",
      "name": "GPT-4o mini",
      "contextLength": 128000,
      "maxOutputTokens": 4096
    },
    {
      "id": "gpt-4-0125-preview",
      "name": "GPT 4 Turbo",
      "contextLength": 128000,
      "maxOutputTokens": 4096
    },
    {
      "id": "kimi-k2.7-code",
      "name": "Kimi K2.7 Code",
      "contextLength": 256000,
      "maxOutputTokens": 32000
    },
    {
      "id": "mai-code-1-flash",
      "name": "MAI-Code-1-Flash",
      "targetFormat": "openai-responses",
      "contextLength": 256000,
      "maxOutputTokens": 128000
    },
    {
      "id": "oswe-vscode-prime",
      "name": "Raptor mini",
      "targetFormat": "openai-responses",
      "contextLength": 264000,
      "maxOutputTokens": 64000
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasOAuth": true,
  "authModes": [
    "oauth"
  ],
  "transport": {
    "baseUrl": "https://api.githubcopilot.com/chat/completions",
    "format": "openai",
    "headers": {
      "copilot-integration-id": "copilot-developer-cli",
      "editor-version": "copilot/1.0.91",
      "user-agent": "copilot/1.0.91 (linux) term/unknown",
      "openai-intent": "conversation-agent",
      "x-interaction-type": "conversation-user",
      "copilot-harness-id": "copilot-sdk",
      "x-github-api-version": "2026-08-01",
      "x-client-machine-id": "ae8f21aa-e09b-4098-a701-0e2154a44fec",
      "X-Initiator": "user",
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    "responsesUrl": "https://api.githubcopilot.com/responses",
    "auth": {
      "header": "Authorization",
      "scheme": "bearer",
      "combined": true
    },
    "forceStream": true
  },
  "oauth": {
    "clientIdEnv": "GITHUB_OAUTH_CLIENT_ID",
    "clientIdDefault": "Iv1.b507a08c87ecfe98"
  },
  "hasProviderSpecificData": true
};
