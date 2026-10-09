import { fetchPublic } from "../../../../src/shared/utils/ssrfGuard.js";
import { sanitizeErrorMessage } from "../../../utils/mediaProtocolErrors.js";
import { saveImageErrorResult, saveImageSuccessResult } from "../../imageProtocolHelpers.js";
import {
  AdobeFireflyError,
  adobeFireflyGenerateImage,
  resolveAdobeSourceImageIds,
  resolveAdobeImageModel
} from "../../../services/adobeFireflyClient.js";
import { ensureAdobeFireflySession } from "../../../services/adobeFireflySession.js";
function normalizePositiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
export async function handleAdobeFireflyImageGeneration({
  model,
  provider,
  body,
  credentials,
  log,
  fetchImpl = fetchPublic
}) {
  const startTime = Date.now();
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return saveImageErrorResult({
      provider,
      model,
      status: 400,
      startTime,
      error: "Prompt is required for Adobe Firefly image generation"
    });
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
    const timeoutMs = normalizePositiveNumber(body.timeout_ms, 180000);
    const seed = typeof body.seed === "number" ? body.seed : typeof body.seed === "string" && body.seed.trim() ? Number(body.seed) : undefined;
    const { id: resolvedId } = resolveAdobeImageModel(model);
    const maxRefs = resolvedId.includes("nano-banana") || resolvedId.includes("gpt-image") ? 4 : 2;
    const sourceImageIds = await resolveAdobeSourceImageIds({
      accessToken,
      body,
      max: maxRefs,
      sessionCookie,
      arpSessionId,
      prompt,
      fetchImpl,
      log
    });
    log?.info?.("IMAGE", `${provider}/${model} (adobe-firefly) | prompt: "${prompt.slice(0, 60)}${prompt.length > 60 ? "..." : ""}"` + (sourceImageIds.length ? ` | refs: ${sourceImageIds.length}` : "") + ` | session=${session.source}`);
    const result = await adobeFireflyGenerateImage({
      accessToken,
      prompt,
      model,
      size: body.size,
      aspectRatio: body.aspect_ratio ?? body.aspectRatio ?? body.size,
      quality: body.quality,
      seed: Number.isFinite(seed) ? seed : undefined,
      negativePrompt: typeof body.negative_prompt === "string" ? body.negative_prompt : undefined,
      sourceImageIds: sourceImageIds.length ? sourceImageIds : undefined,
      sessionCookie,
      arpSessionId,
      sessionFingerprint: session.fingerprint,
      sessionBrowserKey: session.browserSessionKey,
      timeoutMs,
      fetchImpl,
      log
    });
    return saveImageSuccessResult({
      provider,
      model,
      startTime,
      images: [{ url: result.url }]
    });
  } catch (err) {
    if (err instanceof AdobeFireflyError) {
      log?.error?.("IMAGE", `${provider} adobe-firefly error ${err.status}: ${err.message}`);
      return saveImageErrorResult({
        provider,
        model,
        status: err.status,
        startTime,
        error: err.message
      });
    }
    const errorText = sanitizeErrorMessage(err instanceof Error ? err.message : String(err));
    log?.error?.("IMAGE", `${provider} adobe-firefly exception: ${errorText}`);
    return saveImageErrorResult({
      provider,
      model,
      status: 500,
      startTime,
      error: errorText
    });
  }
}
