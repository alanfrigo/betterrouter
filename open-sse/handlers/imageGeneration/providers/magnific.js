import { fetchPublic } from "../../../../src/shared/utils/ssrfGuard.js";

import { sleep } from "../../../utils/sleep.js";
import { sanitizeErrorMessage } from "../../../utils/mediaProtocolErrors.js";
const DEFAULT_POLL_INTERVAL_MS = 4000;
const DEFAULT_POLL_TIMEOUT_MS = 180000;
function normalizePositiveNumber(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0)
    return fallback;
  return Math.floor(n);
}
function magnificAuthHeader(providerConfig, token) {
  const headerName = providerConfig.authHeader || "x-magnific-api-key";
  return { [headerName]: token };
}
async function logAndFail(params) {
  const { status, error } = params;
  const sanitized = sanitizeErrorMessage(error);
  return { success: false, status, error: sanitized };
}
async function submitMysticTask(params) {
  const { providerConfig, token, model, prompt, body } = params;
  return fetchPublic(providerConfig.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...magnificAuthHeader(providerConfig, token)
    },
    body: JSON.stringify({
      prompt,
      model: model || "realism",
      resolution: typeof body.resolution === "string" ? body.resolution : "1k",
      aspect_ratio: typeof body.aspect_ratio === "string" ? body.aspect_ratio : "square_1_1"
    })
  });
}
async function pollMysticTask(params) {
  const { providerConfig, token, taskId } = params;
  const statusBase = providerConfig.statusUrl || providerConfig.baseUrl;
  const res = await fetchPublic(`${statusBase}/${taskId}`, {
    headers: { ...magnificAuthHeader(providerConfig, token) }
  });
  const json = await res.json();
  const task = json?.data || json;
  const status = typeof task?.status === "string" ? task.status : "IN_PROGRESS";
  const generated = Array.isArray(task?.generated) ? task.generated : [];
  return { status, imageUrl: typeof generated[0] === "string" ? generated[0] : undefined };
}
async function downloadGeneratedImage(imageUrl) {
  const imgRes = await fetchPublic(imageUrl);
  if (!imgRes.ok) {
    return {
      state: "failed",
      status: imgRes.status,
      error: `Failed to download image: ${imgRes.status}`
    };
  }
  const buf = await imgRes.arrayBuffer();
  return { state: "ok", b64: Buffer.from(buf).toString("base64") };
}
async function resolveCompletedResult(params) {
  const { provider, model, startTime, imageUrl } = params;
  if (!imageUrl) {
    return logAndFail({
      provider,
      model,
      startTime,
      status: 502,
      error: "Magnific Mystic completed without a generated image URL"
    });
  }
  const downloaded = await downloadGeneratedImage(imageUrl);
  if (downloaded.state === "failed") {
    return { success: false, status: downloaded.status, error: downloaded.error };
  }
  return {
    success: true,
    data: { created: Math.floor(Date.now() / 1000), data: [{ b64_json: downloaded.b64 }] }
  };
}
async function pollUntilDone(params) {
  const {
    providerConfig,
    token,
    taskId,
    provider,
    model,
    startTime,
    pollIntervalMs,
    pollTimeoutMs
  } = params;
  const deadline = Date.now() + pollTimeoutMs;
  while (Date.now() < deadline) {
    await sleep(pollIntervalMs);
    const { status, imageUrl } = await pollMysticTask({ providerConfig, token, taskId });
    if (status === "COMPLETED") {
      return resolveCompletedResult({ provider, model, startTime, imageUrl });
    }
    if (status === "FAILED") {
      return logAndFail({
        provider,
        model,
        startTime,
        status: 502,
        error: "Magnific Mystic image generation failed"
      });
    }
  }
  return logAndFail({
    provider,
    model,
    startTime,
    status: 504,
    error: "Magnific Mystic image generation timed out"
  });
}
async function submitAndGetTaskId(params) {
  const { providerConfig, token, model, prompt, body, provider, startTime } = params;
  const res = await submitMysticTask({ providerConfig, token, model, prompt, body });
  if (!res.ok) {
    const errorText = await res.text();
    return {
      failed: await logAndFail({
        provider,
        model,
        startTime,
        status: res.status,
        error: errorText
      })
    };
  }
  const submitJson = await res.json();
  const taskId = submitJson?.data?.task_id || submitJson?.task_id;
  if (!taskId) {
    return {
      failed: await logAndFail({
        provider,
        model,
        startTime,
        status: 502,
        error: "Magnific Mystic did not return a task_id"
      })
    };
  }
  return { taskId };
}
export async function handleMagnificImageGeneration({
  model,
  provider,
  providerConfig,
  body,
  credentials,
  log
}) {
  const startTime = Date.now();
  const token = credentials?.apiKey || "";
  const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
  const pollIntervalMs = normalizePositiveNumber(body.poll_interval_ms, DEFAULT_POLL_INTERVAL_MS);
  const pollTimeoutMs = normalizePositiveNumber(body.poll_timeout_ms, DEFAULT_POLL_TIMEOUT_MS);
  if (log) {
    log.info("IMAGE", `${provider}/${model} (magnific-mystic) | prompt: "${prompt.slice(0, 60)}..."`);
  }
  try {
    const submitted = await submitAndGetTaskId({
      providerConfig,
      token,
      model,
      prompt,
      body,
      provider,
      startTime
    });
    if ("failed" in submitted)
      return submitted.failed;
    return await pollUntilDone({
      providerConfig,
      token,
      taskId: submitted.taskId,
      provider,
      model,
      startTime,
      pollIntervalMs,
      pollTimeoutMs
    });
  } catch (err) {
    const message = err?.message || String(err);
    if (log)
      log.error("IMAGE", `${provider} magnific error: ${sanitizeErrorMessage(message)}`);
    return logAndFail({
      provider,
      model,
      startTime,
      status: 502,
      error: `Image provider error: ${message}`
    });
  }
}
