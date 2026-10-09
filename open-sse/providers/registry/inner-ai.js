export default {
  "id": "inner-ai",
  "priority": 300,
  "alias": "in-ai",
  "display": {
    "name": "Inner.ai (Subscription)",
    "icon": "auto_awesome",
    "color": "#1A56DB",
    "textIcon": "IA",
    "website": "https://app.innerai.com"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste your token cookie and email separated by a space: open DevTools → Application → Cookies → .innerai.com, copy the token value, then append a space and your Inner.ai login email. Example: eyJhbG... user@example.com",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://chatapi.innerai.com/chat",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o (via Inner.ai)"
    },
    {
      "id": "gpt-4.1",
      "name": "GPT-4.1 (via Inner.ai)"
    },
    {
      "id": "gpt-4.1-mini",
      "name": "GPT-4.1 Mini (via Inner.ai)"
    },
    {
      "id": "o3",
      "name": "o3 (via Inner.ai)",
      "supportsReasoning": true
    },
    {
      "id": "o4-mini",
      "name": "o4-mini (via Inner.ai)",
      "supportsReasoning": true
    },
    {
      "id": "claude-opus-4-5",
      "name": "Claude Opus 4.5 (via Inner.ai)"
    },
    {
      "id": "claude-sonnet-4-5",
      "name": "Claude Sonnet 4.5 (via Inner.ai)"
    },
    {
      "id": "claude-3-7-sonnet-20250219",
      "name": "Claude 3.7 Sonnet (via Inner.ai)"
    },
    {
      "id": "claude-3-5-sonnet-20241022",
      "name": "Claude 3.5 Sonnet (via Inner.ai)"
    },
    {
      "id": "gemini-2.5-pro",
      "name": "Gemini 2.5 Pro (via Inner.ai)"
    },
    {
      "id": "gemini-2.5-flash",
      "name": "Gemini 2.5 Flash (via Inner.ai)"
    },
    {
      "id": "gemini-2.0-flash",
      "name": "Gemini 2.0 Flash (via Inner.ai)"
    },
    {
      "id": "deepseek-r1",
      "name": "DeepSeek R1 (via Inner.ai)",
      "supportsReasoning": true
    },
    {
      "id": "deepseek-v3",
      "name": "DeepSeek V3 (via Inner.ai)"
    },
    {
      "id": "grok-3",
      "name": "Grok 3 (via Inner.ai)"
    },
    {
      "id": "grok-3-mini",
      "name": "Grok 3 Mini (via Inner.ai)",
      "supportsReasoning": true
    },
    {
      "id": "llama-4-maverick",
      "name": "Llama 4 Maverick (via Inner.ai)"
    },
    {
      "id": "llama-3.3-70b-instruct",
      "name": "Llama 3.3 70B (via Inner.ai)"
    },
    {
      "id": "mistral-large-2411",
      "name": "Mistral Large (via Inner.ai)"
    }
  ],
  "passthroughModels": false,
  "toolCalling": "emulated",
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
