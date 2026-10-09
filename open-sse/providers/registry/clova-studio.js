export default {
  "id": "clova-studio",
  "alias": "clova",
  "display": {
    "id": "clova-studio",
    "serviceKinds": [
      "llm"
    ],
    "alias": "clova",
    "name": "Naver CLOVA Studio",
    "icon": "auto_awesome",
    "color": "#03C75A",
    "textIcon": "CS",
    "website": "https://api.ncloud-docs.com/docs/en/ai-naver-clovastudio-summary",
    "apiHint": "OmniRoute routes chat traffic to the native Chat Completions v3 API (/v3/chat-completions/{model}), not the OpenAI-compatibility shim. All three v3 models are served: HCX-007 (reasoning, text only), HCX-005 (vision — accepts both public image URLs and inline base64 images), and HCX-DASH-002 (lightweight, text only). Requests stream upstream and are accumulated into a JSON body when the client asks for a non-streaming response."
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://clovastudio.stream.ntruss.com/v3/chat-completions",
    "format": "openai"
  },
  "models": [
    {
      "id": "HCX-007",
      "name": "HCX-007",
      "contextLength": 128000,
      "maxOutputTokens": 32768,
      "supportsReasoning": true
    },
    {
      "id": "HCX-005",
      "name": "HCX-005",
      "contextLength": 128000,
      "maxOutputTokens": 4096,
      "supportsVision": true
    },
    {
      "id": "HCX-DASH-002",
      "name": "HCX-DASH-002",
      "contextLength": 32000,
      "maxOutputTokens": 4096
    }
  ]
};
