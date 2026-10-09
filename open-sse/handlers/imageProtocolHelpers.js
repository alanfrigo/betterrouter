import { mapImageSize } from "../translator/image/sizeMapper.js";
import { fetchPublic } from "../../src/shared/utils/ssrfGuard.js";

import { sanitizeErrorMessage } from "../utils/mediaProtocolErrors.js";
import { kieExecutor } from "../executors/kie.js";
import { getKieTaskId, getKieCallbackUrl, getKieErrorMessage, getKieErrorStatus, isJsonObject, parseKieResultJson } from "../utils/kieTask.js";
import { sleep } from "../utils/sleep.js";
import { IMAGE_PROTOCOLS, VIDEO_PROTOCOLS, MUSIC_PROTOCOLS } from "../config/mediaProtocols.js";
const getImageProvider = (id) => IMAGE_PROTOCOLS[id];
const getMusicProvider = (id) => MUSIC_PROTOCOLS[id];
export const KIE_MARKET_UPSTREAM_MODEL_IDS = new Map([
  ["google-imagen/nano-banana", "google/nano-banana"],
  ["google-imagen/nano-banana-2", "nano-banana-2"],
  ["google-imagen/nano-banana-pro", "nano-banana-pro"],
  ["google-imagen/nano-banana-edit", "google/nano-banana-edit"],
  ["gpt/gpt-image-2-text-to-image", "gpt-image-2-text-to-image"],
  ["gpt/gpt-image-2-image-to-image", "gpt-image-2-image-to-image"],
  ["gpt/gpt-image-1.5-text-to-image", "gpt-image/1.5-text-to-image"],
  ["gpt/gpt-image-1.5-image-to-image", "gpt-image/1.5-image-to-image"],
  ["seedream/5.0-lite-text-to-image", "seedream/5-lite-text-to-image"],
  ["seedream/5.0-lite-image-to-image", "seedream/5-lite-image-to-image"],
  ["flux/2-pro-text-to-image", "flux-2/pro-text-to-image"],
  ["flux/2-pro-image-to-image", "flux-2/pro-image-to-image"],
  ["flux/2-text-to-image", "flux-2/flex-text-to-image"],
  ["flux/2-image-to-image", "flux-2/flex-image-to-image"],
  ["wan/2.7-image", "wan/2-7-image"],
  ["wan/2.7-image-pro", "wan/2-7-image-pro"]
]);
export function resolveKieMarketUpstreamModelId(publicModelId) {
  return KIE_MARKET_UPSTREAM_MODEL_IDS.get(publicModelId) ?? publicModelId;
}
function normalizeKieImageResult(recordData) {
  const record = isJsonObject(recordData) ? recordData : {};
  const data = isJsonObject(record.data) ? record.data : {};
  const response = isJsonObject(data.response) ? data.response : {};
  const resultJson = parseKieResultJson(recordData);
  const urls = new Set;
  const add = (val) => {
    if (typeof val === "string" && val.startsWith("http"))
      urls.add(val);
    if (Array.isArray(val)) {
      val.forEach((v) => {
        if (typeof v === "string" && v.startsWith("http"))
          urls.add(v);
      });
    }
  };
  add(resultJson?.resultUrls);
  add(resultJson?.imageUrls);
  add(resultJson?.resultUrl);
  add(resultJson?.imageUrl);
  add(response.resultUrls);
  add(response.resultUrl);
  add(response.resultImageUrl);
  add(response.resultImageUrls);
  add(data.resultImageUrls);
  add(data.resultImageUrl);
  add(data.url);
  return Array.from(urls);
}
async function handleKieImageGeneration({
  model,
  provider,
  providerConfig,
  body,
  credentials,
  log
}) {
  const startTime = Date.now();
  const token = credentials?.apiKey || credentials?.accessToken;
  const timeoutMs = normalizePositiveNumber(body.timeout_ms, 300000);
  const pollIntervalMs = normalizePositiveNumber(body.poll_interval_ms, 2500);
  const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
  const size = typeof body.size === "string" ? body.size : undefined;
  if (!token) {
    return saveImageErrorResult({
      provider,
      model,
      status: 401,
      startTime,
      error: "KIE API key is required"
    });
  }
  const fullRegistry = getImageProvider(provider);
  const modelEntry = fullRegistry?.models?.find((m) => m.id === model);
  const isFluxKontext = model === "flux/kontext";
  const isMarket = !isFluxKontext && (modelEntry?.isMarket || model.includes("/"));
  const { imageUrl } = extractImageInputs(body);
  let baseUrl = "";
  let payload = {};
  if (isFluxKontext) {
    baseUrl = `${providerConfig.baseUrl.replace(/\/$/, "")}/api/v1/flux/kontext/generate`;
    payload = {
      prompt,
      aspectRatio: mapImageSize(size),
      model: "flux-kontext-pro",
      ...imageUrl ? { inputImage: imageUrl } : {}
    };
  } else if (isMarket) {
    baseUrl = `${providerConfig.baseUrl.replace(/\/$/, "")}/api/v1/jobs/createTask`;
    const input = {
      prompt,
      aspect_ratio: mapImageSize(size)
    };
    if (imageUrl) {
      input.image_url = imageUrl;
    }
    payload = {
      model: resolveKieMarketUpstreamModelId(model),
      input
    };
  } else {
    const modelPath = model.replace("-t2i", "").replace("-i2i", "");
    baseUrl = providerConfig.baseUrl.includes(model) ? providerConfig.baseUrl : `https://api.kie.ai/api/v1/${modelPath}/generate`;
    payload = {
      prompt,
      size: mapImageSize(size),
      nVariants: body.n || 1
    };
  }
  if (log) {
    const promptPreview = String(body.prompt ?? "").slice(0, 60);
    log.info("IMAGE", `${provider}/${model} (${isFluxKontext ? "flux-kontext" : isMarket ? "market" : "direct"}) | prompt: "${promptPreview}..."`);
  }
  try {
    const endpoint = isFluxKontext ? "/api/v1/flux/kontext/generate" : isMarket ? "/api/v1/jobs/createTask" : new URL(baseUrl).pathname;
    const createBaseUrl = isFluxKontext || isMarket ? providerConfig.baseUrl : baseUrl.replace(endpoint, "");
    const createData = await kieExecutor.createTask({
      baseUrl: createBaseUrl,
      token,
      payload,
      endpoint
    });
    const taskId = getKieTaskId(createData);
    if (!taskId) {
      const errorMessage = createData?.msg || createData?.message || createData?.error || "KIE image generation did not return taskId";
      if (log) {
        log.error("IMAGE", `KIE createTask failed: ${JSON.stringify(createData)}`);
      }
      return saveImageErrorResult({
        provider,
        model,
        status: 502,
        startTime,
        error: errorMessage,
        requestBody: payload
      });
    }
    const statusUrl = isFluxKontext ? `${providerConfig.baseUrl.replace(/\/$/, "")}/api/v1/flux/kontext/record-info` : isMarket ? `${providerConfig.baseUrl.replace(/\/$/, "")}/api/v1/jobs/recordInfo` : providerConfig.statusUrl && !providerConfig.statusUrl.includes("jobs/recordInfo") ? providerConfig.statusUrl : baseUrl.replace(/\/generate$/, "/record-info");
    const { data: recordData, state } = await kieExecutor.pollTask({
      statusUrl,
      taskId: String(taskId),
      token,
      timeoutMs,
      pollIntervalMs
    });
    const kieUrls = state === "success" ? normalizeKieImageResult(recordData) : [];
    if (kieUrls.length > 0) {
      if (log) {
        log.info("IMAGE", `KIE poll success for task ${taskId}`);
      }
      const images = kieUrls.map((url) => ({ url, revised_prompt: prompt }));
      return saveImageSuccessResult({
        provider,
        model,
        startTime,
        requestBody: payload,
        responseBody: { images_count: images.length },
        images
      });
    }
    const record = isJsonObject(recordData) ? recordData : {};
    const recordDataBody = isJsonObject(record.data) ? record.data : {};
    const errorMessage = recordDataBody.errorMessage || recordDataBody.failMsg || record.msg || "KIE image task failed";
    if (log) {
      log.error("IMAGE", `KIE poll failed for task ${taskId}: ${JSON.stringify(recordData)}`);
    }
    return saveImageErrorResult({
      provider,
      model,
      status: 502,
      startTime,
      error: String(errorMessage),
      requestBody: payload
    });
  } catch (err) {
    return saveImageErrorResult({
      provider,
      model,
      status: getKieErrorStatus(err, 502),
      startTime,
      error: `Image provider error: ${getKieErrorMessage(err, "KIE image generation failed")}`
    });
  }
}
function extractImageInputs(body) {
  const imageUrls = [];
  const seen = new Set;
  const pushCandidate = (candidate) => {
    if (typeof candidate !== "string")
      return;
    const trimmed = candidate.trim();
    if (!trimmed || seen.has(trimmed))
      return;
    seen.add(trimmed);
    imageUrls.push(trimmed);
  };
  pushCandidate(body?.image_url);
  pushCandidate(body?.image);
  if (Array.isArray(body?.imageUrls)) {
    for (const candidate of body.imageUrls)
      pushCandidate(candidate);
  }
  if (Array.isArray(body?.image_urls)) {
    for (const candidate of body.image_urls)
      pushCandidate(candidate);
  }
  if (Array.isArray(body?.messages)) {
    for (const msg of body.messages) {
      if (!Array.isArray(msg?.content))
        continue;
      for (const part of msg.content) {
        if (part?.type === "image_url") {
          pushCandidate(part?.image_url?.url);
        }
      }
    }
  }
  return {
    imageUrl: imageUrls[0] || null,
    imageUrls,
    maskUrl: typeof body?.mask_url === "string" ? body.mask_url : typeof body?.mask === "string" ? body.mask : null
  };
}
function normalizePositiveNumber(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0)
    return fallback;
  return Math.floor(n);
}
function normalizeKieSunoModel(model) {
  const map = {
    "suno-v3.5": "V3_5",
    "suno-v4.0": "V4"
  };
  return map[model] || model;
}
function normalizeKieMusicTracks(recordData) {
  const record = isJsonObject(recordData) ? recordData : {};
  const data = isJsonObject(record.data) ? record.data : {};
  const response = isJsonObject(data.response) ? data.response : {};
  const resultJson = parseKieResultJson(recordData);
  const candidates = [
    response.sunoData,
    response.data,
    data.data,
    data.sunoData,
    resultJson.sunoData,
    resultJson.data,
    resultJson.result
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate.map((track) => isJsonObject(track) ? track : typeof track === "string" ? { audioUrl: track } : null).filter((track) => track !== null);
    }
  }
  const singleUrl = response.audioUrl || response.audio_url || data.resultUrl || data.audio_url || resultJson.audioUrl || resultJson.audio_url || resultJson.url;
  return typeof singleUrl === "string" && singleUrl.length > 0 ? [{ audioUrl: singleUrl }] : [];
}
async function handleKieMusicGeneration({
  model,
  provider,
  providerConfig,
  body,
  credentials,
  log
}) {
  const timeoutMs = Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : 300000;
  const pollIntervalMs = Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : 2500;
  const token = credentials?.apiKey || credentials?.accessToken;
  const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
  const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
  if (!token) {
    return { success: false, status: 401, error: "KIE API key is required" };
  }
  const fullRegistry = getMusicProvider(provider);
  const modelEntry = fullRegistry?.models?.find((m) => m.id === model);
  const isMarket = modelEntry?.isMarket || model.includes("/");
  let url = "";
  let payload = {};
  if (isMarket) {
    url = `${baseUrl}/api/v1/jobs/createTask`;
    payload = {
      model,
      callBackUrl: getKieCallbackUrl(body),
      input: {
        prompt,
        instrumental: true
      }
    };
  } else {
    url = `${baseUrl}/api/v1/generate`;
    payload = {
      prompt,
      customMode: false,
      instrumental: true,
      model: normalizeKieSunoModel(model),
      callBackUrl: getKieCallbackUrl(body)
    };
  }
  if (log) {
    const promptPreview = String(body.prompt ?? "").slice(0, 60);
    log.info("MUSIC", `${provider}/${model} (${isMarket ? "market" : "direct"}) | prompt: "${promptPreview}..."`);
  }
  try {
    const endpoint = new URL(url).pathname;
    const createData = await kieExecutor.createTask({ baseUrl, token, payload, endpoint });
    const taskId = getKieTaskId(createData);
    if (!taskId) {
      const errorMessage = createData?.msg || createData?.message || createData?.error || "KIE music generation did not return taskId";
      if (log) {
        log.error("MUSIC", `KIE createTask failed: ${JSON.stringify(createData)}`);
      }
      return { success: false, status: 502, error: errorMessage };
    }
    const statusUrl = isMarket ? `${baseUrl}/api/v1/jobs/recordInfo` : providerConfig.statusUrl && !providerConfig.statusUrl.includes("jobs/recordInfo") ? providerConfig.statusUrl : `${baseUrl}/api/v1/generate/record-info`;
    const { data: recordData, state } = await kieExecutor.pollTask({
      statusUrl,
      taskId: String(taskId),
      token,
      timeoutMs,
      pollIntervalMs
    });
    if (state === "success") {
      const tracks = normalizeKieMusicTracks(recordData);
      const audioFiles = tracks.map((track) => typeof track.audioUrl === "string" ? track.audioUrl : typeof track.audio_url === "string" ? track.audio_url : typeof track.url === "string" ? track.url : null).filter((url) => typeof url === "string" && url.length > 0).map((url) => ({ url, format: "mp3" }));
      return {
        success: true,
        data: { created: Math.floor(Date.now() / 1000), data: audioFiles }
      };
    }
    const record = isJsonObject(recordData) ? recordData : {};
    const data = isJsonObject(record.data) ? record.data : {};
    const errorMessage = data.errorMessage || data.failMsg || record.msg || "KIE music task failed";
    return { success: false, status: 502, error: String(errorMessage) };
  } catch (err) {
    return {
      success: false,
      status: isJsonObject(err) && Number.isFinite(Number(err.status)) ? Number(err.status) : 502,
      error: sanitizeErrorMessage(err) || "Music provider error"
    };
  }
}
async function handleUdioMusicGeneration({
  model,
  provider,
  providerConfig,
  body,
  credentials,
  log
}) {
  const cookie = credentials?.apiKey || credentials?.providerSpecificData?.cookie || "";
  if (!cookie) {
    return { success: false, status: 401, error: "Udio session cookie is required" };
  }
  const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
  if (log) {
    log.info("MUSIC", `${provider}/${model} (udio) | prompt: "${prompt.slice(0, 60)}..."`);
  }
  try {
    const res = await fetchPublic(providerConfig.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ prompt, samplerOptions: { seed: -1 } })
    });
    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, status: res.status, error: errorText };
    }
    const data = await res.json();
    const trackIds = data.track_ids || [];
    if (trackIds.length === 0) {
      return { success: false, status: 502, error: "No tracks returned from Udio" };
    }
    const deadline = Date.now() + 300000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetchPublic(`https://www.udio.com/api/songs?songIds=${trackIds.join(",")}`, { headers: { Cookie: cookie } });
      const songs = await statusRes.json();
      const ready = songs.filter((s) => s.finished && s.song_path);
      if (ready.length > 0) {
        const audioRes = await fetchPublic(ready[0].song_path);
        if (!audioRes.ok) {
          return {
            success: false,
            status: audioRes.status,
            error: `Failed to download audio: ${audioRes.status}`
          };
        }
        const buf = await audioRes.arrayBuffer();
        return {
          success: true,
          data: {
            created: Math.floor(Date.now() / 1000),
            data: [{ b64_json: Buffer.from(buf).toString("base64"), format: "mp3" }]
          }
        };
      }
    }
    return { success: false, status: 504, error: "Udio music generation timed out" };
  } catch (err) {
    if (log)
      log.error("MUSIC", `${provider} udio error: ${err.message}`);
    return {
      success: false,
      status: 502,
      error: sanitizeErrorMessage(err) || "Music provider error"
    };
  }
}
function normalizeKieVideoResult(recordData) {
  const record = isJsonObject(recordData) ? recordData : {};
  const data = isJsonObject(record.data) ? record.data : {};
  const response = isJsonObject(data.response) ? data.response : {};
  const resultJson = parseKieResultJson(recordData);
  const urls = Array.isArray(resultJson?.resultUrls) ? resultJson.resultUrls : Array.isArray(resultJson?.videoUrls) ? resultJson.videoUrls : Array.isArray(response.resultUrls) ? response.resultUrls : [];
  return urls.filter((url) => typeof url === "string" && url.length > 0);
}
async function handleKieVideoGeneration({
  model,
  provider,
  providerConfig,
  body,
  credentials,
  log
}) {
  const timeoutMs = Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : 300000;
  const pollIntervalMs = Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : 2500;
  const token = credentials?.apiKey || credentials?.accessToken;
  const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
  const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
  if (!token) {
    return { success: false, status: 401, error: "KIE API key is required" };
  }
  const payload = {
    model,
    input: {
      prompt,
      duration: body.duration ? String(body.duration) : "5",
      aspect_ratio: typeof body.aspect_ratio === "string" ? body.aspect_ratio : "16:9",
      sound: body.sound === true
    }
  };
  if (log) {
    const promptPreview = String(body.prompt ?? "").slice(0, 60);
    log.info("VIDEO", `${provider}/${model} (kie-video) | prompt: "${promptPreview}..."`);
  }
  try {
    const createData = await kieExecutor.createTask({ baseUrl, token, payload });
    const taskId = getKieTaskId(createData);
    if (!taskId) {
      const errorMessage = createData?.msg || createData?.message || createData?.error || "KIE video generation did not return taskId";
      if (log) {
        log.error("VIDEO", `KIE createTask failed: ${JSON.stringify(createData)}`);
      }
      return { success: false, status: 502, error: errorMessage };
    }
    const statusUrl = providerConfig.statusUrl || `${baseUrl}/api/v1/jobs/recordInfo`;
    const { data: recordData, state } = await kieExecutor.pollTask({
      statusUrl,
      taskId: String(taskId),
      token,
      timeoutMs,
      pollIntervalMs
    });
    if (state === "success") {
      const videoUrls = normalizeKieVideoResult(recordData);
      const videos = videoUrls.map((url) => ({ url, format: "mp4" }));
      return {
        success: true,
        data: { created: Math.floor(Date.now() / 1000), data: videos }
      };
    }
    const record = isJsonObject(recordData) ? recordData : {};
    const data = isJsonObject(record.data) ? record.data : {};
    const errorMessage = data.failMsg || data.errorMessage || record.msg || "KIE video task failed";
    return { success: false, status: 502, error: String(errorMessage) };
  } catch (err) {
    return {
      success: false,
      status: isJsonObject(err) && Number.isFinite(Number(err.status)) ? Number(err.status) : 502,
      error: sanitizeErrorMessage(err) || "Video provider error"
    };
  }
}
async function handleHaiperVideoGeneration({
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
    headers: { "Content-Type": "application/json", HAIPER_KEY: token },
    body: JSON.stringify({ prompt: body.prompt, duration: 4, aspect_ratio: "16:9" })
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
      const videoUrl = status.creation_url || status.output?.video_url;
      if (videoUrl) {
        const videoRes = await fetchPublic(videoUrl);
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
    if (status.status === "failed") {
      return { success: false, status: 502, error: "Haiper video generation failed" };
    }
  }
  return { success: false, status: 504, error: "Haiper video generation timed out" };
}

export { handleKieImageGeneration, handleKieMusicGeneration, handleUdioMusicGeneration, handleKieVideoGeneration, handleHaiperVideoGeneration };
export function saveImageErrorResult({ status = 502, error }) {
  return { success: false, status, error: sanitizeErrorMessage(error) };
}
export function saveImageSuccessResult({ images }) {
  if (!images?.length)
    return { success: false, status: 502, error: "Provider returned no images" };
  return { success: true, data: { created: Math.floor(Date.now() / 1000), data: images } };
}
