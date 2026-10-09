import { SEARCH_PROTOCOLS } from '../../config/audioSearchProtocols.js';
export default {
  "id": "nimble-search",
  "alias": "nimble",
  "display": {
    "id": "nimble-search",
    "alias": "nimble",
    "name": "Nimble Search",
    "icon": "travel_explore",
    "color": "#6D28D9",
    "textIcon": "NB",
    "website": "https://docs.nimbleway.com/nimble-sdk/web-tools/search",
    "authHint": "Bearer API key from the Nimble dashboard",
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
  searchConfig: SEARCH_PROTOCOLS["nimble-search"],
  fetchConfig: {baseUrl:"https://sdk.nimbleway.com/v1/extract",authType:"apikey",formats:["markdown","html","links","screenshot"],costPerQuery:0.005}
};
