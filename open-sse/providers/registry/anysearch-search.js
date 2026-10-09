import { SEARCH_PROTOCOLS } from '../../config/audioSearchProtocols.js';
export default {
  "id": "anysearch-search",
  "alias": "anysearch",
  "display": {
    "id": "anysearch-search",
    "alias": "anysearch",
    "name": "AnySearch",
    "icon": "travel_explore",
    "color": "#0D9488",
    "textIcon": "AS",
    "website": "https://anysearch.com",
    "hasFree": true,
    "authHint": "Optional API key from anysearch.com (as_sk_...) - free 1000/day; keyless tier has lower limits",
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
  searchConfig: SEARCH_PROTOCOLS["anysearch-search"],
  fetchConfig: {baseUrl:"https://api.anysearch.com/v1/extract",authType:"apikey",formats:["markdown"],costPerQuery:0}
};
