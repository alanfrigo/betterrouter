import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import http from "node:http";
import { createServer } from "node:net";
import { join } from "node:path";
import { DATA_DIR } from "../../src/lib/dataDir.js";
import { ensureSecureDir, writeSecureFile } from "../utils/secureFileWrite.js";
import {
  decodeAdobeJwtPayload,
  isAdobeUserAccessToken,
  looksLikeAdobeJwt
} from "./adobeFireflyClient.js";
import { isAdobeFireflyApiUrl, isAdobeLoginCookieDomain } from "./adobeFireflySecurity.js";
import { sanitizeErrorMessage } from "../utils/mediaProtocolErrors.js";
function loopbackHttpGetJson(port, path, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const req = http.get({
      host: "127.0.0.1",
      port,
      path,
      timeout: Math.max(500, timeoutMs),
      headers: { Accept: "application/json" }
    }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        if ((res.statusCode || 0) < 200 || (res.statusCode || 0) >= 300) {
          reject(new Error(`HTTP ${res.statusCode || 0} ${path}`));
          return;
        }
        try {
          resolve(JSON.parse(body || "null"));
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
    });
    req.on("timeout", () => {
      req.destroy(new Error(`timeout ${timeoutMs}ms ${path}`));
    });
    req.on("error", reject);
  });
}
const FIREFLY_HOME_URL = "https://firefly.adobe.com/";
const ADOBE_BEARER_REGEX = /^Bearer\s+(eyJ[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096})/i;
const ADOBE_JWT_IN_TEXT_REGEX = /eyJ[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096}\.[A-Za-z0-9_-]{1,4096}/g;
const DEFAULT_LOGIN_TIMEOUT_MS = 300000;
const MIN_LOGIN_TIMEOUT_MS = 15000;
const MAX_LOGIN_TIMEOUT_MS = 600000;
const POLL_INTERVAL_MS = 400;
const CDP_READY_TIMEOUT_MS = 12000;
const CDP_READY_TIMEOUT_RETRY_MS = 20000;
const ADOBE_RISK_COOKIE_NAMES = new Set([
  "fortertoken",
  "forter",
  "arkose",
  "sherlocktoken",
  "x-arp-session-id"
]);
let interactiveCdpChain = Promise.resolve();
let backgroundCdpChain = Promise.resolve();
export function __resetAdobeFireflyCdpChainsForTests() {
  interactiveCdpChain = Promise.resolve();
  backgroundCdpChain = Promise.resolve();
}
export function isAdobeRiskCookieName(name) {
  return ADOBE_RISK_COOKIE_NAMES.has(String(name || "").trim().toLowerCase());
}
export function extractAdobeForterTimestampFromValue(value) {
  const f = String(value || "").trim();
  if (!f)
    return 0;
  let decoded = f;
  try {
    if (/%[0-9A-Fa-f]{2}/.test(decoded))
      decoded = decodeURIComponent(decoded);
  } catch {}
  const m = decoded.match(/_(\d{13})__/);
  return m ? Number(m[1]) : 0;
}
export function filterSeedCookiesForWarm(cookies, opts) {
  const dropRisk = opts?.dropRiskCookies !== false;
  return cookies.filter((c) => {
    if (!c?.name || !c?.value)
      return false;
    if (dropRisk && isAdobeRiskCookieName(c.name))
      return false;
    return true;
  });
}
export function extractUserJwtFromStorageRaw(raw) {
  const matches = String(raw || "").match(ADOBE_JWT_IN_TEXT_REGEX) || [];
  const sorted = [...matches].sort((a, b) => b.length - a.length);
  for (const tok of sorted) {
    if (looksLikeAdobeJwt(tok) && isAdobeUserAccessToken(tok))
      return tok;
  }
  return "";
}
function resolveAdobeFireflyDataRoot() {
  const dataRoot = DATA_DIR;
  mkdirSync(dataRoot, { recursive: true });
  return dataRoot;
}
export function adobeFireflyBrowserSessionKey(value) {
  const raw = String(value || "legacy-default").trim() || "legacy-default";
  return createHash("sha256").update(raw).digest("hex").slice(0, 32);
}
export function resolveAdobeFireflyBrowserProfileDir(sessionKey) {
  const profile = join(resolveAdobeFireflyDataRoot(), "adobe-chrome-profiles", adobeFireflyBrowserSessionKey(sessionKey));
  mkdirSync(profile, { recursive: true });
  return profile;
}
export function clampAdobeFireflyLoginTimeout(value) {
  if (typeof value !== "number" || !Number.isFinite(value))
    return DEFAULT_LOGIN_TIMEOUT_MS;
  return Math.max(MIN_LOGIN_TIMEOUT_MS, Math.min(MAX_LOGIN_TIMEOUT_MS, Math.trunc(value)));
}
export function extractAdobeBearerTokenFromAuthorization(authHeader) {
  const m = String(authHeader || "").match(ADOBE_BEARER_REGEX);
  return m?.[1] || "";
}
export function buildAdobeFireflyCookieHeader(cookies) {
  const wanted = [
    "sherlockToken",
    "forterToken",
    "arkose",
    "ff_session_guid",
    "aux_sid",
    "bfp",
    "fpjs"
  ];
  const parts = [];
  for (const wantedName of wanted) {
    const c = cookies.find((candidate) => candidate.name === wantedName && typeof candidate.value === "string" && candidate.value.length > 0 && !/[\r\n;]/.test(candidate.value));
    if (c)
      parts.push(`${wantedName}=${c.value}`);
  }
  return parts.join("; ");
}
function humanAdobeLabel(value) {
  const label = typeof value === "string" ? value.trim() : "";
  if (!label || /@(Adobe|Guest)ID$/i.test(label))
    return "";
  return label;
}
export function accountLabelFromAdobeJwt(token) {
  const obj = decodeAdobeJwtPayload(token);
  if (!obj)
    return "";
  for (const key of ["email", "preferred_username", "name", "display_name"]) {
    const label = humanAdobeLabel(obj[key]);
    if (label)
      return label;
  }
  return "";
}
export async function resolveAdobeAccountLabel(token, fetchImpl = fetch) {
  const claimLabel = accountLabelFromAdobeJwt(token);
  const payload = decodeAdobeJwtPayload(token);
  const clientId = humanAdobeLabel(payload?.client_id) || "clio-playground-web";
  try {
    const response = await fetchImpl(`https://ims-na1.adobelogin.com/ims/userinfo/v2?client_id=${encodeURIComponent(clientId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(1e4)
    });
    if (response.ok) {
      const user = await response.json();
      for (const key of ["email", "preferred_username", "name", "display_name"]) {
        const label = humanAdobeLabel(user[key]);
        if (label)
          return label;
      }
      const given = humanAdobeLabel(user.given_name);
      const family = humanAdobeLabel(user.family_name);
      const full = [given, family].filter(Boolean).join(" ").trim();
      if (full)
        return full;
    }
  } catch {}
  return claimLabel || "Adobe account";
}
export function resolveSystemBrowserExecutable() {
  const configured = process.env.OMNIROUTE_LOGIN_BROWSER_PATH?.trim();
  if (configured && existsSync(configured))
    return configured;
  const pf = process.env.ProgramFiles || "C:\\Program Files";
  const pf86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
  const local = process.env.LOCALAPPDATA || "";
  const candidates = [
    join(pf, "Google", "Chrome", "Application", "chrome.exe"),
    join(pf86, "Google", "Chrome", "Application", "chrome.exe"),
    join(local, "Google", "Chrome", "Application", "chrome.exe"),
    join(pf, "Microsoft", "Edge", "Application", "msedge.exe"),
    join(pf86, "Microsoft", "Edge", "Application", "msedge.exe"),
    join(local, "Microsoft", "Edge", "Application", "msedge.exe"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/microsoft-edge",
    "/usr/bin/microsoft-edge-stable"
  ];
  for (const path of candidates) {
    if (path && existsSync(path))
      return path;
  }
  return null;
}
async function getFreeLoopbackPort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        server.close();
        reject(new Error("Could not allocate a free loopback port for Chrome DevTools"));
        return;
      }
      const { port } = addr;
      server.close((err) => err ? reject(err) : resolve(port));
    });
  });
}
async function waitForCdpReady(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "CDP endpoint not ready";
  while (Date.now() < deadline) {
    try {
      const body = await loopbackHttpGetJson(port, "/json/version", 2000);
      if (body?.webSocketDebuggerUrl) {
        return { webSocketDebuggerUrl: body.webSocketDebuggerUrl };
      }
      lastError = "CDP /json/version missing webSocketDebuggerUrl";
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Chrome DevTools did not become ready: ${lastError}`);
}
function isAdobeCookieDomain(domain) {
  const value = String(domain || "").trim().replace(/^\./, "").toLowerCase();
  return value === "adobe.com" || value.endsWith(".adobe.com") || value === "adobelogin.com" || value.endsWith(".adobelogin.com") || value === "adobe.io" || value.endsWith(".adobe.io");
}
export function filterAdobeBrowserCookies(cookies) {
  return cookies.filter((cookie) => isAdobeCookieDomain(cookie.domain) && Boolean(cookie.name && cookie.value) && !/[\r\n\0]/.test(cookie.name + cookie.value)).map((cookie) => ({
    name: cookie.name,
    value: cookie.value,
    ...cookie.domain ? { domain: cookie.domain } : {},
    path: cookie.path || "/",
    ...typeof cookie.expires === "number" ? { expires: cookie.expires } : {},
    ...typeof cookie.httpOnly === "boolean" ? { httpOnly: cookie.httpOnly } : {},
    ...typeof cookie.secure === "boolean" ? { secure: cookie.secure } : {},
    ...cookie.sameSite ? { sameSite: cookie.sameSite } : {}
  }));
}
function adobeBrowserCookieJarPath(sessionKey) {
  const dir = join(resolveAdobeFireflyDataRoot(), "adobe-browser-sessions");
  ensureSecureDir(dir);
  return join(dir, `${adobeFireflyBrowserSessionKey(sessionKey)}.json`);
}
function loadAdobeBrowserCookies(sessionKey) {
  try {
    const path = adobeBrowserCookieJarPath(sessionKey);
    if (!existsSync(path))
      return [];
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return Array.isArray(parsed) ? filterAdobeBrowserCookies(parsed) : [];
  } catch {
    return [];
  }
}
function saveAdobeBrowserCookies(sessionKey, cookies) {
  try {
    writeSecureFile(adobeBrowserCookieJarPath(sessionKey), JSON.stringify(filterAdobeBrowserCookies(cookies)));
  } catch {}
}
function parseCookieHeader(cookieHeader) {
  const cookies = [];
  for (const part of String(cookieHeader || "").split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0)
      continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!name || !value || /[\r\n\0]/.test(name + value))
      continue;
    cookies.push({ name, value });
  }
  return cookies;
}
function cookieValue(cookies, name) {
  return cookies.find((cookie) => cookie.name.toLowerCase() === name.toLowerCase())?.value || "";
}

