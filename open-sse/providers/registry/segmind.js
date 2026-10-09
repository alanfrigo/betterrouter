import { IMAGE_PROTOCOLS, VIDEO_PROTOCOLS } from '../../config/mediaProtocols.js';
export default {
  "id": "segmind",
  "alias": "segmind",
  "display": {
    "id": "segmind",
    "serviceKinds": [],
    "alias": "segmind",
    "name": "Segmind",
    "icon": "image",
    "color": "#7C3AED",
    "textIcon": "SG",
    "website": "https://segmind.com",
    "authHint": "Use your Segmind API key in the x-api-key header. OmniRoute targets https://api.segmind.com/v1/<model> and returns the generated image/video bytes directly.",
    "apiHint": "Segmind exposes 200+ hosted image and video models (Flux, SDXL, SD3, Kandinsky, Wan, Hunyuan, LTX, Kling, ...) under a single POST /v1/<model> REST call per model. OmniRoute ships a curated starter subset for each modality; more models can be routed by using their Segmind slug as the model id.",
    "hasFree": true,
    "freeNote": "Free trial credits on signup, no credit card required (per Segmind's public docs)."
  },
  "category": "apikey",
  "authType": "apikey",
  "serviceKinds": [
    "image",
    "video"
  ],
  "transport": {
    "format": "openai"
  },
  "models": [],
  imageConfig: IMAGE_PROTOCOLS["segmind"],
  videoConfig: VIDEO_PROTOCOLS["segmind"]
};
