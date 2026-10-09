import { fetchPublic } from "../../../src/shared/utils/ssrfGuard.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function handleLeonardoVideoGeneration({
  model,
  provider,
  providerConfig,
  body,
  credentials,
  log
}) {
  const token = credentials?.apiKey || "";
  const res = await fetchPublic(providerConfig.baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      modelId: "phoenix",
      prompt: body.prompt,
      width: 1024,
      height: 576,
      num_frames: 24
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
        const videoRes = await fetchPublic(imgUrl);
        const buf = await videoRes.arrayBuffer();
        return {
          success: true,
          data: {
            created: Math.floor(Date.now() / 1000),
            data: [{ b64_json: Buffer.from(buf).toString("base64"), format: "mp4" }]
          }
        };
      }
    }
    if (gen.status === "FAILED") {
      return { success: false, status: 502, error: "Leonardo video generation failed" };
    }
  }
  return { success: false, status: 504, error: "Leonardo video generation timed out" };
}
