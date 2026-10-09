import { SEARCH_PROTOCOLS } from '../../config/audioSearchProtocols.js';
export default {
  "id": "perplexity-search",
  "alias": "pplx-search",
  "display": {
    "id": "perplexity-search",
    "serviceKinds": [
      "webSearch"
    ],
    "alias": "pplx-search",
    "name": "Perplexity Search",
    "icon": "search",
    "color": "#20808D",
    "textIcon": "PS",
    "website": "https://docs.perplexity.ai/guides/search-quickstart",
    "authHint": "Same API key as Perplexity (pplx-...)"
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "webSearch"
  ],
  searchConfig: SEARCH_PROTOCOLS["perplexity-search"]
};
