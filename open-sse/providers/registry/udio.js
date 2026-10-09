import { MUSIC_PROTOCOLS } from '../../config/mediaProtocols.js';
export default {
  "id": "udio",
  "alias": "udio",
  "display": {
    "id": "udio",
    "serviceKinds": [],
    "alias": "udio",
    "name": "Udio",
    "icon": "music_note",
    "color": "#10B981",
    "textIcon": "UD",
    "website": "https://udio.com",
    "authHint": "Paste session cookie from udio.com (Supabase auth)"
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "music"
  ],
  "transport": {
    "baseUrl": "https://www.udio.com/api/generate-proxy",
    "format": "openai",
    "auth": {
      "header": "cookie",
      "scheme": "raw"
    }
  },
  "models": [
    {
      "id": "udio-default",
      "name": "Udio Default"
    }
  ],
  musicConfig: MUSIC_PROTOCOLS["udio"]
};
