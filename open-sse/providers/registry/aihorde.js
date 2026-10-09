import { EXTRA_IMAGES, EXTRA_VIDEOS } from "../../config/extraMediaProtocols.js";
export default {
  "id": "aihorde",
  "alias": "horde",
  "category": "free",
  "display": {
    "name": "AI Horde",
    "icon": "diversity_3",
    "color": "#8B5CF6",
    "textIcon": "AH",
    "website": "https://aihorde.net",
    "notice": {
      "text": "AI Horde routes to volunteer-run workers, so chat and image jobs can take minutes and tool calling is unavailable. Chat models come from the live oai.aihorde.net catalog. Image models are listed only while Horde reports at least one worker. An optional aihorde.net API key raises queue priority (kudos)."
    }
  },
  "models": [
    {
      "id": "aphrodite/TheDrummer/Cydonia-24B-v4.3",
      "name": "Cydonia 24B (AI Horde)",
      "contextLength": 32768,
      "toolCalling": false,
      "unsupportedParams": [
        "tools",
        "tool_choice",
        "parallel_tool_calls"
      ]
    },
    {
      "id": "aphrodite/TheDrummer/Skyfall-31B-v4.2",
      "name": "Skyfall 31B (AI Horde)",
      "contextLength": 32768,
      "toolCalling": false,
      "unsupportedParams": [
        "tools",
        "tool_choice",
        "parallel_tool_calls"
      ]
    },
    {
      "id": "google/gemma-4-31b",
      "name": "Gemma 4 31B (AI Horde)",
      "contextLength": 32768,
      "toolCalling": false,
      "unsupportedParams": [
        "tools",
        "tool_choice",
        "parallel_tool_calls"
      ]
    }
  ],
  serviceKinds: ["llm","image"],
  imageConfig: EXTRA_IMAGES.aihorde,
  "passthroughModels": true,
  "transport": {
    "format": "openai",
    "baseUrl": "https://oai.aihorde.net/v1/chat/completions",
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer"
    },
    "noAuth": true,
    "anonymousApiKey": "0000000000"
  },
  "noAuth": true
};
