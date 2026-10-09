export default {
  "id": "nara",
  "alias": "nara",
  "display": {
    "name": "NaraRouter",
    "icon": "hub",
    "color": "#EC4899",
    "textIcon": "NA",
    "website": "https://bynara.id"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://router.bynara.id/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "agnes-2.0-flash",
      "name": "Agnes 2.0 Flash",
      "contextLength": 262144,
      "toolCalling": true,
      "supportsVision": true,
      "supportsReasoning": true
    },
    {
      "id": "agnes-2.5-flash",
      "name": "Agnes 2.5 Flash",
      "contextLength": 524288,
      "toolCalling": true,
      "supportsVision": true,
      "supportsReasoning": true
    },
    {
      "id": "laguna-s-2.1",
      "name": "Laguna S 2.1",
      "contextLength": 262144,
      "toolCalling": true,
      "supportsReasoning": true
    },
    {
      "id": "minimax-m3-free",
      "name": "MiniMax M3 (free)",
      "contextLength": 1000000,
      "supportsVision": true,
      "supportsReasoning": true
    },
    {
      "id": "mistral-large",
      "name": "Mistral Large",
      "contextLength": 252000,
      "toolCalling": true
    },
    {
      "id": "mistral-medium-3-5",
      "name": "Mistral Medium 3.5",
      "contextLength": 256000,
      "toolCalling": true,
      "supportsVision": true
    },
    {
      "id": "qwen3.8-27b",
      "name": "Qwen3.8 27B",
      "toolCalling": true
    },
    {
      "id": "stepfun-3.7-flash",
      "name": "StepFun 3.7 Flash",
      "contextLength": 262144,
      "toolCalling": true
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "passthroughModels": true,
  "authHint": "Create a free NaraRouter account, link your Telegram (required before /v1 answers), then paste the key here as a Bearer token."
};
