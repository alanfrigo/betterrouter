export default {
  "id": "zai-web",
  "priority": 300,
  "alias": "zw",
  "display": {
    "name": "Z.ai Web",
    "icon": "auto_awesome",
    "color": "#2563EB",
    "textIcon": "ZW",
    "website": "https://chat.z.ai"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Copy the \"token\" value from chat.z.ai → DevTools → Application → Local Storage. Do not copy cookies; OmniRoute handles the per-request CAPTCHA through its browser transport.",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://chat.z.ai",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "glm-5.3-flash",
      "name": "GLM-5.3-Flash",
      "toolCalling": false,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "high",
        "max"
      ],
      "supportsVision": true
    },
    {
      "id": "glm-5.3",
      "name": "GLM-5.3",
      "toolCalling": false,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "low",
        "high",
        "max"
      ]
    },
    {
      "id": "glm-5.2",
      "name": "GLM-5.2",
      "toolCalling": false,
      "supportsReasoning": true,
      "supportedThinkingEfforts": [
        "high",
        "max"
      ]
    }
  ],
  "passthroughModels": false,
  "subscriptionRisk": true,
  "riskNoticeVariant": "webCookie"
};
