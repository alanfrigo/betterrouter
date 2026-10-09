import { fetchPublic } from "../../../../src/shared/utils/ssrfGuard.js";

import { sleep } from "../../../utils/sleep.js";
import { sanitizeErrorMessage } from "../../../utils/mediaProtocolErrors.js";
export async function handleHaiperImageGeneration({
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
    log.info("IMAGE", `${provider}/${model} (haiper) | prompt: "${prompt.slice(0, 60)}..."`);
  }
  try {
    const res = await fetchPublic(providerConfig.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", HAIPER_KEY: token },
      body: JSON.stringify({ prompt, aspect_ratio: body.aspect_ratio || "16:9" })
    });
    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, status: res.status, error: errorText };
    }
    const { job_id } = await res.json();
    const deadline = Date.now() + 300000;
    while (Date.now() < deadline) {
      await sleep(5000);
      const statusRes = await fetchPublic(`${providerConfig.statusUrl}/${job_id}`, {
        headers: { HAIPER_KEY: token }
      });
      const status = await statusRes.json();
      if (status.status === "completed" || status.status === "succeeded") {
        const imgUrl = status.creation_url || status.output?.image_url;
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
      if (status.status === "failed") {
        return { success: false, status: 502, error: "Haiper image generation failed" };
      }
    }
    return { success: false, status: 504, error: "Haiper image generation timed out" };
  } catch (err) {
    if (log)
      log.error("IMAGE", `${provider} haiper error: ${err.message}`);
    return {
      success: false,
      status: 502,
      error: `Image provider error: ${sanitizeErrorMessage(err.message || err)}`
    };
  }
}
