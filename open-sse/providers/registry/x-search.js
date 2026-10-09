import { SEARCH_PROTOCOLS } from '../../config/audioSearchProtocols.js';
export default {
  "id": "x-search",
  "alias": "x_search",
  "display": {
    "id": "x-search",
    "alias": "x_search",
    "name": "X Search (Grok)",
    "icon": "tag",
    "color": "#000000",
    "textIcon": "X",
    "website": "https://docs.x.ai/developers/tools/x-search",
    "authHint": "SuperGrok OAuth (xai-oauth) or xAI API key. This is Grok X Search, not the X Developer MCP.",
    "serviceKinds": [
      "webSearch"
    ]
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "webSearch"
  ],
  "credentialFallback": [
    "xai"
  ],
  "searchConfig": SEARCH_PROTOCOLS["x-search"]
};