class CdpSocket {
  ws;
  nextId = 1;
  pending = new Map;
  onEvent;
  constructor(ws, onEvent) {
    this.ws = ws;
    this.onEvent = onEvent;
    this.ws.addEventListener("message", (ev) => {
      let data;
      try {
        data = JSON.parse(String(ev.data));
      } catch {
        return;
      }
      if (typeof data.id === "number" && this.pending.has(data.id)) {
        const p = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error) {
          const errObj = data.error;
          p.reject(new Error(errObj.message || "CDP error"));
        } else {
          p.resolve(data.result);
        }
        return;
      }
      if (typeof data.method === "string") {
        this.onEvent(data.method, data.params || {});
      }
    });
  }
  send(method, params, sessionId, timeoutMs = 8000) {
    const id = this.nextId++;
    const msg = { id, method };
    if (params)
      msg.params = params;
    if (sessionId)
      msg.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (!this.pending.has(id))
          return;
        this.pending.delete(id);
        reject(new Error(`CDP timeout after ${timeoutMs}ms: ${method}`));
      }, Math.max(500, timeoutMs));
      this.pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        }
      });
      try {
        this.ws.send(JSON.stringify(msg));
      } catch (err) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }
  close() {
    for (const [id, p] of this.pending) {
      this.pending.delete(id);
      p.reject(new Error("CDP socket closed"));
    }
    try {
      this.ws.close();
    } catch {}
  }
  get open() {
    return this.ws.readyState === WebSocket.OPEN;
  }
}
async function openCdp(url) {
  const WebSocketCtor = globalThis.WebSocket;
  if (!WebSocketCtor) {
    throw new Error("WebSocket is unavailable in this Node runtime");
  }
  return new Promise((resolve, reject) => {
    const ws = new WebSocketCtor(url);
    const onErr = () => reject(new Error(`Failed to connect CDP: ${url}`));
    ws.addEventListener("error", onErr);
    ws.addEventListener("open", () => {
      ws.removeEventListener("error", onErr);
      resolve(ws);
    });
  });
}
async function captureViaCdp(opts) {
  let capturedAccessToken = "";
  let storageAccessToken = "";
  let capturedArpSessionId = "";
  let latestCookies = [];
  const pageSessionIds = new Set;
  let browserCdp = null;
  let humanizeDone = false;
  let riskReloadDone = false;
  const requireFreshRisk = Boolean(opts.waitForRiskRefresh);
  const seedForterTs = extractAdobeForterTimestampFromValue([...opts.seedBrowserCookies || [], ...parseCookieHeader(opts.seedCookie || "")].find((cookie) => cookie.name.toLowerCase() === "fortertoken")?.value || "");
  const baselineForterTs = requireFreshRisk ? 0 : Math.max(seedForterTs, 0);
  const startedAt = Date.now();
  const SPA_JWT_EXPR = `(() => {
          const out = [];
          try {
            for (const key of Object.keys(sessionStorage)) {
              if (!/adobeid_ims_access_token|clio-playground/i.test(key)) continue;
              out.push(sessionStorage.getItem(key) || "");
            }
            if (out.length === 0) {
              for (const key of Object.keys(sessionStorage)) {
                out.push(sessionStorage.getItem(key) || "");
              }
            }
          } catch (e) {}
          return out.join("\\n");
        })()`;
  const resumeTargetIfNeeded = async (sessionId) => {
    if (!browserCdp || !sessionId)
      return;
    try {
      await browserCdp.send("Runtime.runIfWaitingForDebugger", {}, sessionId);
    } catch {}
  };
  const setupPageSession = async (sessionId) => {
    if (!browserCdp || !sessionId || pageSessionIds.has(sessionId)) {
      await resumeTargetIfNeeded(sessionId);
      return;
    }
    pageSessionIds.add(sessionId);
    await resumeTargetIfNeeded(sessionId);
    await browserCdp.send("Network.enable", {}, sessionId).catch(() => {
      return;
    });
    await resumeTargetIfNeeded(sessionId);
    if (requireFreshRisk) {
      await browserCdp.send("Runtime.enable", {}, sessionId).catch(() => {
        return;
      });
      await resumeTargetIfNeeded(sessionId);
    }
  };
  const onEvent = (method, params) => {
    if (method === "Network.requestWillBeSent") {
      const request = params.request;
      if (!request?.url || !isAdobeFireflyApiUrl(request.url))
        return;
      const headers = request.headers || {};
      const auth = headers.Authorization || headers.authorization || headers.AUTHORIZATION || "";
      const token = extractAdobeBearerTokenFromAuthorization(auth);
      if (token && isAdobeUserAccessToken(token))
        capturedAccessToken = token;
      const arp = headers["x-arp-session-id"] || headers["X-Arp-Session-Id"] || headers["X-ARP-SESSION-ID"] || "";
      if (typeof arp === "string" && arp.trim())
        capturedArpSessionId = arp.trim();
    } else if (method === "Target.attachedToTarget") {
      const sessionId = String(params.sessionId || "");
      const targetInfo = params.targetInfo;
      if (!sessionId || !browserCdp)
        return;
      if (targetInfo?.type === "page" || targetInfo?.type === "iframe") {
        setupPageSession(sessionId).catch(() => {
          return;
        });
      } else {
        resumeTargetIfNeeded(sessionId).catch(() => {
          return;
        });
      }
    } else if (method === "Target.detachedFromTarget") {
      const sessionId = String(params.sessionId || "");
      if (sessionId)
        pageSessionIds.delete(sessionId);
    }
  };
  const readSpaJwtFromSession = async (sessionId) => {
    if (!browserCdp || !sessionId)
      return "";
    try {
      await resumeTargetIfNeeded(sessionId);
      await browserCdp.send("Runtime.enable", {}, sessionId).catch(() => {
        return;
      });
      await resumeTargetIfNeeded(sessionId);
      const result = await browserCdp.send("Runtime.evaluate", {
        expression: SPA_JWT_EXPR,
        returnByValue: true,
        awaitPromise: false
      }, sessionId);
      return extractUserJwtFromStorageRaw(String(result?.result?.value || ""));
    } catch {
      return "";
    }
  };
  const nudgeForterSession = async (sessionId) => {
    if (!browserCdp || !sessionId)
      return;
    try {
      await resumeTargetIfNeeded(sessionId);
      for (const [x, y] of [
        [140, 180],
        [420, 260],
        [700, 340],
        [520, 420]
      ]) {
        await browserCdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }, sessionId);
      }
      await browserCdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: 640, y: 360, button: "left", clickCount: 1 }, sessionId);
      await browserCdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 640, y: 360, button: "left", clickCount: 1 }, sessionId);
      await browserCdp.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 400, y: 300, deltaX: 0, deltaY: 240 }, sessionId);
    } catch {}
  };
  try {
    const browserWs = await openCdp(opts.browserWsUrl);
    browserCdp = new CdpSocket(browserWs, onEvent);
    const rawSeed = [
      ...opts.seedBrowserCookies || [],
      ...parseCookieHeader(opts.seedCookie || "").map((cookie) => ({
        ...cookie,
        domain: "firefly.adobe.com",
        path: "/",
        secure: true
      }))
    ];
    const seed = requireFreshRisk ? filterSeedCookiesForWarm(rawSeed, { dropRiskCookies: true }) : rawSeed;
    if (seed.length > 0) {
      await browserCdp.send("Storage.setCookies", {
        cookies: seed.map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
          ...cookie.domain ? { domain: cookie.domain } : { url: FIREFLY_HOME_URL },
          path: cookie.path || "/",
          ...typeof cookie.expires === "number" && cookie.expires > 0 ? { expires: cookie.expires } : {},
          ...typeof cookie.httpOnly === "boolean" ? { httpOnly: cookie.httpOnly } : {},
          ...typeof cookie.sameSite === "string" ? { sameSite: cookie.sameSite } : {},
          secure: cookie.secure !== false
        }))
      }).catch(() => {
        return;
      });
    }
    if (requireFreshRisk) {
      try {
        for (const origin of [
          "https://firefly.adobe.com",
          "https://www.firefly.adobe.com",
          "https://firefly-3p.ff.adobe.io"
        ]) {
          await browserCdp.send("Storage.clearDataForOrigin", {
            origin,
            storageTypes: "cookies,local_storage,indexeddb,cache_storage,service_workers,shader_cache"
          }).catch(() => {
            return;
          });
        }
        const existing = await browserCdp.send("Storage.getCookies");
        for (const cookie of existing?.cookies || []) {
          const domain = String(cookie.domain || "").replace(/^\./, "").toLowerCase();
          const isFireflySite = domain === "firefly.adobe.com" || domain.endsWith(".firefly.adobe.com") || domain === "ff.adobe.io" || domain.endsWith(".ff.adobe.io");
          if (!isFireflySite && !isAdobeRiskCookieName(cookie.name))
            continue;
          if (isAdobeLoginCookieDomain(domain) && !isAdobeRiskCookieName(cookie.name))
            continue;
          await browserCdp.send("Storage.deleteCookies", {
            name: cookie.name,
            ...cookie.domain ? { domain: cookie.domain } : { url: FIREFLY_HOME_URL },
            path: cookie.path || "/"
          }).catch(() => {
            return;
          });
        }
      } catch {}
    }
    await browserCdp.send("Target.setDiscoverTargets", { discover: true }).catch(() => {
      return;
    });
    await browserCdp.send("Target.setAutoAttach", {
      autoAttach: true,
      waitForDebuggerOnStart: false,
      flatten: true
    }).catch(() => {
      return;
    });
    try {
      const { targetInfos } = await browserCdp.send("Target.getTargets");
      for (const t of targetInfos || []) {
        if (t.type !== "page" && t.type !== "iframe" || !t.targetId)
          continue;
        try {
          const attached = await browserCdp.send("Target.attachToTarget", {
            targetId: t.targetId,
            flatten: true
          });
          const sid = String(attached?.sessionId || "");
          if (sid)
            await setupPageSession(sid);
        } catch {}
      }
    } catch {}
    const deadline = Date.now() + opts.timeoutMs;
    let lastJwtProbeAt = 0;
    let lastResumeSweepAt = 0;
    while (Date.now() < deadline) {
      const now = Date.now();
      if (now - lastResumeSweepAt >= 1500) {
        lastResumeSweepAt = now;
        for (const sid of [...pageSessionIds]) {
          await resumeTargetIfNeeded(sid);
        }
      }
      try {
        const result = await browserCdp.send("Storage.getCookies");
        if (Array.isArray(result?.cookies))
          latestCookies = result.cookies;
      } catch {}
      if (now - lastJwtProbeAt >= (requireFreshRisk ? 800 : 2000)) {
        lastJwtProbeAt = now;
        for (const sid of pageSessionIds) {
          const fromStorage = await readSpaJwtFromSession(sid);
          if (fromStorage) {
            storageAccessToken = fromStorage;
            break;
          }
        }
      }
      if (requireFreshRisk && pageSessionIds.size > 0) {
        const elapsedWarm = Date.now() - startedAt;
        if (!humanizeDone && elapsedWarm >= 2000) {
          humanizeDone = true;
          for (const sid of pageSessionIds) {
            await nudgeForterSession(sid);
            break;
          }
        } else if (!riskReloadDone && humanizeDone && elapsedWarm >= 12000) {
          riskReloadDone = true;
          for (const sid of pageSessionIds) {
            await browserCdp.send("Page.reload", { ignoreCache: true }, sid).catch(() => {
              return;
            });
            await new Promise((r) => setTimeout(r, 1500));
            await resumeTargetIfNeeded(sid);
            await nudgeForterSession(sid);
            break;
          }
        }
      }
      const fallbackToken = String(opts.fallbackAccessToken || "").trim();
      const accessToken = capturedAccessToken || storageAccessToken || (isAdobeUserAccessToken(fallbackToken) ? fallbackToken : "");
      if (accessToken) {
        const elapsed = Date.now() - startedAt;
        const forter = cookieValue(latestCookies, "forterToken");
        const forterTs = extractAdobeForterTimestampFromValue(forter);
        const forterAgeMs = forterTs > 0 ? Math.max(0, Date.now() - forterTs) : Number.POSITIVE_INFINITY;
        const hasRiskCookies = Boolean(forter && cookieValue(latestCookies, "ff_session_guid") && (cookieValue(latestCookies, "arkose") || cookieValue(latestCookies, "sherlockToken")));
        const riskAdvanced = forterTs > 0 && (baselineForterTs <= 0 ? forterAgeMs < 10 * 60000 : forterTs > baselineForterTs || forterAgeMs < 10 * 60000);
        if (!requireFreshRisk) {
          if (hasRiskCookies && riskAdvanced) {
            return {
              accessToken,
              cookies: latestCookies,
              arpSessionId: capturedArpSessionId
            };
          }
          if (elapsed >= 45000) {
            return {
              accessToken,
              cookies: latestCookies,
              arpSessionId: capturedArpSessionId
            };
          }
        } else {
          const minWaitMs = 8000;
          if (hasRiskCookies && elapsed >= minWaitMs && riskAdvanced) {
            return {
              accessToken,
              cookies: latestCookies,
              arpSessionId: capturedArpSessionId
            };
          }
        }
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    if (requireFreshRisk) {
      const forter = cookieValue(latestCookies, "forterToken");
      const forterTs = extractAdobeForterTimestampFromValue(forter);
      const forterAgeMs = forterTs > 0 ? Math.max(0, Date.now() - forterTs) : Number.POSITIVE_INFINITY;
      const riskAdvanced = forterTs > 0 && (baselineForterTs <= 0 ? forterAgeMs < 10 * 60000 : forterTs > baselineForterTs || forterAgeMs < 10 * 60000);
      if (!riskAdvanced) {
        throw new Error("Adobe Firefly risk session did not refresh (forterToken stale). " + "Re-open Sign in with browser once, or wait and retry generate.");
      }
      const token = capturedAccessToken || storageAccessToken || (isAdobeUserAccessToken(String(opts.fallbackAccessToken || "").trim()) ? String(opts.fallbackAccessToken).trim() : "");
      if (token) {
        return {
          accessToken: token,
          cookies: latestCookies,
          arpSessionId: capturedArpSessionId
        };
      }
    }
    const fallbackRaw = String(opts.fallbackAccessToken || "").trim();
    const fallback = isAdobeUserAccessToken(fallbackRaw) ? fallbackRaw : "";
    if (fallback && latestCookies.length > 0 && !requireFreshRisk) {
      return {
        accessToken: capturedAccessToken || storageAccessToken || fallback,
        cookies: latestCookies,
        arpSessionId: capturedArpSessionId
      };
    }
    throw new Error("Adobe Firefly sign-in timed out. Complete sign-in at firefly.adobe.com and trigger an action " + "(open Generate) so the browser sends the Firefly request, then try again.");
  } finally {
    pageSessionIds.clear();
    browserCdp?.close();
  }
}
export function killProcessTree(child, options) {
  if (!child?.pid)
    return;
  const pid = child.pid;
  if (pid === process.pid || typeof process.ppid === "number" && pid === process.ppid) {
    return;
  }
  const platform = options?.platform || process.platform;
  const processKill = options?.processKill || process.kill.bind(process);
  const spawnFn = options?.spawnFn || spawn;
  try {
    if (platform === "win32") {
      const killer = spawnFn("taskkill", ["/pid", String(pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
        detached: true
      });
      killer?.unref?.();
    } else {
      let killedGroup = false;
      try {
        processKill(-pid, "SIGTERM");
        killedGroup = true;
      } catch {
        try {
          child.kill?.("SIGTERM");
        } catch {}
      }
      setTimeout(() => {
        try {
          if (killedGroup) {
            processKill(-pid, "SIGKILL");
          } else {
            child.kill?.("SIGKILL");
          }
        } catch {}
      }, 2000).unref?.();
    }
  } catch {
    try {
      child.kill?.();
    } catch {}
  }
}
export function adobeFireflyBackgroundUsesHeadlessChrome() {
  return process.env.ADOBE_FIREFLY_CHROME_HEADLESS === "1";
}
export function buildAdobeFireflyBrowserArgs(opts) {
  const interactive = opts.interactive === true;
  const backgroundHeadless = !interactive && adobeFireflyBackgroundUsesHeadlessChrome();
  return [
    `--remote-debugging-port=${opts.port}`,
    "--remote-debugging-address=127.0.0.1",
    "--remote-allow-origins=*",
    `--user-data-dir=${opts.userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    ...interactive ? [
      "--new-window",
      "--window-size=1280,800"
    ] : backgroundHeadless ? [
      "--headless=new",
      "--disable-gpu",
      "--window-size=1280,800"
    ] : [
      "--window-position=-32000,-32000",
      "--window-size=1280,800",
      "--start-minimized"
    ],
    FIREFLY_HOME_URL
  ];
}
async function runAdobeFireflyCdpBrowser(opts) {
  const browserPath = resolveSystemBrowserExecutable();
  if (!browserPath) {
    return {
      success: false,
      error: "No Chrome or Edge browser found for Adobe Firefly sign-in. " + "Install Google Chrome or Microsoft Edge, or set OMNIROUTE_LOGIN_BROWSER_PATH, " + "or paste the IMS Bearer JWT from firefly-3p.ff.adobe.io."
    };
  }
  let child = null;
  try {
    const userDataDir = resolveAdobeFireflyBrowserProfileDir(opts.sessionKey);
    const launchUserDataDir = opts.interactive && opts.freshSession !== false ? `${userDataDir}-login-${Date.now().toString(36)}` : userDataDir;
    try {
      mkdirSync(launchUserDataDir, { recursive: true });
    } catch {}
    let lastError = "Browser failed to start";
    for (let launchAttempt = 1;launchAttempt <= 2; launchAttempt++) {
      if (child) {
        killProcessTree(child);
        child = null;
        await new Promise((r) => setTimeout(r, 300));
      }
      const port = await getFreeLoopbackPort();
      const attemptUserDataDir = opts.interactive && opts.freshSession !== false ? `${launchUserDataDir}-a${launchAttempt}` : launchUserDataDir;
      try {
        mkdirSync(attemptUserDataDir, { recursive: true });
      } catch {}
      const args = buildAdobeFireflyBrowserArgs({
        port,
        userDataDir: attemptUserDataDir,
        interactive: opts.interactive,
        freshSession: opts.freshSession
      });
      const isDetached = process.platform !== "win32" || !opts.interactive;
      child = spawn(browserPath, args, {
        stdio: "ignore",
        windowsHide: !opts.interactive,
        detached: isDetached
      });
      if (!opts.interactive) {
        try {
          child.unref?.();
        } catch {}
      }
      let exitedEarly = false;
      let exitCode = null;
      const onExit = (code) => {
        exitedEarly = true;
        exitCode = code;
      };
      const onErr = (err) => {
        exitedEarly = true;
        lastError = `Failed to launch browser: ${err.message}`;
      };
      child.once("exit", onExit);
      child.once("error", onErr);
      await new Promise((r) => setTimeout(r, 600));
      if (exitedEarly) {
        lastError = `Browser exited early (code ${exitCode}). Retrying…`;
        opts.log?.warn?.("ADOBE-FIREFLY", lastError);
        continue;
      }
      try {
        const cdpWaitMs = launchAttempt === 1 ? CDP_READY_TIMEOUT_MS : CDP_READY_TIMEOUT_RETRY_MS;
        const { webSocketDebuggerUrl } = await waitForCdpReady(port, cdpWaitMs);
        if (exitedEarly) {
          lastError = `Browser exited early (code ${exitCode}). Retrying…`;
          continue;
        }
        child.removeListener("exit", onExit);
        child.removeListener("error", onErr);
        opts.log?.info?.("ADOBE-FIREFLY", opts.interactive ? "Chrome ready — complete Adobe/Google sign-in in the window (do not close it)" : "headless CDP warm attached");
        const captured = await captureViaCdp({
          port,
          browserWsUrl: webSocketDebuggerUrl,
          timeoutMs: opts.timeoutMs,
          fallbackAccessToken: opts.accessToken,
          seedCookie: opts.seedCookie,
          seedBrowserCookies: opts.interactive && opts.freshSession !== false ? [] : loadAdobeBrowserCookies(opts.sessionKey),
          waitForRiskRefresh: !opts.interactive
        });
        const cookie = buildAdobeFireflyCookieHeader(captured.cookies);
        saveAdobeBrowserCookies(opts.sessionKey, captured.cookies);
        const account = await resolveAdobeAccountLabel(captured.accessToken);
        opts.log?.info?.("ADOBE-FIREFLY", `CDP ${opts.interactive ? "sign-in" : "refresh"} captured durable session ` + `(cookieCount=${captured.cookies.length}, arpLen=${captured.arpSessionId.length})`);
        return {
          success: true,
          credentials: {
            accessToken: captured.accessToken,
            ...cookie ? { cookie } : {}
          },
          ...captured.arpSessionId ? { arpSessionId: captured.arpSessionId } : {},
          ...account ? { account } : {}
        };
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        if (launchAttempt < 2) {
          opts.log?.warn?.("ADOBE-FIREFLY", `Chrome CDP launch attempt ${launchAttempt} failed: ${lastError}; retrying…`);
          continue;
        }
        break;
      }
    }
    return {
      success: false,
      error: sanitizeErrorMessage(lastError)
    };
  } catch (error) {
    return {
      success: false,
      error: sanitizeErrorMessage(error instanceof Error ? error.message : error)
    };
  } finally {
    killProcessTree(child);
    child = null;
  }
}
export async function startAdobeFireflyBrowserLogin(requestedTimeout, opts) {
  const run = interactiveCdpChain.then(() => runAdobeFireflyCdpBrowser({
    timeoutMs: clampAdobeFireflyLoginTimeout(requestedTimeout),
    interactive: true,
    sessionKey: String(opts?.sessionKey || "legacy-default"),
    freshSession: opts?.freshSession !== false
  }));
  interactiveCdpChain = run.then(() => {
    return;
  }, () => {
    return;
  });
  return run;
}
export async function refreshAdobeFireflyViaCdp(opts) {
  const run = backgroundCdpChain.then(async () => {
    const result = await runAdobeFireflyCdpBrowser({
      timeoutMs: Math.max(15000, Math.min(120000, Number(opts.timeoutMs) || 75000)),
      interactive: false,
      sessionKey: String(opts.sessionKey || "legacy-default"),
      seedCookie: opts.cookie,
      accessToken: opts.accessToken,
      log: opts.log
    });
    const accessToken = String(result.credentials?.accessToken || "").trim();
    const cookie = String(result.credentials?.cookie || "").trim();
    if (!result.success || !accessToken || !cookie) {
      opts.log?.warn?.("ADOBE-FIREFLY", `CDP background refresh incomplete: ${result.error || "missing token/cookie"}`);
      return null;
    }
    return {
      accessToken,
      cookie,
      arpSessionId: String(result.arpSessionId || "").trim()
    };
  });
  backgroundCdpChain = run.then(() => {
    return;
  }, () => {
    return;
  });
  try {
    return await run;
  } catch (error) {
    opts.log?.warn?.("ADOBE-FIREFLY", `CDP background refresh failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}
