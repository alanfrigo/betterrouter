export default {
  "id": "yuanbao-web",
  "priority": 300,
  "alias": "ybw",
  "display": {
    "name": "Tencent Yuanbao (Free)",
    "icon": "auto_awesome",
    "color": "#0052D9",
    "textIcon": "YB",
    "website": "https://yuanbao.tencent.com"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Log in to yuanbao.tencent.com, then paste the full Cookie header (DevTools → Network → any /api request → Request Headers → Cookie). It must contain hy_user and hy_token.",
  "serviceKinds": [
    "llm"
  ],
  "transport": {
    "baseUrl": "https://yuanbao.tencent.com/api/chat",
    "format": "openai",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "deepseek-v3",
      "name": "DeepSeek V3 (via Yuanbao)",
      "toolCalling": false
    },
    {
      "id": "deepseek-r1",
      "name": "DeepSeek R1 (via Yuanbao)",
      "supportsReasoning": true
    },
    {
      "id": "hunyuan",
      "name": "Hunyuan (via Yuanbao)",
      "toolCalling": false
    },
    {
      "id": "hunyuan-t1",
      "name": "Hunyuan T1 (via Yuanbao)",
      "supportsReasoning": true
    },
    {
      "id": "deepseek-v3-search",
      "name": "DeepSeek V3 + Web Search (via Yuanbao)",
      "toolCalling": false
    },
    {
      "id": "deepseek-r1-search",
      "name": "DeepSeek R1 + Web Search (via Yuanbao)",
      "supportsReasoning": true
    },
    {
      "id": "hunyuan-search",
      "name": "Hunyuan + Web Search (via Yuanbao)",
      "toolCalling": false
    },
    {
      "id": "hunyuan-t1-search",
      "name": "Hunyuan T1 + Web Search (via Yuanbao)",
      "supportsReasoning": true
    }
  ],
  "passthroughModels": false,
  "riskNoticeVariant": "webCookie"
};
