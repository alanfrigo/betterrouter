export default {
  "id": "poe",
  "alias": "poe",
  "display": {
    "name": "Poe",
    "icon": "hub",
    "color": "#F97316",
    "textIcon": "PO",
    "website": "https://creator.poe.com/api-reference"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.poe.com/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "gpt-5.2",
      "name": "GPT-5.2"
    },
    {
      "id": "claude-opus-4.8",
      "name": "Claude Opus 4.8",
      "targetFormat": "claude",
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
      "id": "gemini-3.0-pro",
      "name": "Gemini 3.0 Pro"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "passthroughModels": true,
  "authHint": "Bearer API key for the Poe OpenAI-compatible API."
};
