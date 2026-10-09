export default {
  "id": "veoaifree-web",
  "priority": 310,
  "alias": "veo-free",
  "display": {
    "name": "Veo AI Free",
    "icon": "videocam",
    "color": "#8B5CF6",
    "textIcon": "VF",
    "website": "https://veoaifree.com"
  },
  "category": "free",
  "noAuth": true,
  "hasFree": true,
  "authHint": "No auth required. Rate limited to 6 requests/hour per IP.",
  "freeNote": "Free video generation — VEO 3.1, Seedance. 6 requests/hour.",
  "serviceKinds": [
    "video"
  ],
  "transport": {
    "baseUrl": "https://veoaifree.com/wp-admin/admin-ajax.php",
    "format": "openai",
    "authType": "none"
  },
  "models": [
    {
      "id": "veo",
      "name": "VEO 3.1",
      "toolCalling": false
    },
    {
      "id": "seedance",
      "name": "Seedance",
      "toolCalling": false
    }
  ]
};
