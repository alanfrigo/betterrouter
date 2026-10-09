import { fetchPublic } from "../../../../src/shared/utils/ssrfGuard.js";

import { sleep } from "../../../utils/sleep.js";
import { sanitizeErrorMessage } from "../../../utils/mediaProtocolErrors.js";
export async function handleLeonardoImageGeneration({
  model,
  provider,
  providerConfig,
  body,
  credentials,
  log
}) {
  const token = credentials?.apiKey || "";
  const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
  if (log) {
    log.info("IMAGE", `${provider}/${model} (leonardo) | prompt: "${prompt.slice(0, 60)}..."`);
  }
  try {
    const res = await fetchPublic(providerConfig.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        modelId: model || "phoenix",
        prompt,
        width: body.width || 1024,
        height: body.height || 1024,
        num_images: 1
      })
    });
    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, status: res.status, error: errorText };
    }
    const { sdGenerationJob } = await res.json();
    const genId = sdGenerationJob?.generationId;
    if (!genId) {
      return { success: false, status: 502, error: "No generation ID returned" };
    }
    const deadline = Date.now() + 300000;
    while (Date.now() < deadline) {
      await sleep(5000);
      const statusRes = await fetchPublic(`${providerConfig.baseUrl}/${genId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const status = await statusRes.json();
      const gen = status.generations_by_pk || status;
      if (gen.status === "COMPLETE") {
        const imgUrl = gen.generated_images?.[0]?.url;
        if (imgUrl) {
          const imgRes = await fetchPublic(imgUrl);
          if (!imgRes.ok) {
            return {
              success: false,
              status: imgRes.status,
              error: `Failed to download image: ${imgRes.status}`
            };
          }
          const buf = await imgRes.arrayBuffer();
          return {
            success: true,
            data: {
              created: Math.floor(Date.now() / 1000),
              data: [{ b64_json: Buffer.from(buf).toString("base64") }]
            }
          };
        }
      }
      if (gen.status === "FAILED") {
        return { success: false, status: 502, error: "Leonardo image generation failed" };
      }
    }
    return { success: false, status: 504, error: "Leonardo image generation timed out" };
  } catch (err) {
    if (log)
      log.error("IMAGE", `${provider} leonardo error: ${err.message}`);
    return {
      success: false,
      status: 502,
      error: `Image provider error: ${sanitizeErrorMessage(err.message || err)}`
    };
  }
}
