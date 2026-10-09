import { fetchPublic } from "../../../../src/shared/utils/ssrfGuard.js";

import { fetchRemoteImage } from "../../../../src/shared/network/remoteImageFetch.js";
import { fetchPublic as safeOutboundFetch } from "../../../../src/shared/utils/ssrfGuard.js";
import { sleep } from "../../../utils/sleep.js";
import { sanitizeErrorMessage } from "../../../utils/mediaProtocolErrors.js";
import {
  AI_HORDE_ANONYMOUS_KEY,
  AI_HORDE_API_BASE,
  AI_HORDE_CATALOG_FETCH_TIMEOUT_MS,
  AI_HORDE_CLIENT_AGENT,
  aiHordeImageCatalog
} from "../../../services/aihordeImageCatalog.js";
import {
  extractHordeSourceB64,
  mapHordeGenerateRequest,
  stripHordeModelPrefix
} from "./aihordeMapRequest.js";
const GENERATE_TIMEOUT_MS = 600000;
const POLL_INTERVAL_MIN_MS = 1000;
const POLL_INTERVAL_MAX_MS = 8000;
const HORDE_API_CALL_TIMEOUT_MS = 30000;
const HORDE_IMAGE_DOWNLOAD_TIMEOUT_MS = 60000;
const MAX_HORDE_IMAGE_BYTES = 25 * 1024 * 1024;
function hordeHeaders(apiKey) {
  return {
    apikey: apiKey,
    "Client-Agent": AI_HORDE_CLIENT_AGENT,
    Accept: "application/json",
    "Content-Type": "application/json"
  };
}
function boundedTimeoutMs(deadline, cap) {
  return Math.max(1000, Math.min(cap, deadline - Date.now()));
}
function hordeMessage(payload, fallback) {
  if (payload && typeof payload === "object") {
    const message = payload.message;
    if (typeof message === "string" && message.trim())
      return message;
  }
  return fallback;
}
async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
function mapUpstreamStatus(status) {
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 429 || status === 503) {
    return status;
  }
  return 502;
}
function resolveHordeApiKey(credentials) {
  const raw = credentials?.apiKey;
  return typeof raw === "string" && raw.trim() ? raw.trim() : AI_HORDE_ANONYMOUS_KEY;
}
async function cancelHordeJob(jobId, apiKey) {
  try {
    await safeOutboundFetch(`${AI_HORDE_API_BASE}/v2/generate/status/${jobId}`, {
      method: "DELETE",
      headers: hordeHeaders(apiKey),
      guard: "none",
      timeoutMs: HORDE_API_CALL_TIMEOUT_MS
    });
  } catch {}
}
async function fetchHordeImageBytes(img, options) {
  const value = img.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) {
    const remote = await fetchRemoteImage(value, {
      guard: "public-only",
      timeoutMs: options.timeoutMs,
      signal: options.signal ?? undefined,
      maxBytes: MAX_HORDE_IMAGE_BYTES
    });
    if (remote.buffer.length === 0)
      throw new Error("Horde R2 download returned an empty image");
    return remote.buffer.toString("base64");
  }
  return value;
}
function numericField(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
export async function handleAiHordeImageGeneration({
  model,
  provider,
  body,
  credentials,
  log,
  signal = null,
  timeoutMs = GENERATE_TIMEOUT_MS
}) {
  const hordeModel = stripHordeModelPrefix(model);
  const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
  const apiKey = resolveHordeApiKey(credentials);
  const logRequestBody = {
    model: hordeModel,
    prompt: prompt.slice(0, 200),
    size: body.size || "1024x1024",
    n: body.n || 1
  };
  const deadline = startTime + timeoutMs;
  if (log) {
    log.info("IMAGE", `${provider}/${hordeModel} (aihorde) | prompt: "${prompt.slice(0, 60)}..."`);
  }
  try {
    await aiHordeImageCatalog.ensureFresh(undefined, {
      signal: signal ?? undefined,
      timeoutMs: boundedTimeoutMs(deadline, AI_HORDE_CATALOG_FETCH_TIMEOUT_MS)
    });
    if (aiHordeImageCatalog.hasSnapshot() && !aiHordeImageCatalog.isServed(hordeModel)) {
      const error = `No Horde workers are currently serving ${hordeModel}`;
      return { success: false, status: 400, error };
    }
    const sourceImage = extractHordeSourceB64(body);
    const payload = mapHordeGenerateRequest(body, { sourceImage });
    const submit = await safeOutboundFetch(`${AI_HORDE_API_BASE}/v2/generate/async`, {
      method: "POST",
      headers: hordeHeaders(apiKey),
      body: JSON.stringify(payload),
      signal: signal ?? undefined,
      guard: "none",
      timeoutMs: boundedTimeoutMs(deadline, HORDE_API_CALL_TIMEOUT_MS)
    });
    const submitBody = await safeJson(submit);
    if (submit.status !== 200 && submit.status !== 202) {
      const error = hordeMessage(submitBody, `Horde submit failed (${submit.status})`);
      return { success: false, status: mapUpstreamStatus(submit.status), error };
    }
    const jobId = submitBody && typeof submitBody === "object" ? submitBody.id : null;
    if (typeof jobId !== "string" || !jobId) {
      return { success: false, status: 502, error: "Horde submit did not return a job id" };
    }
    let completed = false;
    let pollDelayMs = POLL_INTERVAL_MIN_MS;
    try {
      while (true) {
        if (signal?.aborted)
          throw new Error("Horde image generation cancelled");
        if (Date.now() >= deadline) {
          throw Object.assign(new Error("Horde image generation timed out"), { status: 504 });
        }
        await sleep(pollDelayMs);
        const checkRes = await safeOutboundFetch(`${AI_HORDE_API_BASE}/v2/generate/check/${jobId}`, {
          headers: hordeHeaders(apiKey),
          signal: signal ?? undefined,
          guard: "none",
          timeoutMs: boundedTimeoutMs(deadline, HORDE_API_CALL_TIMEOUT_MS)
        });
        const check = await safeJson(checkRes);
        if (!checkRes.ok || !check || typeof check !== "object") {
          throw Object.assign(new Error(hordeMessage(check, `Horde check failed (${checkRes.status})`)), { status: mapUpstreamStatus(checkRes.status) });
        }
        const checkObj = check;
        if (checkObj.faulted)
          throw new Error("Horde marked the job as faulted");
        if (checkObj.is_possible === false) {
          throw Object.assign(new Error("No Horde workers can currently fulfill this request"), {
            status: 503
          });
        }
        if (!checkObj.done) {
          const waitSeconds = numericField(checkObj.wait_time);
          const remainingMs = deadline - Date.now();
          if (waitSeconds !== null && waitSeconds * 1000 > remainingMs) {
            const queuePosition = numericField(checkObj.queue_position);
            const workers = numericField(checkObj.eligible_workers);
            const details = [
              `queue wait ~${Math.round(waitSeconds)}s`,
              queuePosition !== null ? `position ${queuePosition}` : null,
              workers !== null ? `${workers} eligible worker(s)` : null,
              `budget ${Math.round(remainingMs / 1000)}s left`
            ].filter(Boolean).join(", ");
            throw Object.assign(new Error(`Horde queue is longer than the request budget (${details}). ` + `Pick a model with more workers or raise the timeout.`), { status: 504 });
          }
          pollDelayMs = waitSeconds === null ? POLL_INTERVAL_MIN_MS : Math.min(POLL_INTERVAL_MAX_MS, Math.max(POLL_INTERVAL_MIN_MS, Math.round(waitSeconds * 1000 / 10)));
          continue;
        }
        const statusRes = await safeOutboundFetch(`${AI_HORDE_API_BASE}/v2/generate/status/${jobId}`, {
          headers: hordeHeaders(apiKey),
          signal: signal ?? undefined,
          guard: "none",
          timeoutMs: boundedTimeoutMs(deadline, HORDE_API_CALL_TIMEOUT_MS)
        });
        const status = await safeJson(statusRes);
        if (!statusRes.ok || !status || typeof status !== "object") {
          throw Object.assign(new Error(hordeMessage(status, `Horde status failed (${statusRes.status})`)), { status: mapUpstreamStatus(statusRes.status) });
        }
        const generations = status.generations;
        if (!Array.isArray(generations) || generations.length === 0) {
          throw new Error("Horde status contained no generations");
        }
        const images = [];
        for (const item of generations) {
          if (!item || typeof item !== "object")
            continue;
          const img = item.img;
          if (typeof img !== "string" || !img)
            continue;
          if (Date.now() >= deadline) {
            throw Object.assign(new Error("Horde image generation timed out"), { status: 504 });
          }
          images.push({
            b64_json: await fetchHordeImageBytes(img, {
              signal,
              timeoutMs: boundedTimeoutMs(deadline, HORDE_IMAGE_DOWNLOAD_TIMEOUT_MS)
            }),
            revised_prompt: prompt
          });
        }
        if (images.length === 0)
          throw new Error("Horde status contained no image payloads");
        completed = true;
        return {
          success: true,
          data: { created: Math.floor(Date.now() / 1000), data: images }
        };
      }
    } finally {
      if (!completed)
        await cancelHordeJob(jobId, apiKey);
    }
  } catch (err) {
    const status = err && typeof err === "object" && "status" in err && typeof err.status === "number" ? err.status : 502;
    const raw = err instanceof Error ? err.message : "Horde image generation failed";
    const error = sanitizeErrorMessage(raw);
    if (log)
      log.error("IMAGE", `aihorde error: ${String(error).slice(0, 200)}`);
    return { success: false, status, error };
  }
}
