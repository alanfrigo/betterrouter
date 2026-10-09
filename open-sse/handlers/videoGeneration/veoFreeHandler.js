import { getExecutor } from "../../executors/index.js";
export async function handleVeoAiFreeVideoGeneration({ model, provider, body, credentials, log }) {
  const executor = await getExecutor(provider);
  if (!executor) {
    return { success: false, status: 400, error: `Unknown video provider: ${provider}` };
  }
  const prompt = String(body.prompt ?? "");
  const systemParts = [];
  if (body.size)
    systemParts.push(`aspect_ratio: ${body.size}`);
  if (body.aspect_ratio)
    systemParts.push(`aspect_ratio: ${body.aspect_ratio}`);
  const response = await executor.execute({
    model,
    body: {
      ...body,
      model: `${provider}/${model}`,
      messages: [
        ...systemParts.length > 0 ? [{ role: "system", content: systemParts.join(`
`) }] : [],
        { role: "user", content: prompt }
      ]
    },
    stream: false,
    credentials: credentials || { connectionId: "noauth" },
    signal: null,
    log
  });
  const upstreamResponse = response instanceof Response ? response : response.response;
  if (!upstreamResponse.ok) {
    return {
      success: false,
      status: upstreamResponse.status || 502,
      error: await upstreamResponse.text().catch(() => "Video provider error")
    };
  }
  const payload = await upstreamResponse.json().catch(() => null);
  const item = Array.isArray(payload?.data) ? payload.data[0] : null;
  if (!payload || !Array.isArray(payload.data) || payload.data.length !== 1 || !item || typeof item.b64_json !== "string" || item.b64_json.trim().length === 0 || item.format !== "mp4" || typeof item.url === "string") {
    return {
      success: false,
      status: 502,
      error: {
        error: {
          message: "Veo AI Free did not return a valid MP4 artifact",
          type: "upstream_error",
          code: "VIDEO_ARTIFACT_UNAVAILABLE"
        }
      }
    };
  }
  return {
    success: true,
    data: payload
  };
}
