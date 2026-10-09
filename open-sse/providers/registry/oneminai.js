export default {
  "id": "oneminai",
  "alias": "1min",
  "display": {
    "id": "oneminai",
    "serviceKinds": [
      "llm"
    ],
    "alias": "1min",
    "name": "1min.AI",
    "icon": "hub",
    "color": "#6366F1",
    "textIcon": "1M",
    "website": "https://1min.ai",
    "authHint": "Create an API key at https://docs.1min.ai/docs/api/create-api-key, then paste it here.",
    "apiHint": "1min.ai uses a proprietary chat API (single prompt string + SSE) instead of OpenAI chat/completions. OmniRoute flattens OpenAI messages into a labeled prompt and translates the SSE stream.",
    "passthroughModels": true
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://api.1min.ai/api/chat-with-ai",
    "format": "openai",
    "auth": {
      "header": "api-key",
      "scheme": "raw"
    }
  },
  "models": [
    {
      "id": "gpt-4o-mini",
      "name": "GPT-4o Mini"
    }
  ],
  "passthroughModels": true
};
