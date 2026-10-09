export default {
  "id": "bailian-coding-plan",
  "alias": "bcp",
  "display": {
    "name": "Alibaba Token Plan",
    "icon": "code",
    "color": "#FF6A00",
    "textIcon": "BCP",
    "website": "https://www.alibabacloud.com/help/en/model-studio/token-plan-overview"
  },
  "category": "apikey",
  "transport": {
    "format": "claude",
    "baseUrl": "https://token-plan.ap-southeast-1.maas.aliyuncs.com/apps/anthropic/v1/messages",
    "headers": {
      "Anthropic-Version": "2023-06-01"
    },
    "auth": {
      "combined": true,
      "header": "x-api-key",
      "scheme": "raw"
    }
  },
  "models": [
    {
      "id": "qwen3.8-max-preview",
      "name": "Qwen3.8 Max Preview",
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true,
      "contextLength": 1000000,
      "maxOutputTokens": 65536
    },
    {
      "id": "qwen3.7-max",
      "name": "Qwen3.7 Max",
      "supportsReasoning": true,
      "toolCalling": true,
      "contextLength": 1000000,
      "maxOutputTokens": 65536
    },
    {
      "id": "qwen3.7-plus",
      "name": "Qwen3.7 Plus",
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true,
      "contextLength": 1000000,
      "maxOutputTokens": 65536
    },
    {
      "id": "qwen3.6-flash",
      "name": "Qwen3.6 Flash",
      "supportsReasoning": true,
      "supportsVision": true,
      "toolCalling": true,
      "contextLength": 1000000,
      "maxOutputTokens": 32768
    },
    {
      "id": "glm-5.2",
      "name": "GLM 5.2",
      "supportsReasoning": true,
      "toolCalling": true,
      "contextLength": 1000000,
      "maxOutputTokens": 16384
    },
    {
      "id": "deepseek-v4-pro",
      "name": "DeepSeek V4 Pro",
      "supportsReasoning": true,
      "toolCalling": true,
      "contextLength": 163840,
      "maxOutputTokens": 32768
    }
  ],
  "serviceKinds": [
    "llm"
  ]
};
