import { SEARCH_PROTOCOLS } from '../../config/audioSearchProtocols.js';
export default {
  "id": "firecrawl",
  "alias": "fc",
  "display": {
    "id": "firecrawl",
    "alias": "fc",
    "name": "Firecrawl",
    "icon": "language",
    "color": "#FB923C",
    "textIcon": "FC",
    "website": "https://firecrawl.dev",
    "hasFree": true,
    "authHint": "API key from firecrawl.dev/app/api-keys (or set your self-hosted Firecrawl base URL)",
    "notice": {
      "text": "Free tier: 1,000 credits/month. Powers /v1/web/fetch and /v1/search.",
      "apiKeyUrl": "https://firecrawl.dev/app/api-keys"
    },
    "serviceKinds": [
      "webSearch",
      "webFetch"
    ]
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "webSearch", "webFetch"
  ],
  searchConfig: SEARCH_PROTOCOLS["firecrawl"],
  fetchConfig: {baseUrl:"https://api.firecrawl.dev/v1/scrape",authType:"apikey",formats:["markdown","html","links"],costPerQuery:0.002}
};
