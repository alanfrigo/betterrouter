import { fetchPublic } from "../../src/shared/utils/ssrfGuard.js";
import { sanitizeErrorMessage } from "../utils/mediaProtocolErrors.js";
import {
  parseAdobeModelsDiscovery as parseAdobeModelsDiscoveryContract
} from "./adobeFireflyModels.js";
import {
  ADOBE_FIREFLY_CREDITS_BALANCE_URL,
  ADOBE_FIREFLY_MODELS_DISCOVERY_URL
} from "./adobeFireflyCatalog.js";
import { AdobeFireflyError } from "./adobeFireflyCredentials.js";
import { buildAdobeBalanceHeaders, buildAdobeDiscoveryHeaders } from "./adobeFireflyResponses.js";
function readQuotaBlock(block) {
  if (!block || typeof block !== "object")
    return { total: 0, used: 0, available: 0 };
  const q = block.quota && typeof block.quota === "object" ? block.quota : block;
  const total = Number(q.total ?? 0);
  const used = Number(q.used ?? 0);
  const available = Number(q.available ?? Math.max(0, total - used));
  return {
    total: Number.isFinite(total) ? total : 0,
    used: Number.isFinite(used) ? used : 0,
    available: Number.isFinite(available) ? available : 0
  };
}
export function parseAdobeCreditsBalance(body) {
  const root = body && typeof body === "object" ? body : {};
  const totalBlock = readQuotaBlock(root.total);
  const credits = root.credits && typeof root.credits === "object" ? root.credits : {};
  const free = readQuotaBlock(credits.firefly_free_credit);
  const plan = readQuotaBlock(credits.firefly_plan_credit);
  let total = totalBlock.total;
  let used = totalBlock.used;
  let remaining = totalBlock.available;
  if (total <= 0 && (free.total > 0 || plan.total > 0)) {
    total = free.total + plan.total;
    used = free.used + plan.used;
    remaining = free.available + plan.available;
  }
  if (remaining <= 0 && total > 0)
    remaining = Math.max(0, total - used);
  const availableUntil = root.total && typeof root.total === "object" && typeof root.total.availableUntil === "string" ? String(root.total.availableUntil) : null;
  return {
    total,
    used,
    remaining,
    availableUntil,
    freeTotal: free.total,
    freeUsed: free.used,
    freeRemaining: free.available,
    planTotal: plan.total,
    planUsed: plan.used,
    planRemaining: plan.available,
    raw: body
  };
}
export async function fetchAdobeCreditsBalance(accessToken, fetchImpl = fetchPublic) {
  const resp = await fetchImpl(ADOBE_FIREFLY_CREDITS_BALANCE_URL, {
    method: "GET",
    headers: buildAdobeBalanceHeaders(accessToken)
  });
  if (resp.status === 401 || resp.status === 403) {
    throw new AdobeFireflyError("Adobe Firefly balance: token invalid or expired", 401, "auth");
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new AdobeFireflyError(`Adobe Firefly balance failed (${resp.status}): ${sanitizeErrorMessage(text.slice(0, 200))}`, 502);
  }
  const data = await resp.json().catch(() => ({}));
  return parseAdobeCreditsBalance(data);
}
export function parseAdobeModelsDiscovery(body) {
  return parseAdobeModelsDiscoveryContract(body);
}
export async function discoverAdobeFireflyModels(accessToken, fetchImpl = fetchPublic) {
  const resp = await fetchImpl(ADOBE_FIREFLY_MODELS_DISCOVERY_URL, {
    method: "POST",
    headers: buildAdobeDiscoveryHeaders(accessToken),
    body: JSON.stringify({ filters: { resolveSchema: true } })
  });
  if (resp.status === 401 || resp.status === 403) {
    throw new AdobeFireflyError("Adobe Firefly model discovery: token invalid or expired", 401, "auth");
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new AdobeFireflyError(`Adobe Firefly model discovery failed (${resp.status}): ${sanitizeErrorMessage(text.slice(0, 200))}`, 502);
  }
  const data = await resp.json().catch(() => ({}));
  return parseAdobeModelsDiscovery(data);
}
