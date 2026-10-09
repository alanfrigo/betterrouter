export default {
  "id": "workbuddy",
  "alias": "wb",
  "category": "oauth",
  "authType": "oauth",
  "display": {
    "name": "WorkBuddy",
    "icon": "smart_toy",
    "color": "#1A73E8",
    "textIcon": "WB",
    "website": "https://www.workbuddy.ai",
    "notice": {
      "text": "Tencent WorkBuddy (www.workbuddy.ai). Authorize the CLI device flow in the popup; OmniRoute then polls for the token and attaches the required X-Product: SaaS header. The model roster is served by the authenticated catalogue, so it is discovered live rather than listed here. WorkBuddy only accepts streaming requests, which OmniRoute accumulates back into a JSON response for non-streaming callers."
    }
  },
  "models": [],
  "serviceKinds": [
    "llm"
  ],
  "hasOAuth": true,
  "authModes": [
    "oauth"
  ],
  "transport": {
    "baseUrl": "https://www.workbuddy.ai/v2/chat/completions",
    "format": "openai",
    "headers": {
      "X-Product": "SaaS"
    },
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    },
    "forceStream": true,
    "strictChatHistory": true,
    "bodyStringReplacements": [
      [
        "Codex CLI",
        "the assistant"
      ],
      [
        "codex_cli_rs",
        "assistant"
      ],
      [
        "OpenAI",
        "the provider"
      ],
      [
        "Codex",
        "the assistant"
      ]
    ]
  },
  "oauth": {
    "initiateUrl": "https://www.workbuddy.ai/v2/plugin/auth/state?platform=CLI",
    "pollUrlBase": "https://www.workbuddy.ai/v2/plugin/auth/token"
  },
  "passthroughModels": true
};
