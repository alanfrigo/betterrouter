export default {
  "id": "t3-web",
  "priority": 300,
  "alias": "t3chat",
  "display": {
    "name": "t3.chat (Pro/Free)",
    "icon": "auto_awesome",
    "color": "#7C3AED",
    "textIcon": "T3",
    "website": "https://t3.chat"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Open t3.chat in your browser, log in, then open DevTools → Application → Local Storage → https://t3.chat. Copy the value of 'convex-session-id'. Also open DevTools → Network, copy the Cookie header from any request. Paste both values here. See provider setup docs for a step-by-step guide.",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://t3.chat/api/chat",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "claude-opus-4",
      "name": "Claude Opus 4 (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "claude-sonnet-4",
      "name": "Claude Sonnet 4 (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "claude-haiku-4",
      "name": "Claude Haiku 4 (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "claude-3.7",
      "name": "Claude 3.7 Sonnet (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "gpt-5",
      "name": "GPT-5 (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "gpt-4o",
      "name": "GPT-4o (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "gpt-4.1",
      "name": "GPT-4.1 (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "o3",
      "name": "o3 (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "o4-mini",
      "name": "o4-mini (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "gemini-2.5-pro",
      "name": "Gemini 2.5 Pro (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "gemini-2.5-flash",
      "name": "Gemini 2.5 Flash (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "deepseek-r1",
      "name": "DeepSeek R1 (via t3.chat)",
      "supportsReasoning": true
    },
    {
      "id": "deepseek-v3",
      "name": "DeepSeek V3 (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "grok-3",
      "name": "Grok 3 (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "grok-3-mini",
      "name": "Grok 3 Mini (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "llama-4-maverick",
      "name": "Llama 4 Maverick (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "llama-4-scout",
      "name": "Llama 4 Scout (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "llama-3.3-70b",
      "name": "Llama 3.3 70B (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "devstral",
      "name": "Devstral (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "mistral-large",
      "name": "Mistral Large (via t3.chat)",
      "toolCalling": false
    },
    {
      "id": "qwen3-235b",
      "name": "Qwen3 235B (via t3.chat)",
      "supportsReasoning": true
    },
    {
      "id": "qwen3-32b",
      "name": "Qwen3 32B (via t3.chat)",
      "supportsReasoning": true
    },
    {
      "id": "kimi-k2",
      "name": "Kimi K2 (via t3.chat)",
      "toolCalling": false
    }
  ],
  "passthroughModels": false,
  "toolCalling": "emulated"
};
