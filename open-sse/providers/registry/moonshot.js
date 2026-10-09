export default {
  "id": "moonshot",
  "alias": "moonshot",
  "category": "apikey",
  "authType": "apikey",
  "display": {
    "name": "Kimi",
    "icon": "rocket_launch",
    "color": "#1E40AF",
    "textIcon": "MS",
    "website": "https://platform.kimi.ai?aff=omniroute",
    "notice": {
      "text": ""
    }
  },
  "models": [
    {
      "id": "kimi-k3",
      "name": "Kimi K3",
      "aliases": [
        "k3",
        "k3-256k"
      ],
      "contextLength": 1048576,
      "maxOutputTokens": 1048576,
      "supportsVision": true,
      "supportsReasoning": true,
      "supportsXHighEffort": false,
      "toolCalling": true,
      "interleavedField": "reasoning_content",
      "unsupportedParams": [
        "temperature",
        "top_p",
        "frequency_penalty",
        "presence_penalty",
        "logprobs",
        "top_logprobs",
        "n"
      ]
    },
    {
      "id": "kimi-k2.7-code",
      "name": "Kimi K2.7 Code",
      "contextLength": 262144,
      "maxOutputTokens": 262144,
      "supportsVision": true,
      "supportsReasoning": true,
      "toolCalling": true,
      "interleavedField": "reasoning_content",
      "unsupportedParams": [
        "temperature",
        "top_p",
        "frequency_penalty",
        "presence_penalty",
        "logprobs",
        "top_logprobs",
        "n"
      ]
    },
    {
      "id": "kimi-k2.7-code-highspeed",
      "name": "Kimi K2.7 Code (High Speed)",
      "contextLength": 262144,
      "maxOutputTokens": 262144,
      "supportsVision": true,
      "supportsReasoning": true,
      "toolCalling": true,
      "interleavedField": "reasoning_content",
      "unsupportedParams": [
        "temperature",
        "top_p",
        "frequency_penalty",
        "presence_penalty",
        "logprobs",
        "top_logprobs",
        "n"
      ]
    },
    {
      "id": "kimi-k2.6",
      "name": "Kimi K2.6",
      "contextLength": 262144,
      "maxOutputTokens": 262144,
      "supportsVision": true,
      "supportsReasoning": true,
      "toolCalling": true,
      "interleavedField": "reasoning_content",
      "unsupportedParams": [
        "temperature",
        "top_p",
        "frequency_penalty",
        "presence_penalty",
        "logprobs",
        "top_logprobs",
        "n"
      ]
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://api.moonshot.ai/v1/chat/completions",
    "format": "openai",
    "headers": {},
    "auth": {
      "header": "Authorization",
      "scheme": "bearer",
      "combined": true
    }
  }
};
