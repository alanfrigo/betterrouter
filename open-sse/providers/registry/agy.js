export default {
  "id": "agy",
  "alias": "agy",
  "category": "oauth",
  "authType": "oauth",
  "display": {
    "name": "Antigravity CLI",
    "icon": "terminal",
    "color": "#F59E0B",
    "textIcon": "AGY",
    "website": "https://antigravity.google",
    "notice": {
      "text": "Import your Antigravity CLI (`agy`) login (paste/upload its token file), auto-detect a local CLI login, or sign in with Google. Shares the Antigravity backend (incl. Claude models)."
    }
  },
  "models": [
    {
      "id": "gemini-3.7-flash-high",
      "name": "Gemini 3.7 Flash (High)",
      "contextLength": 1048576,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "gemini-3.7-flash-medium",
      "name": "Gemini 3.7 Flash (Medium)",
      "contextLength": 1048576,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "gemini-3.7-flash-low",
      "name": "Gemini 3.7 Flash (Low)",
      "contextLength": 1048576,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "gemini-3.7-flash-tiered",
      "name": "Gemini 3.7 Flash (Tiered)",
      "contextLength": 1048576,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "gemini-3.8-flash-high",
      "name": "Gemini 3.8 Flash (High)",
      "contextLength": 1048576,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "gemini-3.8-flash-medium",
      "name": "Gemini 3.8 Flash (Medium)",
      "contextLength": 1048576,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "gemini-3.8-flash-low",
      "name": "Gemini 3.8 Flash (Low)",
      "contextLength": 1048576,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "gemini-pro-agent",
      "name": "Gemini 3.1 Pro (High)",
      "contextLength": 1048576,
      "maxOutputTokens": 65535,
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "gemini-3.1-pro-low",
      "name": "Gemini 3.1 Pro (Low)",
      "contextLength": 1048576,
      "maxOutputTokens": 65535,
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "gemini-3.1-flash-lite",
      "name": "Gemini 3.1 Flash Lite",
      "contextLength": 1048576,
      "maxOutputTokens": 65535,
      "toolCalling": true
    },
    {
      "id": "claude-opus-4-6-thinking",
      "name": "Claude Opus 4.6 (Thinking)",
      "contextLength": 1048576,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "claude-sonnet-4-6",
      "name": "Claude Sonnet 4.6 (Thinking)",
      "contextLength": 1048576,
      "maxOutputTokens": 65536,
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true
    },
    {
      "id": "gpt-oss-120b-medium",
      "name": "GPT-OSS 120B (Medium)",
      "contextLength": 131072,
      "maxOutputTokens": 32768,
      "supportsReasoning": true,
      "toolCalling": true
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
    "baseUrls": [
      "https://daily-cloudcode-pa.googleapis.com",
      "https://cloudcode-pa.googleapis.com"
    ],
    "format": "antigravity",
    "headers": {
      "Content-Type": "application/json",
      "User-Agent": "antigravity/cli/1.1.5 (aidev_client; os_type=darwin; arch=arm64; auth_method=consumer)"
    },
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "oauth": {
    "clientIdEnv": "ANTIGRAVITY_OAUTH_CLIENT_ID",
    "clientIdDefault": "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com",
    "clientSecretEnv": "ANTIGRAVITY_OAUTH_CLIENT_SECRET",
    "clientSecretDefault": "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"
  },
  "passthroughModels": true
};
