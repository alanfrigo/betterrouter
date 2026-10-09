import { IMAGE_PROTOCOLS } from "../../config/mediaProtocols.js";
import { EXTRA_IMAGES } from "../../config/extraMediaProtocols.js";
import { handleAdobeFireflyImageGeneration } from "../imageGeneration/providers/adobeFirefly.js";
import { handleAiHordeImageGeneration } from "../imageGeneration/providers/aihorde.js";
import { handleIdeogramImageGeneration } from "../imageGeneration/providers/ideogram.js";
import { handleHaiperImageGeneration } from "../imageGeneration/providers/haiper.js";
import { handleLeonardoImageGeneration } from "../imageGeneration/providers/leonardo.js";
import { handleMagnificImageGeneration } from "../imageGeneration/providers/magnific.js";
import { handleSegmindImageGeneration } from "../imageGeneration/providers/segmind.js";
import { handleSyntxImageGeneration } from "../imageGeneration/providers/syntx.js";
import { handleKieImageGeneration } from "../imageProtocolHelpers.js";
import { fetchPublic } from "../../../src/shared/utils/ssrfGuard.js";

const HANDLERS = {
  ideogram: handleIdeogramImageGeneration,
  haiper: handleHaiperImageGeneration,
  leonardo: handleLeonardoImageGeneration,
  magnific: handleMagnificImageGeneration,
  segmind: handleSegmindImageGeneration,
  syntx: handleSyntxImageGeneration,
  kie: handleKieImageGeneration,
  "adobe-firefly": handleAdobeFireflyImageGeneration,
  aihorde: handleAiHordeImageGeneration,
};

export function createMediaImageAdapter(provider) {
  return {
    useExecutor: true,
    async executeViaExecutor(model, body, credentials, log) {
      if (!credentials?.apiKey && !credentials?.accessToken && !["pollinations", "aihorde"].includes(provider)) {
        throw new Error(`${provider} credentials required`);
      }
      if (provider === "deepai") {
        const payload = new FormData();
        payload.set("text", body.prompt);
        const response = await fetchPublic("https://api.deepai.org/api/text2img", {
          method: "POST", headers: { "api-key": credentials.apiKey }, body: payload,
        });
        if (!response.ok) throw Object.assign(new Error(`DeepAI returned HTTP ${response.status}`), { status: response.status });
        const result = await response.json();
        if (!result.output_url) throw new Error("DeepAI returned no image");
        return { created: Math.floor(Date.now() / 1000), data: [{ url: result.output_url }] };
      }
      if (!HANDLERS[provider]) {
        const config = IMAGE_PROTOCOLS[provider];
        const response = await fetchPublic(config.baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(credentials?.apiKey ? { Authorization: `Bearer ${credentials.apiKey}` } : {}) },
          body: JSON.stringify({ ...body, model }),
        });
        if (!response.ok) throw Object.assign(new Error(`${provider} returned HTTP ${response.status}`), { status: response.status });
        if ((response.headers.get("content-type") || "").startsWith("image/")) {
          return { created: Math.floor(Date.now() / 1000), data: [{ b64_json: Buffer.from(await response.arrayBuffer()).toString("base64") }] };
        }
        return response.json();
      }
      const result = await HANDLERS[provider]({ model, provider, body, credentials, log, providerConfig: IMAGE_PROTOCOLS[provider] || EXTRA_IMAGES[provider] });
      if (!result.success) throw Object.assign(new Error(result.error || `${provider} image generation failed`), { status: result.status });
      return result.data;
    },
    normalize(result) { return result; },
  };
}
