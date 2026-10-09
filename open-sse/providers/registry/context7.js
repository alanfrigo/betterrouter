import { SEARCH_PROTOCOLS } from '../../config/audioSearchProtocols.js';
export default {
  "id": "context7",
  "alias": "context7",
  "display": {
    "id": "context7",
    "alias": "context7",
    "name": "Context7 (library docs)",
    "icon": "menu_book",
    "color": "#6B4FBB",
    "textIcon": "C7",
    "website": "https://context7.com",
    "hasFree": true,
    "authHint": "API key optional (ctx7sk-...) — anonymous tier works without a key; a key raises the rate limit",
    "serviceKinds": [
      "webSearch",
      "webFetch"
    ]
  },
  "category": "apikey",
  "authType": "none",
  "serviceKinds": [
    "webSearch", "webFetch"
  ],
  "noAuth": true,
  searchConfig: SEARCH_PROTOCOLS["context7"],
  fetchConfig: {baseUrl:"https://context7.com/api/v1",authType:"none",formats:["markdown"],costPerQuery:0}
};
