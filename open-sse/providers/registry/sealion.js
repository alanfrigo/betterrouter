export default {
  "id": "sealion",
  "alias": "sealion",
  "display": {
    "name": "SEA-LION",
    "icon": "public",
    "color": "#0D9488",
    "textIcon": "SL",
    "website": "https://sea-lion.ai"
  },
  "category": "apikey",
  "transport": {
    "format": "openai",
    "baseUrl": "https://api.sea-lion.ai/v1/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    }
  },
  "models": [
    {
      "id": "aisingapore/Llama-SEA-LION-v3.5-70B-R",
      "name": "Llama SEA-LION v3.5 70B R",
      "contextLength": 131072
    },
    {
      "id": "aisingapore/Llama-SEA-LION-v3-70B-IT",
      "name": "Llama SEA-LION v3 70B IT",
      "contextLength": 131072
    },
    {
      "id": "aisingapore/Gemma-SEA-LION-v4-27B-IT",
      "name": "Gemma SEA-LION v4 27B IT",
      "contextLength": 131072
    },
    {
      "id": "aisingapore/Qwen-SEA-LION-v4.5-27B-IT",
      "name": "Qwen SEA-LION v4.5 27B IT",
      "contextLength": 32768
    },
    {
      "id": "aisingapore/Qwen-SEA-LION-v4-32B-IT",
      "name": "Qwen SEA-LION v4 32B IT",
      "contextLength": 32768
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "hasFree": true,
  "authHint": "Sign in at sea-lion.ai with Google (no card, no region wall), create an API key, then paste it here."
};
