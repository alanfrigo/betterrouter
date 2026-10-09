import { getProviderConnections, getCustomModels, getDisabledModels, getComboByName } from "@/lib/db/index.js";
import REGISTRY from "open-sse/providers/registry/index.js";
import { getCapabilitiesForModel } from "open-sse/providers/capabilities.js";
import { getPricingForModel } from "open-sse/providers/pricing.js";
import { isModelLockActive } from "open-sse/services/accountFallback.js";

const categories = new Set(["coding", "reasoning", "vision", "chat", "multimodal"]);
const tiers = new Set(["fast", "cheap", "floor", "free", "reliable", "pro", "subscription", "thrifty"]);
const families = new Set(["glm", "minimax", "mimo", "zai", "gemma", "llama", "gemini", "kimi", "qwen", "deepseek", "gpt", "claude-opus", "claude-sonnet", "claude-haiku"]);
const variants = new Set(["coding", "fast", "cheap", "offline", "smart", "lkgp", "chaos", "chat", "subscription", "thrifty"]);
const lastGood = new Map();

export const AUTO_MODEL_IDS = ["auto", "auto/best-coding", "auto/best-reasoning", "auto/best-fast", "auto/best-vision", "auto/best-chat", "auto/best-coding-fast", "auto/best-free", "auto/pro-coding", "auto/pro-reasoning", "auto/pro-vision", "auto/pro-chat", "auto/pro-fast", "auto/coding", "auto/fast", "auto/chat", "auto/cheap", "auto/offline", "auto/smart", "auto/lkgp", "auto/subscription", "auto/thrifty", "auto/chaos", "auto/best-chaos", ...[...families].map((family) => `auto/${family}`), "auto/coding:fast", "auto/coding:cheap", "auto/coding:free", "auto/coding:pro", "auto/coding:reliable", "auto/reasoning", "auto/reasoning:pro", "auto/vision", "auto/multimodal"];

export function parseAutoRoute(model) {
  if (model !== "auto" && !model?.startsWith("auto/")) return null;
  let suffix = model === "auto" ? "" : model.slice(5);
  const spec = { name: model };
  if (suffix.startsWith("best-")) suffix = suffix.slice(5);
  if (suffix.startsWith("pro-")) { spec.tier = "pro"; suffix = suffix.slice(4); }
  if (suffix === "coding-fast") return { ...spec, category: "coding", tier: "fast" };
  if (suffix === "free") return { ...spec, tier: "free" };
  if (families.has(suffix)) return { ...spec, family: suffix };
  const [category, tier, extra] = suffix.split(":");
  if (tier !== undefined) {
    if (extra !== undefined || !categories.has(category) || !tiers.has(tier)) throw new Error(`Unknown automatic routing model: ${model}`);
    return { ...spec, category, tier };
  }
  if (!suffix) return spec;
  if (categories.has(category)) return { ...spec, category };
  if (variants.has(suffix)) return { ...spec, variant: suffix, ...(tiers.has(suffix) ? { tier: suffix } : {}) };
  throw new Error(`Unknown automatic routing model: ${model}`);
}

