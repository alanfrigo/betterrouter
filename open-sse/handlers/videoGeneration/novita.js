const NOVITA_TERMINAL_SUCCESS = new Set(["TASK_STATUS_SUCCEED", "SUCCEED", "SUCCEEDED"]);
const NOVITA_TERMINAL_FAILURE = new Set(["TASK_STATUS_FAILED", "FAILED", "UNKNOWN_ERROR"]);
export function buildNovitaSubmitUrl(baseUrl, model) {
  return `${baseUrl.replace(/\/$/, "")}/${model}`;
}
export function buildNovitaPollUrl(statusUrl, taskId) {
  return `${statusUrl.replace(/\/$/, "")}?task_id=${encodeURIComponent(taskId)}`;
}
export function normalizeNovitaVideoParams(body) {
  const b = body ?? {};
  const prompt = typeof b.prompt === "string" ? b.prompt : String(b.prompt ?? "");
  const negativePrompt = typeof b.negative_prompt === "string" ? b.negative_prompt : undefined;
  const durationRaw = typeof b.duration === "number" ? b.duration : undefined;
  const duration = typeof durationRaw === "number" && Number.isFinite(durationRaw) && durationRaw > 0 ? durationRaw : undefined;
  let width;
  let height;
  if (typeof b.size === "string") {
    const match = /^(\d+)\s*[x*]\s*(\d+)/.exec(b.size);
    if (match) {
      width = Number(match[1]);
      height = Number(match[2]);
    }
  }
  return { prompt, negativePrompt, duration, width, height };
}
export function buildNovitaSubmitBody(params) {
  const payload = { prompt: params.prompt };
  if (params.negativePrompt)
    payload.negative_prompt = params.negativePrompt;
  if (typeof params.duration === "number")
    payload.duration = params.duration;
  if (typeof params.width === "number")
    payload.width = params.width;
  if (typeof params.height === "number")
    payload.height = params.height;
  return payload;
}
export function parseNovitaTaskId(json) {
  if (!json || typeof json !== "object")
    return null;
  const taskId = json.task_id;
  return typeof taskId === "string" && taskId.length > 0 ? taskId : null;
}
function extractNovitaVideoUrl(json) {
  const videos = json?.videos;
  if (!Array.isArray(videos) || videos.length === 0)
    return null;
  const first = videos[0];
  if (!first || typeof first !== "object")
    return null;
  const videoUrl = first.video_url;
  return typeof videoUrl === "string" && videoUrl.length > 0 ? videoUrl : null;
}
export function parseNovitaTaskResult(json) {
  if (!json || typeof json !== "object") {
    return { done: false, status: "UNKNOWN" };
  }
  const task = json.task;
  const taskRec = task && typeof task === "object" ? task : {};
  const status = typeof taskRec.status === "string" ? taskRec.status : "UNKNOWN";
  if (NOVITA_TERMINAL_FAILURE.has(status)) {
    const reason = typeof taskRec.reason === "string" && taskRec.reason ? taskRec.reason : null;
    return { done: true, status, errorMessage: reason || `Novita video task ${status}` };
  }
  if (!NOVITA_TERMINAL_SUCCESS.has(status)) {
    return { done: false, status };
  }
  const videoUrl = extractNovitaVideoUrl(json);
  if (videoUrl)
    return { done: true, status, videoUrl };
  return { done: true, status, errorMessage: "Novita task succeeded but returned no video_url" };
}
