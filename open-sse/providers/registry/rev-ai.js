import { AUDIO_PROTOCOLS } from '../../config/audioSearchProtocols.js';
export default {
  "id": "rev-ai",
  "alias": "revai",
  "display": {
    "id": "rev-ai",
    "serviceKinds": [],
    "alias": "revai",
    "name": "Rev AI",
    "icon": "record_voice_over",
    "color": "#FF5C35",
    "textIcon": "RV",
    "website": "https://www.rev.ai"
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "stt"
  ],
  sttConfig: AUDIO_PROTOCOLS["rev-ai"]
};
