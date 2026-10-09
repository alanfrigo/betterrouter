import { fetchPublic } from "../../../../src/shared/utils/ssrfGuard.js";

import { sanitizeErrorMessage } from "../../../utils/mediaProtocolErrors.js";
export async function handleIdeogramImageGeneration({
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
    log.info("IMAGE", `${provider}/${model} (ideogram) | prompt: "${prompt.slice(0, 60)}..."`);
  }
  try {
    const v3 = model === "V_3";
    const aspect = typeof body.aspect_ratio === "string" ? body.aspect_ratio.replace(":", "x") : "1x1";
    const payload = v3 ? new FormData() : {image_request:{prompt,model:model || "V_2A",aspect_ratio:`ASPECT_${aspect.replace("x", "_")}`}};
    if (v3) {
      payload.set("prompt",prompt);
      payload.set("aspect_ratio",aspect);
      if (body.n) payload.set("num_images",String(body.n));
      for (const key of ["seed","negative_prompt","rendering_speed","magic_prompt","style_type","style_preset"]) if (body[key] != null) payload.set(key,String(body[key]));
    }
    const res = await fetchPublic(v3 ? "https://api.ideogram.ai/v1/ideogram-v3/generate" : providerConfig.baseUrl, {
      method: "POST",
      headers: { "Api-Key": token, ...(!v3 ? {"Content-Type":"application/json"} : {}) },
      body: v3 ? payload : JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, status: res.status, error: errorText };
    }
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      const imgUrl = data.data[0].url;
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
    return { success: false, status: 502, error: "No images returned from Ideogram" };
  } catch (err) {
    if (log)
      log.error("IMAGE", `${provider} ideogram error: ${err.message}`);
    return {
      success: false,
      status: 502,
      error: `Image provider error: ${sanitizeErrorMessage(err.message || err)}`
    };
  }
}
