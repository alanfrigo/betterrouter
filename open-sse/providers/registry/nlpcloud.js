export default {
  "id": "nlpcloud",
  "alias": "nlpc",
  "display": {
    "id": "nlpcloud",
    "serviceKinds": [
      "llm"
    ],
    "alias": "nlpc",
    "name": "NLP Cloud",
    "icon": "psychology",
    "color": "#2196F3",
    "textIcon": "NLPC",
    "website": "https://docs.nlpcloud.com",
    "authHint": "Use your NLP Cloud API key in Authorization: Token <key>. OmniRoute targets the chatbot endpoint on https://api.nlpcloud.io/v1/gpu/<model>/chatbot by default.",
    "apiHint": "NLP Cloud uses a proprietary chatbot API instead of OpenAI chat/completions. OmniRoute adapts OpenAI messages to input/context/history and exposes a local catalog of supported chatbot models.",
    "hasFree": true,
    "freeNote": "Trial credits for new accounts"
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://api.nlpcloud.io/v1/gpu",
    "format": "openai"
  },
  "models": [
    {
      "id": "chatdolphin",
      "name": "ChatDolphin",
      "contextLength": 8192
    },
    {
      "id": "dolphin",
      "name": "Dolphin",
      "contextLength": 16384
    },
    {
      "id": "finetuned-llama-3-70b",
      "name": "Fine-tuned LLaMA 3.3 70B"
    },
    {
      "id": "llama-3-1-405b",
      "name": "LLaMA 3.1 405B"
    },
    {
      "id": "llama-3-8b-instruct",
      "name": "Llama 3 8B"
    }
  ]
};