export function selectAutoCandidates(candidates, spec, preferred = lastGood.get(spec.name)) {
  const eligible = candidates.filter((candidate) => {
    const { provider, model, capabilities: caps, free, subscription, local } = candidate;
    const bare = model.id.split("/").pop().toLowerCase();
    if (spec.family === "zai" && provider !== "glm") return false;
    if (spec.family && spec.family !== "zai" && !bare.startsWith(spec.family) && !(spec.family === "kimi" && bare === "k3")) return false;
    if (["vision", "multimodal"].includes(spec.category) && !caps.vision) return false;
    if (spec.category === "reasoning" && !caps.reasoning) return false;
    if (spec.variant === "offline" && !local) return false;
    if (spec.tier === "free" && !free) return false;
    if (spec.tier === "pro" && free) return false;
    if (spec.tier === "subscription" && !subscription) return false;
    return true;
  });
  const score = (candidate) => {
    const fast = /flash|mini|nano|haiku|fast|instant|small/i.test(candidate.model.id);
    const premium = /opus|pro|ultra|large|max|gpt-5|gpt-6/i.test(candidate.model.id);
    let value = candidate.priority || 0;
    if (candidate.id === preferred) value -= 100000;
    if (spec.tier === "thrifty" && candidate.subscription) value -= 10000;
    if (spec.tier === "cheap" || spec.tier === "floor" || spec.tier === "thrifty" || spec.variant === "cheap") value += candidate.cost * 100;
    else if (spec.tier === "fast" || spec.variant === "fast") value -= fast ? 1000 : 0;
    else value -= premium ? 1000 : 0;
    if (spec.category === "coding" && /coder|codex|code|coding/i.test(candidate.model.id)) value -= 500;
    if (spec.category === "reasoning" || spec.variant === "smart") value -= candidate.capabilities.reasoning ? 500 : 0;
    return value;
  };
  return eligible.sort((a, b) => score(a) - score(b) || a.id.localeCompare(b.id)).map((candidate) => candidate.id);
}

export function recordAutoSuccess(name, model) { lastGood.set(name, model); }

export function customModelsForConnection(custom, connection, alias) {
  return custom.filter((model) => [alias, connection.provider, connection.providerSpecificData?.prefix].includes(model.providerAlias));
}

export function isLocalRuntimeEndpoint(connection, entry) {
  const endpoint = connection.providerSpecificData?.baseUrl || entry?.transport?.baseUrl || entry?.localDefault;
  try {
    const url = new URL(endpoint);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname.toLowerCase());
  } catch { return false; }
}

export async function getAutoModels(modelStr) {
  const spec = parseAutoRoute(modelStr);
  if (!spec) return null;
  const persisted = await getComboByName(modelStr);
  if (persisted?.models?.length) return persisted.models;
  const [connections, custom, disabled] = await Promise.all([getProviderConnections({ isActive: true }), getCustomModels(), getDisabledModels()]);
  const entries = new Map(REGISTRY.map((entry) => [entry.id, entry]));
  const candidates = new Map();
  for (const connection of connections) {
    const entry = entries.get(connection.provider);
    if (entry?.systemOnly || (entry?.serviceKinds && !entry.serviceKinds.includes("llm"))) continue;
    const alias = entry?.alias || connection.providerSpecificData?.prefix || connection.provider;
    const models = [...(entry?.models || []), ...customModelsForConnection(custom, connection, alias)];
    if (connection.defaultModel && !models.some((model) => model.id === connection.defaultModel)) models.push({ id: connection.defaultModel });
    for (const model of models) {
      if (!(model.supportedKinds || [model.kind || model.type || "llm"]).includes("llm") || (disabled[alias] || []).includes(model.id) || (disabled[connection.provider] || []).includes(model.id)) continue;
      if (isModelLockActive(connection, model.id)) continue;
      const id = `${alias}/${model.id}`;
      const pricing = getPricingForModel(connection.provider, model.id);
      const capabilities = getCapabilitiesForModel(connection.provider, model.id);
      const local = isLocalRuntimeEndpoint(connection, entry);
      const free = !!entry?.noAuth || /(?:[:/-]free)$|^cline-free\//i.test(model.id) || (pricing && pricing.input === 0 && pricing.output === 0);
      const candidate = { id, provider: connection.provider, model, capabilities: { ...capabilities, ...(model.supportsVision !== undefined ? { vision: model.supportsVision } : {}), ...(model.supportsReasoning !== undefined ? { reasoning: model.supportsReasoning } : {}) }, local, free, subscription: connection.authType === "oauth", cost: pricing ? pricing.input + pricing.output : Number.MAX_SAFE_INTEGER, priority: connection.globalPriority || connection.priority || 0 };
      if (!candidates.has(id) || candidate.priority < candidates.get(id).priority) candidates.set(id, candidate);
    }
  }
  return selectAutoCandidates([...candidates.values()], spec);
}
