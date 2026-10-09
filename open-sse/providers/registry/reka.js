export default {
  "id": "reka",
  "alias": "reka",
  "display": {
    "name": "Reka",
    "icon": "auto_awesome",
    "color": "#111827",
    "textIcon": "RK",
    "website": "https://docs.reka.ai/chat/overview"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.reka.ai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "reka-flash-3",
      "name": "Reka Flash 3",
      "supportsReasoning": true,
      "alwaysReasons": true,
      "maxOutputTokens": 8192
    },
    {
      "id": "reka-flash",
      "name": "Reka Flash"
    },
    {
      "id": "reka-edge-2603",
      "name": "Reka Edge 2603"
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "authHint": "Use your Reka API key. OmniRoute supports the OpenAI-compatible base URL https://api.reka.ai/v1 and sends both Authorization and X-Api-Key headers for compatibility."
};
