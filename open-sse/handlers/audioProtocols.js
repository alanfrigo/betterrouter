import { fetchPublic } from "../../src/shared/utils/ssrfGuard.js";
import { CORS_HEADERS } from "../utils/cors.js";
import { errorResponse } from "../utils/error.js";
import { upstreamErrorResponse } from "../utils/audioResponse.js";
function buildAuthHeaders(config, token) {
  return config.authHeader === "bearer" ? { Authorization: "Bearer " + token } : { [config.authHeader]: token };
}
function normalizeUploadExtension(name) {
  return name.replace(/\.opus$/i, ".ogg");
}
function getUploadedFileName(file) {
  return typeof file.name === "string" && file.name.length > 0 ? normalizeUploadExtension(file.name) : "audio.wav";
}
export async function buildMultipartBody(file, fields, fileFieldName = "file") {
  const boundary = "----OmniRouteAudioBoundary" + Date.now().toString(36);
  const parts = [];
  const encoder = new TextEncoder;
  for (const [name, value] of Object.entries(fields)) {
    parts.push(encoder.encode(`--${boundary}\r
Content-Disposition: form-data; name="${name}"\r
\r
${value}\r
`));
  }
  const fileName = getUploadedFileName(file).replace(/["]/g, "_").replace(/[\r\n]/g, "_");
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  parts.push(encoder.encode(`--${boundary}\r
Content-Disposition: form-data; name="${fileFieldName}"; filename="${fileName}"\r
Content-Type: ${file.type || "application/octet-stream"}\r
\r
`));
  parts.push(fileBytes);
  parts.push(encoder.encode(`\r
--${boundary}--\r
`));
  const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
  const body = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    body.set(part, offset);
    offset += part.length;
  }
  return { body, contentType: "multipart/form-data; boundary=" + boundary };
}
function resolveAudioContentType(file) {
  const browserType = (file.type || "").toLowerCase();
  const fileName = typeof file.name === "string" ? file.name.toLowerCase() : "";
  if (browserType.startsWith("audio/"))
    return browserType;
  const ext = fileName.includes(".") ? fileName.split(".").pop() : "";
  const EXT_TO_MIME = {
    mp3: "audio/mpeg",
    mp4: "audio/mp4",
    m4a: "audio/mp4",
    wav: "audio/wav",
    ogg: "audio/ogg",
    flac: "audio/flac",
    webm: "audio/webm",
    aac: "audio/aac",
    wma: "audio/x-ms-wma",
    opus: "audio/opus"
  };
  if (ext && EXT_TO_MIME[ext])
    return EXT_TO_MIME[ext];
  return "application/octet-stream";
}
async function handleGladiaTranscription(providerConfig, file, modelId, token) {
  const authHeaders = buildAuthHeaders(providerConfig, token);
  const { body: uploadBody, contentType: uploadCT } = await buildMultipartBody(file, {});
  const uploadRes = await fetchPublic("https://api.gladia.io/v2/upload", {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": uploadCT },
    body: uploadBody
  });
  if (!uploadRes.ok) {
    return upstreamErrorResponse(uploadRes, await uploadRes.text());
  }
  const { audio_url } = await uploadRes.json();
  const submitRes = await fetchPublic(providerConfig.baseUrl, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ audio_url, model: modelId })
  });
  if (!submitRes.ok) {
    return upstreamErrorResponse(submitRes, await submitRes.text());
  }
  const { result_url: resultUrl } = await submitRes.json();
  if (!resultUrl) {
    return errorResponse(502, "Gladia did not return a result_url");
  }
  const maxWait = 120000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetchPublic(resultUrl, { headers: authHeaders });
    if (!pollRes.ok)
      continue;
    const result = await pollRes.json();
    if (result.status === "done") {
      const text = result.result?.transcription?.full_transcript || "";
      return Response.json({ text }, { headers: { ...CORS_HEADERS } });
    }
    if (result.status === "error") {
      return errorResponse(500, result.error_code || result.error || "Gladia transcription failed");
    }
  }
  return errorResponse(504, "Gladia transcription timed out after 120s");
}
function readSonioxOptions(formData) {
  const str = (key) => {
    const value = formData?.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  const flag = (...keys) => keys.some((key) => /^(1|true|yes|on)$/i.test(str(key)));
  const granularities = (formData?.getAll?.("timestamp_granularities[]") ?? []).map((value) => String(value).toLowerCase());
  const diarize = flag("enable_speaker_diarization", "diarization", "speaker_labels");
  const responseFormat = str("response_format").toLowerCase();
  return {
    diarize,
    context: str("context"),
    language: str("language"),
    verbose: diarize || responseFormat === "verbose_json",
    wantWords: granularities.includes("word")
  };
}
function groupSonioxTokensBySpeaker(tokens) {
  const segments = [];
  for (const token of tokens) {
    const speaker = token.speaker == null ? null : String(token.speaker);
    const previous = segments[segments.length - 1];
    if (!previous || previous.speaker !== speaker) {
      segments.push({
        speaker,
        startMs: token.start_ms ?? 0,
        endMs: token.end_ms ?? token.start_ms ?? 0,
        text: token.text ?? ""
      });
      continue;
    }
    previous.endMs = token.end_ms ?? previous.endMs;
    previous.text += token.text ?? "";
  }
  return segments;
}
async function handleSonioxTranscription(providerConfig, file, modelId, token, formData) {
  const authHeaders = buildAuthHeaders(providerConfig, token);
  const options = readSonioxOptions(formData);
  const { body: uploadBody, contentType: uploadContentType } = await buildMultipartBody(file, {});
  const uploadRes = await fetchPublic("https://api.soniox.com/v1/files", {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": uploadContentType },
    body: uploadBody
  });
  if (!uploadRes.ok) {
    return upstreamErrorResponse(uploadRes, await uploadRes.text());
  }
  const fileId = (await uploadRes.json()).id;
  const jobBody = {
    model: modelId,
    file_id: fileId,
    enable_language_identification: true
  };
  if (options.diarize)
    jobBody.enable_speaker_diarization = true;
  if (options.context)
    jobBody.context = options.context;
  if (options.language)
    jobBody.language_hints = [options.language];
  const createRes = await fetchPublic(providerConfig.baseUrl, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(jobBody)
  });
  if (!createRes.ok) {
    return upstreamErrorResponse(createRes, await createRes.text());
  }
  const { id: transcriptionId } = await createRes.json();
  const statusUrl = `${providerConfig.baseUrl}/${transcriptionId}`;
  const maxWait = 120000;
  const start = Date.now();
  let completed = false;
  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetchPublic(statusUrl, { headers: authHeaders });
    if (!pollRes.ok) {
      continue;
    }
    const result = await pollRes.json();
    if (result.status === "completed") {
      completed = true;
      break;
    }
    if (result.status === "error") {
      return errorResponse(500, result.error_message || result.error || "Soniox transcription failed");
    }
  }
  if (!completed) {
    return errorResponse(504, "Soniox transcription timed out after 120s");
  }
  const transcriptRes = await fetchPublic(`${statusUrl}/transcript`, { headers: authHeaders });
  if (!transcriptRes.ok) {
    return upstreamErrorResponse(transcriptRes, await transcriptRes.text());
  }
  const transcript = await transcriptRes.json();
  const tokens = Array.isArray(transcript.tokens) ? transcript.tokens : [];
  const text = typeof transcript.text === "string" && transcript.text.length > 0 ? transcript.text : tokens.map((t) => t.text ?? "").join("");
  if (!options.verbose) {
    return Response.json({ text }, { headers: { ...CORS_HEADERS } });
  }
  const segments = groupSonioxTokensBySpeaker(tokens).map((segment, index) => ({
    id: index,
    start: segment.startMs / 1000,
    end: segment.endMs / 1000,
    text: segment.text.trim(),
    ...segment.speaker !== null ? { speaker: segment.speaker } : {}
  }));
  const language = tokens.find((t) => typeof t.language === "string" && t.language)?.language;
  const durationMs = tokens.length ? tokens[tokens.length - 1].end_ms ?? 0 : 0;
  return Response.json({
    task: "transcribe",
    ...language ? { language } : {},
    duration: durationMs / 1000,
    text,
    segments,
    ...options.wantWords ? {
      words: tokens.map((t) => ({
        word: t.text ?? "",
        start: (t.start_ms ?? 0) / 1000,
        end: (t.end_ms ?? 0) / 1000,
        ...t.speaker != null ? { speaker: String(t.speaker) } : {}
      }))
    } : {}
  }, { headers: { ...CORS_HEADERS } });
}
async function handleRevAiTranscription(providerConfig, file, modelId, token) {
  const authHeaders = buildAuthHeaders(providerConfig, token);
  const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
  const options = JSON.stringify({ transcriber: modelId });
  const { body, contentType } = await buildMultipartBody(file, { options }, "media");
  const submitRes = await fetchPublic(`${baseUrl}/jobs`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": contentType },
    body
  });
  if (!submitRes.ok) {
    return upstreamErrorResponse(submitRes, await submitRes.text());
  }
  const { id: jobId } = await submitRes.json();
  const jobUrl = `${baseUrl}/jobs/${jobId}`;
  const maxWait = 120000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetchPublic(jobUrl, { headers: authHeaders });
    if (!pollRes.ok)
      continue;
    const result = await pollRes.json();
    if (result.status === "transcribed") {
      const transcriptRes = await fetchPublic(`${jobUrl}/transcript`, {
        headers: { ...authHeaders, Accept: "text/plain" }
      });
      if (!transcriptRes.ok) {
        return upstreamErrorResponse(transcriptRes, await transcriptRes.text());
      }
      const text = await transcriptRes.text();
      return Response.json({ text: text || "" }, { headers: { ...CORS_HEADERS } });
    }
    if (result.status === "failed") {
      return errorResponse(500, result.failure_detail || "Rev AI transcription failed");
    }
  }
  return errorResponse(504, "Rev AI transcription timed out after 120s");
}
function speechmaticsOperatingPoint(modelId) {
  return modelId;
}
async function fetchSpeechmaticsTranscript(jobUrl, authHeaders) {
  const transcriptRes = await fetchPublic(`${jobUrl}/transcript?format=txt`, {
    headers: { ...authHeaders, Accept: "text/plain" }
  });
  if (!transcriptRes.ok) {
    return upstreamErrorResponse(transcriptRes, await transcriptRes.text());
  }
  const text = await transcriptRes.text();
  return Response.json({ text: text || "" }, { headers: { ...CORS_HEADERS } });
}
function speechmaticsJobErrorMessage(result) {
  const errors = result?.job?.errors;
  const first = Array.isArray(errors) ? errors[0] : null;
  return first?.message || "Speechmatics transcription failed";
}
async function pollSpeechmaticsJob(jobUrl, authHeaders) {
  const maxWait = 120000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetchPublic(jobUrl, { headers: authHeaders });
    if (!pollRes.ok)
      continue;
    const result = await pollRes.json();
    const status = result?.job?.status;
    if (status === "done") {
      return fetchSpeechmaticsTranscript(jobUrl, authHeaders);
    }
    if (status === "rejected") {
      return errorResponse(500, speechmaticsJobErrorMessage(result));
    }
  }
  return errorResponse(504, "Speechmatics transcription timed out after 120s");
}
async function handleSpeechmaticsTranscription(providerConfig, file, modelId, token) {
  const authHeaders = buildAuthHeaders(providerConfig, token);
  const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
  const config = JSON.stringify({
    type: "transcription",
    transcription_config: { operating_point: speechmaticsOperatingPoint(modelId) }
  });
  const { body, contentType } = await buildMultipartBody(file, { config }, "data_file");
  const submitRes = await fetchPublic(baseUrl, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": contentType },
    body
  });
  if (!submitRes.ok) {
    return upstreamErrorResponse(submitRes, await submitRes.text());
  }
  const { id: jobId } = await submitRes.json();
  if (!jobId) {
    return errorResponse(502, "Speechmatics did not return a job id");
  }
  return pollSpeechmaticsJob(`${baseUrl}/${jobId}`, authHeaders);
}
const HANDLERS = { gladia: handleGladiaTranscription, soniox: handleSonioxTranscription, "rev-ai": handleRevAiTranscription, speechmatics: handleSpeechmaticsTranscription };
export async function transcribeAudioProtocol(cfg, file, model, token, formData) {
  const response = await HANDLERS[cfg.format](cfg, file, model, token, formData);
  return { success: response.ok, response, status: response.status };
}
