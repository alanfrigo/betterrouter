import { fetchPublic } from "../../../src/shared/utils/ssrfGuard.js";

import { sanitizeErrorMessage } from "../../utils/mediaProtocolErrors.js";
import {
  AdobeFireflyError,
  adobeFireflyGenerateVideo,
  resolveAdobeSourceImageIds,
  resolveAdobeVideoModel
} from "../../services/adobeFireflyClient.js";
import { ensureAdobeFireflySession } from "../../services/adobeFireflySession.js";
function normalizePositiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
export async function handleAdobeFireflyVideoGeneration({
  model,
  provider,
  body,
  credentials,
  log,
  fetchImpl = fetchPublic
}) {
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return {
      success: false,
      status: 400,
      error: "Prompt is required for Adobe Firefly video generation"
    };
  }
  try {
    const session = await ensureAdobeFireflySession({
      credentials,
      fetchImpl,
      log
    });
    const accessToken = session.accessToken;
    const sessionCookie = session.cookie || undefined;
    const arpSessionId = session.arpSessionId;
    const timeoutMs = normalizePositiveNumber(body.timeout_ms, 300000);
    const seed = typeof body.seed === "number" ? body.seed : typeof body.seed === "string" && String(body.seed).trim() ? Number(body.seed) : undefined;
    const { id: videoModelId } = resolveAdobeVideoModel(String(model));
    const maxFrames = videoModelId.includes("kling") || videoModelId.includes("sora") ? 2 : 3;
    const sourceImageIds = await resolveAdobeSourceImageIds({
      accessToken,
      body,
      max: maxFrames,
      sessionCookie,
      arpSessionId,
      prompt,
      fetchImpl,
      log
    });
    log?.info?.("VIDEO", `${provider}/${model} (adobe-firefly) | prompt: "${prompt.slice(0, 60)}${prompt.length > 60 ? "..." : ""}"` + (sourceImageIds.length ? ` | frames: ${sourceImageIds.length}` : "") + ` | session=${session.source}`);
    const result = await adobeFireflyGenerateVideo({
      accessToken,
      prompt,
      model,
      size: body.size,
      aspectRatio: body.aspect_ratio ?? body.aspectRatio ?? body.ratio ?? body.size,
      duration: body.duration ?? body.durationSeconds,
      quality: body.quality,
      resolution: body.resolution ?? body.quality,
      seed: Number.isFinite(seed) ? seed : undefined,
      negativePrompt: typeof body.negative_prompt === "string" ? body.negative_prompt : typeof body.negativePrompt === "string" ? body.negativePrompt : undefined,
      generateAudio: body.generate_audio !== false && body.generateAudio !== false,
      sourceImageIds: sourceImageIds.length ? sourceImageIds : undefined,
      sessionCookie,
      arpSessionId,
      sessionFingerprint: session.fingerprint,
      sessionBrowserKey: session.browserSessionKey,
      timeoutMs,
      fetchImpl,
      log
    });
    return {
      success: true,
      data: {
        created: Math.floor(Date.now() / 1000),
        data: [{ url: result.url, format: result.format || "mp4" }]
      }
    };
  } catch (err) {
    if (err instanceof AdobeFireflyError) {
      log?.error?.("VIDEO", `${provider} adobe-firefly error ${err.status}: ${err.message}`);
      return { success: false, status: err.status, error: err.message };
    }
    const errorText = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
    log?.error?.("VIDEO", `${provider} adobe-firefly exception: ${errorText}`);
    return { success: false, status: 500, error: errorText };
  }
}
