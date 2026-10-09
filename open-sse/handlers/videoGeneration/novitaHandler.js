import { fetchPublic } from "../../../src/shared/utils/ssrfGuard.js";
import { sanitizeErrorMessage } from "../../utils/mediaProtocolErrors.js";
import {
  buildNovitaPollUrl,
  buildNovitaSubmitBody,
  buildNovitaSubmitUrl,
  normalizeNovitaVideoParams,
  parseNovitaTaskId,
  parseNovitaTaskResult
} from "./novita.js";
const DEFAULT_TIMEOUT_MS = 300000;
const DEFAULT_POLL_INTERVAL_MS = 2500;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function submitNovitaTask(submitUrl, headers, payload, log) {
  const submitRes = await fetchPublic(submitUrl, { method: "POST", headers, body: JSON.stringify(payload) });
  const submitData = await submitRes.json().catch(() => ({}));
  const taskId = parseNovitaTaskId(submitData);
  if (taskId)
    return { taskId };
  const errorMessage = submitData?.message || "Novita did not return a task_id";
  log?.error?.("VIDEO", `Novita createTask failed: ${JSON.stringify(submitData)}`);
  return {
    error: {
      success: false,
      status: submitRes.ok ? 502 : submitRes.status,
      error: String(errorMessage)
    }
  };
}
function resolveNovitaTiming(body) {
  const timeoutMs = Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : DEFAULT_TIMEOUT_MS;
  const pollIntervalMs = Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : DEFAULT_POLL_INTERVAL_MS;
  return { timeoutMs, pollIntervalMs };
}
async function pollNovitaTask(pollUrl, token, taskId, deadline, pollIntervalMs) {
  let lastStatus = "UNKNOWN";
  while (Date.now() < deadline) {
    await sleep(pollIntervalMs);
    const pollRes = await fetchPublic(pollUrl, { headers: { Authorization: `Bearer ${token}` } });
    const pollData = await pollRes.json().catch(() => ({}));
    const result = parseNovitaTaskResult(pollData);
    lastStatus = result.status;
    if (!result.done)
      continue;
    if (result.videoUrl) {
      return {
        success: true,
        data: { created: Math.floor(Date.now() / 1000), data: [{ url: result.videoUrl, format: "mp4" }] }
      };
    }
    return { success: false, status: 502, error: sanitizeErrorMessage(result.errorMessage) };
  }
  return { success: false, status: 504, error: `Novita task ${taskId} timed out (status: ${lastStatus})` };
}
export async function handleNovitaVideoGeneration({
  model,
  provider,
  providerConfig,
  body,
  credentials,
  log
}) {
  const token = credentials?.apiKey || credentials?.accessToken;
  if (!token) {
    return { success: false, status: 401, error: "Novita AI API key is required" };
  }
  const { timeoutMs, pollIntervalMs } = resolveNovitaTiming(body);
  const statusUrl = providerConfig.statusUrl || `${providerConfig.baseUrl}/task-result`;
  const submitUrl = buildNovitaSubmitUrl(providerConfig.baseUrl, model);
  const params = normalizeNovitaVideoParams(body);
  const payload = buildNovitaSubmitBody(params);
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  log?.info?.("VIDEO", `${provider}/${model} (novita-video) | prompt: "${params.prompt.slice(0, 60)}..."`);
  try {
    const submitted = await submitNovitaTask(submitUrl, headers, payload, log);
    if ("error" in submitted)
      return submitted.error;
    const pollUrl = buildNovitaPollUrl(statusUrl, submitted.taskId);
    return await pollNovitaTask(pollUrl, token, submitted.taskId, Date.now() + timeoutMs, pollIntervalMs);
  } catch (err) {
    const e = err ?? {};
    log?.error?.("VIDEO", `Novita video generation failed: ${e.message}`);
    return {
      success: false,
      status: typeof e.status === "number" ? e.status : 502,
      error: sanitizeErrorMessage(e.message || "Novita video generation failed")
    };
  }
}
