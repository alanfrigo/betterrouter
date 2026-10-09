export default {
  "id": "zcode",
  "alias": "zc",
  "category": "free",
  "authType": "apikey",
  "display": {
    "name": "ZCode (GLM Coding Plan)",
    "icon": "terminal",
    "color": "#3B82F6",
    "textIcon": "ZC",
    "website": "https://zcode.z.ai",
    "notice": {
      "text": "No API key stored by OmniRoute. The local ZCode app-server uses the existing builtin:zai-coding-plan login."
    },
    "noAuth": true
  },
  "models": [
    {
      "id": "glm-5.3-flash",
      "name": "GLM 5.3 Flash",
      "contextLength": 1000000,
      "maxOutputTokens": 131072,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [],
      "supportsVision": true
    },
    {
      "id": "glm-5.3",
      "name": "GLM 5.3",
      "contextLength": 1000000,
      "maxOutputTokens": 131072,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": []
    },
    {
      "id": "glm-5.3-max",
      "name": "GLM 5.3 Max",
      "contextLength": 1000000,
      "maxOutputTokens": 131072,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": []
    },
    {
      "id": "glm-5.2",
      "name": "GLM 5.2",
      "contextLength": 1000000,
      "maxOutputTokens": 131072,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": []
    },
    {
      "id": "glm-5.1",
      "name": "GLM 5.1",
      "contextLength": 204800,
      "maxOutputTokens": 131072,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": []
    },
    {
      "id": "glm-5",
      "name": "GLM 5",
      "contextLength": 200000,
      "maxOutputTokens": 131072,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": []
    },
    {
      "id": "glm-5-turbo",
      "name": "GLM 5 Turbo",
      "contextLength": 200000,
      "maxOutputTokens": 131072,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": []
    },
    {
      "id": "glm-4.7-flash",
      "name": "GLM 4.7 Flash",
      "contextLength": 200000,
      "maxOutputTokens": 131072,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": []
    },
    {
      "id": "glm-4.7",
      "name": "GLM 4.7",
      "contextLength": 200000,
      "maxOutputTokens": 131072,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": []
    },
    {
      "id": "glm-4.6v",
      "name": "GLM 4.6V (Vision)",
      "contextLength": 128000,
      "maxOutputTokens": 32768,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [],
      "supportsVision": true
    },
    {
      "id": "glm-4.6",
      "name": "GLM 4.6",
      "contextLength": 200000,
      "maxOutputTokens": 32768,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": []
    },
    {
      "id": "glm-4.5v",
      "name": "GLM 4.5V (Vision)",
      "contextLength": 16000,
      "maxOutputTokens": 32768,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [],
      "supportsVision": true
    },
    {
      "id": "glm-4.5",
      "name": "GLM 4.5",
      "contextLength": 128000,
      "maxOutputTokens": 32768,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": []
    },
    {
      "id": "glm-4.5-air",
      "name": "GLM 4.5 Air",
      "contextLength": 128000,
      "maxOutputTokens": 32768,
      "toolCalling": true,
      "supportsReasoning": true,
      "supportedThinkingEfforts": []
    }
  ],
  "serviceKinds": [
    "llm"
  ],
  "noAuth": true,
  "transport": {
    "baseUrl": "zcode://app-server/stdio",
    "format": "openai",
    "headers": {},
    "auth": {
      "header": "none",
      "scheme": "raw"
    }
  }
};
