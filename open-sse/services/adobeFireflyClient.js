import { fetchPublic } from "../../src/shared/utils/ssrfGuard.js";
import { sanitizeErrorMessage } from "../utils/mediaProtocolErrors.js";
import {
  buildAdobeSubmitHeaders,
  hasBrowserAdobeArpSession,
  resolveAdobeArpSessionId
} from "./adobeFireflyArp.js";
import {
  ADOBE_FIREFLY_IMAGE_SUBMIT_URL,
  ADOBE_FIREFLY_VIDEO_SUBMIT_URL,
  DEFAULT_IMAGE_TIMEOUT_MS,
  DEFAULT_VIDEO_TIMEOUT_MS
} from "./adobeFireflyCatalog.js";
import { AdobeFireflyError, extractAdobeCookieHeader } from "./adobeFireflyCredentials.js";
import {
  buildAdobeImagePayload,
  buildAdobeVideoPayload,
  normalizeAdobeAspectRatio,
  normalizeAdobeOutputResolution,
  resolveAdobeImageModel,
  resolveAdobeVideoModel
} from "./adobeFireflyPayload.js";
import { pollAdobeJob, sleep } from "./adobeFireflyPoll.js";
import {
  extractAdobeResultLink,
  formatAdobeSystemUnderLoadError,
  isAdobeTransientSubmitError,
  normalizeAdobePollUrl
} from "./adobeFireflyResponses.js";
export { decodeAdobeJwtPayload } from "./adobeFireflySecurity.js";
export {
  extractAdobeSourceImageReferences,
  normalizeAdobeReferenceBlobs
} from "./adobeFireflyReferences.js";
export {
  discoverAdobeFireflyModels,
  fetchAdobeCreditsBalance,
  parseAdobeCreditsBalance,
  parseAdobeModelsDiscovery
} from "./adobeFireflyAccount.js";
export {
  ADOBE_FIREFLY_ARKOSE_PUBLIC_KEY,
  ADOBE_FIREFLY_FTR_MAGIC,
  ADOBE_FIREFLY_MAX_UPLOAD_BYTES,
  buildAdobeArpSessionId,
  buildAdobeSubmitHeaders,
  buildAdobeSubmitNonce,
  buildAdobeUploadHeaders,
  extractAdobeArpSessionId,
  generateAdobeNonce,
  hasBrowserAdobeArpSession,
  isValidAdobeArpSessionId,
  resolveAdobeArpSessionId
} from "./adobeFireflyArp.js";
export {
  ADOBE_FIREFLY_CREDITS_BALANCE_URL,
  ADOBE_FIREFLY_IMAGE_MODELS,
  ADOBE_FIREFLY_IMAGE_SUBMIT_URL,
  ADOBE_FIREFLY_IMAGE_UPLOAD_URL,
  ADOBE_FIREFLY_IMS_REFRESH_URL,
  ADOBE_FIREFLY_IMS_SCOPE,
  ADOBE_FIREFLY_MODELS_DISCOVERY_URL,
  ADOBE_FIREFLY_VIDEO_MODELS,
  ADOBE_FIREFLY_VIDEO_SUBMIT_URL
} from "./adobeFireflyCatalog.js";
export {
  AdobeFireflyError,
  adobeFireflyApiKey,
  adobeFireflyBalanceApiKey,
  adobeFireflyExpressClientId,
  extractAdobeAccountIdFromToken,
  extractAdobeCookieHeader,
  extractAdobeCredentialToken,
  isAdobeGuestAccessToken,
  isAdobeUserAccessToken,
  looksLikeAdobeCookieBlob,
  looksLikeAdobeJwt
} from "./adobeFireflyCredentials.js";
export { exchangeAdobeCookieForAccessToken, resolveAdobeAccessToken } from "./adobeFireflyIms.js";
export {
  buildAdobeImagePayload,
  buildAdobeVideoPayload,
  normalizeAdobeAspectRatio,
  normalizeAdobeOutputResolution,
  resolveAdobeImageModel,
  resolveAdobeVideoModel
} from "./adobeFireflyPayload.js";
export { pollAdobeJob } from "./adobeFireflyPoll.js";
export {
  buildAdobeBalanceHeaders,
  buildAdobeDiscoveryHeaders,
  buildAdobePollHeaders,
  extractAdobeMediaUrl,
  extractAdobeResultLink,
  formatAdobeSystemUnderLoadError,
  isAdobeJobFailed,
  isAdobeJobInProgress,
  isAdobeTransientSubmitError,
  normalizeAdobePollUrl
} from "./adobeFireflyResponses.js";
export {
  extractAdobeSourceImageSources,
  parseAdobeImageSourceBytes,
  parseAdobeStorageUploadResponse,
  resolveAdobeSourceImageIds,
  uploadAdobeFireflyImage
} from "./adobeFireflyUpload.js";
const SUBMIT_MAX_ATTEMPTS = 5;
function submitBaseDelayMs() {
  if (process.env.ADOBE_FIREFLY_SUBMIT_BASE_DELAY_MS != null && process.env.ADOBE_FIREFLY_SUBMIT_BASE_DELAY_MS !== "") {
    return Math.max(0, Number(process.env.ADOBE_FIREFLY_SUBMIT_BASE_DELAY_MS) || 0);
  }
  if (process.env.VITEST || process.env.NODE_TEST_CONTEXT)
    return 20;
  return 8000;
}
export async function adobeFireflyGenerateImage(opts) {
  const fetchImpl = opts.fetchImpl || fetch;
  const { spec } = resolveAdobeImageModel(opts.model);
  const aspectRatio = normalizeAdobeAspectRatio(opts.aspectRatio ?? opts.size, "1:1");
  const outputResolution = normalizeAdobeOutputResolution(opts.quality, opts.size);
  const payload = buildAdobeImagePayload({
    prompt: opts.prompt,
    aspectRatio,
    outputResolution,
    modelSpec: spec,
    quality: opts.quality,
    seed: opts.seed,
    sourceImageIds: opts.sourceImageIds,
    negativePrompt: opts.negativePrompt
  });
  const sessionCookie = String(opts.sessionCookie || "").trim();
  let activeCookie = extractAdobeCookieHeader(sessionCookie) || sessionCookie;
  const hadBrowserArp = hasBrowserAdobeArpSession(activeCookie);
  let arpSessionId = opts.arpSessionId && String(opts.arpSessionId).trim() || resolveAdobeArpSessionId(activeCookie);
  let submitData = {};
  let submitHeaders = new Headers;
  let lastSubmitError = "";
  let sawSystemUnderLoad = false;
  let accessToken = opts.accessToken;
  let authRefreshAttempted = false;
  const {
    withAdobeFireflySubmitGate,
    markAdobeFireflyArpSuccess,
    noteAdobeFireflySubmitFailure,
    rotateAdobeFireflySessionOnError,
    resolveAdobeArpSessionIdSmart,
    fingerprintAdobeCredential,
    estimateAdobeTokenExpiry
  } = await import("./adobeFireflySession.js");
  const fingerprint = String(opts.sessionFingerprint || "").trim() || fingerprintAdobeCredential([accessToken, activeCookie].filter(Boolean).join(`
`));
  const browserSessionKey = String(opts.sessionBrowserKey || "").trim() || fingerprint;
  let submitOk = false;
  for (let attempt = 1;attempt <= SUBMIT_MAX_ATTEMPTS; attempt++) {
    const submitResp = await withAdobeFireflySubmitGate(() => fetchImpl(ADOBE_FIREFLY_IMAGE_SUBMIT_URL, {
      method: "POST",
      headers: buildAdobeSubmitHeaders(accessToken, {
        arpSessionId,
        prompt: opts.prompt,
        cookie: activeCookie || undefined
      }),
      body: JSON.stringify(payload)
    }));
    if (submitResp.status === 401 || submitResp.status === 403) {
      noteAdobeFireflySubmitFailure();
      const accessError = submitResp.headers.get("x-access-error") || "";
      if (accessError === "taste_exhausted") {
        throw new AdobeFireflyError("Adobe Firefly quota exhausted for this account", 429, "quota_exhausted");
      }
      if (!authRefreshAttempted && attempt < SUBMIT_MAX_ATTEMPTS) {
        authRefreshAttempted = true;
        const refreshed = await rotateAdobeFireflySessionOnError({
          accessToken,
          cookie: activeCookie,
          arpSessionId,
          tokenExpiresAt: estimateAdobeTokenExpiry(accessToken),
          updatedAt: Date.now(),
          fingerprint,
          browserSessionKey,
          source: "rebuild"
        }, { attempt, authFailure: true, tryBrowser: true, log: opts.log }).catch(() => null);
        if (refreshed?.accessToken && refreshed?.arpSessionId) {
          accessToken = refreshed.accessToken;
          activeCookie = refreshed.cookie || activeCookie;
          arpSessionId = refreshed.arpSessionId;
          opts.log?.info?.("ADOBE-FIREFLY", `image submit auth ${submitResp.status}; retrying once with renewed CDP session`);
          continue;
        }
      }
      throw new AdobeFireflyError("Adobe Firefly session is no longer authenticated and automatic browser renewal failed. Sign in once through the Adobe Firefly browser login to restore durable renewal.", 401, "auth");
    }
    if (!submitResp.ok) {
      const text = await submitResp.text().catch(() => "");
      if (isAdobeTransientSubmitError(submitResp.status, text)) {
        sawSystemUnderLoad = true;
      }
      lastSubmitError = `Adobe Firefly image submit failed (${submitResp.status}): ${sanitizeErrorMessage(text.slice(0, 300))}`;
      if (isAdobeTransientSubmitError(submitResp.status, text) && attempt < SUBMIT_MAX_ATTEMPTS) {
        const { getAdobeForterAgeMs: forterAgeMsFn, extractAdobeForterTimestampMs: forterTsFn } = await import("./adobeFireflySession.js");
        const forterTs = forterTsFn(activeCookie || "");
        const forterAgeBefore = forterAgeMsFn(activeCookie || "");
        const forterKnownStale = forterTs > 0 && Number.isFinite(forterAgeBefore) && forterAgeBefore > 240000;
        if (forterKnownStale && attempt >= 2) {
          noteAdobeFireflySubmitFailure();
          throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("image", attempt, { hadBrowserArp }) + " Risk session looks expired — open Providers → Adobe Firefly → Sign in with browser once.", 408, "system_under_load");
        }
        try {
          if (activeCookie) {
            const rotated = await rotateAdobeFireflySessionOnError({
              accessToken,
              cookie: activeCookie,
              arpSessionId,
              tokenExpiresAt: estimateAdobeTokenExpiry(accessToken),
              updatedAt: Date.now(),
              fingerprint,
              browserSessionKey,
              source: "rebuild"
            }, {
              attempt,
              tryBrowser: process.env.ADOBE_FIREFLY_BROWSER_REFRESH !== "0",
              log: opts.log
            });
            accessToken = rotated.accessToken || accessToken;
            activeCookie = rotated.cookie || activeCookie;
            arpSessionId = rotated.arpSessionId;
          } else {
            arpSessionId = resolveAdobeArpSessionIdSmart(sessionCookie, {
              rotate: true
            });
          }
        } catch {}
        const base = submitBaseDelayMs();
        const delay = base <= 50 ? base : Math.min(90000, base * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 1500);
        opts.log?.info?.("ADOBE-FIREFLY", `image submit transient ${submitResp.status}, retry ${attempt}/${SUBMIT_MAX_ATTEMPTS} in ${delay}ms (recovery attempt=${attempt})`);
        await sleep(delay);
        continue;
      }
      noteAdobeFireflySubmitFailure();
      if (sawSystemUnderLoad && isAdobeTransientSubmitError(submitResp.status, text)) {
        throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("image", attempt, {
          hadBrowserArp
        }), 408, "system_under_load");
      }
      throw new AdobeFireflyError(lastSubmitError, submitResp.status >= 400 && submitResp.status < 500 ? submitResp.status : 502);
    }
    submitData = await submitResp.json().catch(() => ({}));
    submitHeaders = submitResp.headers;
    markAdobeFireflyArpSuccess(fingerprint, arpSessionId);
    submitOk = true;
    break;
  }
  if (!submitOk && !lastSubmitError) {
    throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("image", SUBMIT_MAX_ATTEMPTS, { hadBrowserArp }), 408, "system_under_load");
  }
  let pollUrl = extractAdobeResultLink(submitHeaders, submitData);
  if (!pollUrl) {
    if (sawSystemUnderLoad) {
      throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("image", SUBMIT_MAX_ATTEMPTS, {
        hadBrowserArp
      }), 408, "system_under_load");
    }
    throw new AdobeFireflyError(lastSubmitError || "Adobe Firefly image submit succeeded but no poll URL was returned", 502);
  }
  pollUrl = normalizeAdobePollUrl(pollUrl);
  const { mediaUrl, latest } = await pollAdobeJob({
    pollUrl,
    accessToken,
    kind: "image",
    timeoutMs: opts.timeoutMs && opts.timeoutMs > 0 ? opts.timeoutMs : DEFAULT_IMAGE_TIMEOUT_MS,
    fetchImpl,
    log: opts.log
  });
  return { url: mediaUrl, latest };
}
export async function adobeFireflyGenerateVideo(opts) {
  const fetchImpl = opts.fetchImpl || fetch;
  const { spec } = resolveAdobeVideoModel(opts.model);
  const aspectRatio = normalizeAdobeAspectRatio(opts.aspectRatio ?? opts.size, "16:9");
  const duration = typeof opts.duration === "number" ? opts.duration : typeof opts.duration === "string" && opts.duration.trim() ? Number(opts.duration) : spec.defaultDuration;
  const resolution = typeof opts.resolution === "string" && opts.resolution.trim() ? opts.resolution : typeof opts.quality === "string" && /p$/i.test(opts.quality) ? opts.quality : spec.defaultResolution;
  const payload = buildAdobeVideoPayload({
    prompt: opts.prompt,
    aspectRatio,
    duration: Number.isFinite(duration) ? Number(duration) : spec.defaultDuration,
    modelSpec: spec,
    resolution,
    seed: opts.seed,
    sourceImageIds: opts.sourceImageIds,
    negativePrompt: opts.negativePrompt,
    generateAudio: opts.generateAudio
  });
  const sessionCookie = String(opts.sessionCookie || "").trim();
  let activeCookie = extractAdobeCookieHeader(sessionCookie) || sessionCookie;
  const hadBrowserArp = hasBrowserAdobeArpSession(activeCookie);
  let arpSessionId = opts.arpSessionId && String(opts.arpSessionId).trim() || resolveAdobeArpSessionId(activeCookie);
  let submitData = {};
  let submitHeaders = new Headers;
  let lastSubmitError = "";
  let sawSystemUnderLoad = false;
  let accessToken = opts.accessToken;
  let authRefreshAttempted = false;
  const {
    withAdobeFireflySubmitGate,
    markAdobeFireflyArpSuccess,
    noteAdobeFireflySubmitFailure,
    rotateAdobeFireflySessionOnError,
    resolveAdobeArpSessionIdSmart,
    fingerprintAdobeCredential,
    estimateAdobeTokenExpiry
  } = await import("./adobeFireflySession.js");
  const fingerprint = String(opts.sessionFingerprint || "").trim() || fingerprintAdobeCredential([accessToken, activeCookie].filter(Boolean).join(`
`));
  const browserSessionKey = String(opts.sessionBrowserKey || "").trim() || fingerprint;
  let videoSubmitOk = false;
  for (let attempt = 1;attempt <= SUBMIT_MAX_ATTEMPTS; attempt++) {
    const submitResp = await withAdobeFireflySubmitGate(() => fetchImpl(ADOBE_FIREFLY_VIDEO_SUBMIT_URL, {
      method: "POST",
      headers: buildAdobeSubmitHeaders(accessToken, {
        arpSessionId,
        prompt: opts.prompt,
        cookie: activeCookie || undefined
      }),
      body: JSON.stringify(payload)
    }));
    if (submitResp.status === 401 || submitResp.status === 403) {
      noteAdobeFireflySubmitFailure();
      const accessError = submitResp.headers.get("x-access-error") || "";
      if (accessError === "taste_exhausted") {
        throw new AdobeFireflyError("Adobe Firefly quota exhausted for this account", 429, "quota_exhausted");
      }
      if (!authRefreshAttempted && attempt < SUBMIT_MAX_ATTEMPTS) {
        authRefreshAttempted = true;
        const refreshed = await rotateAdobeFireflySessionOnError({
          accessToken,
          cookie: activeCookie,
          arpSessionId,
          tokenExpiresAt: estimateAdobeTokenExpiry(accessToken),
          updatedAt: Date.now(),
          fingerprint,
          browserSessionKey,
          source: "rebuild"
        }, { attempt, authFailure: true, tryBrowser: true, log: opts.log }).catch(() => null);
        if (refreshed?.accessToken && refreshed?.arpSessionId) {
          accessToken = refreshed.accessToken;
          activeCookie = refreshed.cookie || activeCookie;
          arpSessionId = refreshed.arpSessionId;
          opts.log?.info?.("ADOBE-FIREFLY", `video submit auth ${submitResp.status}; retrying once with renewed CDP session`);
          continue;
        }
      }
      throw new AdobeFireflyError("Adobe Firefly session is no longer authenticated and automatic browser renewal failed. Sign in once through the Adobe Firefly browser login to restore durable renewal.", 401, "auth");
    }
    if (!submitResp.ok) {
      const text = await submitResp.text().catch(() => "");
      if (isAdobeTransientSubmitError(submitResp.status, text)) {
        sawSystemUnderLoad = true;
      }
      lastSubmitError = `Adobe Firefly video submit failed (${submitResp.status}): ${sanitizeErrorMessage(text.slice(0, 300))}`;
      if (isAdobeTransientSubmitError(submitResp.status, text) && attempt < SUBMIT_MAX_ATTEMPTS) {
        const { getAdobeForterAgeMs: forterAgeMsFn, extractAdobeForterTimestampMs: forterTsFn } = await import("./adobeFireflySession.js");
        const forterTs = forterTsFn(activeCookie || "");
        const forterAgeBefore = forterAgeMsFn(activeCookie || "");
        const forterKnownStale = forterTs > 0 && Number.isFinite(forterAgeBefore) && forterAgeBefore > 240000;
        if (forterKnownStale && attempt >= 2) {
          noteAdobeFireflySubmitFailure();
          throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("video", attempt, { hadBrowserArp }) + " Risk session looks expired — open Providers → Adobe Firefly → Sign in with browser once.", 408, "system_under_load");
        }
        try {
          if (activeCookie) {
            const rotated = await rotateAdobeFireflySessionOnError({
              accessToken,
              cookie: activeCookie,
              arpSessionId,
              tokenExpiresAt: estimateAdobeTokenExpiry(accessToken),
              updatedAt: Date.now(),
              fingerprint,
              browserSessionKey,
              source: "rebuild"
            }, {
              attempt,
              tryBrowser: process.env.ADOBE_FIREFLY_BROWSER_REFRESH !== "0",
              log: opts.log
            });
            accessToken = rotated.accessToken || accessToken;
            activeCookie = rotated.cookie || activeCookie;
            arpSessionId = rotated.arpSessionId;
          } else {
            arpSessionId = resolveAdobeArpSessionIdSmart(sessionCookie, {
              rotate: true
            });
          }
        } catch {}
        const base = submitBaseDelayMs();
        const delay = base <= 50 ? base : Math.min(90000, base * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 1500);
        opts.log?.info?.("ADOBE-FIREFLY", `video submit transient ${submitResp.status}, retry ${attempt}/${SUBMIT_MAX_ATTEMPTS} in ${delay}ms (recovery attempt=${attempt})`);
        await sleep(delay);
        continue;
      }
      noteAdobeFireflySubmitFailure();
      if (sawSystemUnderLoad && isAdobeTransientSubmitError(submitResp.status, text)) {
        throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("video", attempt, {
          hadBrowserArp
        }), 408, "system_under_load");
      }
      throw new AdobeFireflyError(lastSubmitError, submitResp.status >= 400 && submitResp.status < 500 ? submitResp.status : 502);
    }
    submitData = await submitResp.json().catch(() => ({}));
    submitHeaders = submitResp.headers;
    markAdobeFireflyArpSuccess(fingerprint, arpSessionId);
    videoSubmitOk = true;
    break;
  }
  if (!videoSubmitOk && !lastSubmitError) {
    throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("video", SUBMIT_MAX_ATTEMPTS, { hadBrowserArp }), 408, "system_under_load");
  }
  let pollUrl = extractAdobeResultLink(submitHeaders, submitData);
  if (!pollUrl) {
    if (sawSystemUnderLoad) {
      throw new AdobeFireflyError(formatAdobeSystemUnderLoadError("video", SUBMIT_MAX_ATTEMPTS, {
        hadBrowserArp
      }), 408, "system_under_load");
    }
    throw new AdobeFireflyError(lastSubmitError || "Adobe Firefly video submit succeeded but no poll URL was returned", 502);
  }
  pollUrl = normalizeAdobePollUrl(pollUrl);
  const { mediaUrl, latest } = await pollAdobeJob({
    pollUrl,
    accessToken,
    kind: "video",
    timeoutMs: opts.timeoutMs && opts.timeoutMs > 0 ? opts.timeoutMs : DEFAULT_VIDEO_TIMEOUT_MS,
    sessionCookie: activeCookie || sessionCookie || undefined,
    sessionFingerprint: fingerprint,
    fetchImpl,
    log: opts.log
  });
  return { url: mediaUrl, format: "mp4", latest };
}
