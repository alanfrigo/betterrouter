import { fetchPublic } from "../../src/shared/utils/ssrfGuard.js";
import {
  fetchUntrustedRemoteImage
} from "../../src/shared/network/remoteImageFetch.js";
import { sanitizeErrorMessage } from "../utils/mediaProtocolErrors.js";
import {
  ADOBE_FIREFLY_MAX_UPLOAD_BYTES,
  buildAdobeUploadHeaders,
  resolveAdobeArpSessionId
} from "./adobeFireflyArp.js";
import { ADOBE_FIREFLY_IMAGE_UPLOAD_URL } from "./adobeFireflyCatalog.js";
import { AdobeFireflyError, extractAdobeCookieHeader } from "./adobeFireflyCredentials.js";
export function extractAdobeSourceImageSources(body, max = 4) {
  if (!body || typeof body !== "object")
    return [];
  const b = body;
  const po = b.provider_options && typeof b.provider_options === "object" && !Array.isArray(b.provider_options) ? b.provider_options : {};
  const out = [];
  const seen = new Set;
  const push = (v) => {
    if (out.length >= max)
      return;
    if (typeof v === "string") {
      const t = v.trim();
      if (!t || seen.has(t))
        return;
      if (t === "null" || t === "undefined")
        return;
      seen.add(t);
      out.push(t);
      return;
    }
    if (Array.isArray(v)) {
      for (const item of v) {
        if (out.length >= max)
          break;
        push(item);
      }
      return;
    }
    if (v && typeof v === "object") {
      const o = v;
      if (typeof o.url === "string")
        push(o.url);
      else if (typeof o.image_url === "string")
        push(o.image_url);
      else if (o.image_url && typeof o.image_url === "object") {
        const inner = o.image_url.url;
        if (typeof inner === "string")
          push(inner);
      } else if (typeof o.b64_json === "string") {
        push(`data:image/png;base64,${o.b64_json}`);
      } else if (typeof o.base64 === "string") {
        push(`data:image/png;base64,${o.base64}`);
      }
    }
  };
  const keys = [
    "image_url",
    "imageUrl",
    "input_image",
    "source_image",
    "promptImage",
    "prompt_image",
    "image",
    "images",
    "image_urls",
    "imageUrls",
    "input_images",
    "reference_images",
    "referenceImages",
    "reference_image"
  ];
  for (const k of keys) {
    push(b[k]);
    push(po[k]);
  }
  if (Array.isArray(b.messages)) {
    for (const msg of b.messages) {
      if (!msg || typeof msg !== "object")
        continue;
      const content = msg.content;
      if (!Array.isArray(content))
        continue;
      for (const part of content) {
        if (!part || typeof part !== "object")
          continue;
        const p = part;
        if (p.type === "image_url" || p.type === "image") {
          push(p.image_url ?? p.image ?? p.url);
        }
      }
    }
  }
  return out.slice(0, max);
}
export function parseAdobeImageSourceBytes(source) {
  const trimmed = String(source || "").trim();
  if (!trimmed) {
    throw new AdobeFireflyError("Empty image reference", 400, "bad_image");
  }
  const dataUri = /^data:([^;,]+)?(?:;charset=[^;,]+)?(;base64)?,([\s\S]+)$/i.exec(trimmed);
  if (dataUri) {
    const mime = (dataUri[1] || "image/png").trim().toLowerCase() || "image/png";
    const isB64 = Boolean(dataUri[2]);
    const payload = dataUri[3] || "";
    if (!isB64) {
      throw new AdobeFireflyError("Image data URL must be base64-encoded (data:image/...;base64,...)", 400, "bad_image");
    }
    const buffer = Buffer.from(payload.replace(/\s/g, ""), "base64");
    if (!buffer.length) {
      throw new AdobeFireflyError("Image data URL decoded to empty bytes", 400, "bad_image");
    }
    if (buffer.length > ADOBE_FIREFLY_MAX_UPLOAD_BYTES) {
      throw new AdobeFireflyError(`Image reference too large (${buffer.length} bytes; max ${ADOBE_FIREFLY_MAX_UPLOAD_BYTES})`, 400, "bad_image");
    }
    return {
      buffer,
      contentType: mime.startsWith("image/") ? mime : "image/png"
    };
  }
  if (!/^https?:\/\//i.test(trimmed) && /^[A-Za-z0-9+/=\s]+$/.test(trimmed) && trimmed.length > 64) {
    const buffer = Buffer.from(trimmed.replace(/\s/g, ""), "base64");
    if (buffer.length > 0 && buffer.length <= ADOBE_FIREFLY_MAX_UPLOAD_BYTES) {
      return { buffer, contentType: "image/png" };
    }
  }
  throw new AdobeFireflyError("Unsupported image reference (need data:image/...;base64,... or raw base64). " + "HTTP(S) URLs are resolved by the caller before upload.", 400, "bad_image");
}
export function parseAdobeStorageUploadResponse(body) {
  if (!body || typeof body !== "object")
    return "";
  const images = body.images;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (first && typeof first === "object") {
      const id = first.id;
      if (typeof id === "string" && id.trim())
        return id.trim();
    }
  }
  const id = body.id;
  if (typeof id === "string" && id.trim())
    return id.trim();
  return "";
}
export async function uploadAdobeFireflyImage(opts) {
  const fetchImpl = opts.fetchImpl || fetch;
  const buffer = Buffer.isBuffer(opts.bytes) ? opts.bytes : Buffer.from(opts.bytes);
  if (!buffer.length) {
    throw new AdobeFireflyError("Cannot upload empty image", 400, "bad_image");
  }
  if (buffer.length > ADOBE_FIREFLY_MAX_UPLOAD_BYTES) {
    throw new AdobeFireflyError(`Image reference too large (${buffer.length} bytes; max ${ADOBE_FIREFLY_MAX_UPLOAD_BYTES})`, 400, "bad_image");
  }
  const sessionCookie = String(opts.sessionCookie || "").trim();
  const cookieHeader = extractAdobeCookieHeader(sessionCookie);
  const arpSessionId = opts.arpSessionId && String(opts.arpSessionId).trim() || resolveAdobeArpSessionId(cookieHeader || sessionCookie);
  const contentType = opts.contentType && opts.contentType.trim() || (buffer[0] === 255 && buffer[1] === 216 ? "image/jpeg" : buffer[0] === 137 && buffer[1] === 80 ? "image/png" : "image/png");
  const resp = await fetchImpl(ADOBE_FIREFLY_IMAGE_UPLOAD_URL, {
    method: "POST",
    headers: buildAdobeUploadHeaders(opts.accessToken, contentType, {
      arpSessionId,
      cookie: cookieHeader || undefined,
      prompt: opts.prompt || "upload"
    }),
    body: Uint8Array.from(buffer)
  });
  const text = await resp.text().catch(() => "");
  if (resp.status === 401 || resp.status === 403) {
    throw new AdobeFireflyError("Adobe Firefly image upload unauthorized — paste a fresh IMS JWT", 401, "auth");
  }
  if (!resp.ok) {
    throw new AdobeFireflyError(`Adobe Firefly image upload failed (${resp.status}): ${sanitizeErrorMessage(text.slice(0, 300))}`, resp.status >= 400 && resp.status < 500 ? resp.status : 502, "upload");
  }
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new AdobeFireflyError("Adobe Firefly image upload returned non-JSON body", 502, "upload");
  }
  const id = parseAdobeStorageUploadResponse(json);
  if (!id) {
    throw new AdobeFireflyError("Adobe Firefly image upload succeeded but no images[].id was returned", 502, "upload");
  }
  opts.log?.info?.("ADOBE-FIREFLY", `uploaded reference image id=${id} (${buffer.length} bytes)`);
  return id;
}
export async function resolveAdobeSourceImageIds(opts) {
  const max = Math.max(1, Math.min(8, opts.max ?? 4));
  const sources = extractAdobeSourceImageSources(opts.body, max);
  if (!sources.length)
    return [];
  const fetchImpl = opts.fetchImpl || fetch;
  const ids = [];
  const arpSessionId = opts.arpSessionId && String(opts.arpSessionId).trim() || resolveAdobeArpSessionId(opts.sessionCookie);
  for (const src of sources) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(src)) {
      ids.push(src);
      continue;
    }
    let buffer;
    let contentType = "image/png";
    if (/^https?:\/\//i.test(src)) {
      let downloaded;
      try {
        downloaded = await fetchUntrustedRemoteImage(src, {
          maxBytes: ADOBE_FIREFLY_MAX_UPLOAD_BYTES
        });
      } catch (error) {
        opts.log?.error?.("ADOBE-FIREFLY", `reference image download failed: ${sanitizeErrorMessage(error instanceof Error ? error.message : String(error))}`);
        throw new AdobeFireflyError("Failed to download reference image", 400, "bad_image");
      }
      buffer = downloaded.buffer;
      if (downloaded.contentType.toLowerCase().startsWith("image/")) {
        contentType = downloaded.contentType.split(";")[0].trim();
      }
    } else {
      const parsed = parseAdobeImageSourceBytes(src);
      buffer = parsed.buffer;
      contentType = parsed.contentType;
    }
    const id = await uploadAdobeFireflyImage({
      accessToken: opts.accessToken,
      bytes: buffer,
      contentType,
      sessionCookie: opts.sessionCookie,
      arpSessionId,
      prompt: opts.prompt,
      fetchImpl,
      log: opts.log
    });
    ids.push(id);
  }
  return ids;
}
