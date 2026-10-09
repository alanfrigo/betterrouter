/**
 * ChatPlayground Models Service
 *
 * Provides dynamic model discovery from app.chatplayground.ai/api/models,
 * fallback catalog definitions, endpoint routing, and model ID resolution.
 */
export const CHATPLAYGROUND_API_BASE = "https://app.chatplayground.ai/api";
export const CHATPLAYGROUND_MODELS_URL = `${CHATPLAYGROUND_API_BASE}/models`;
export const CHATPLAYGROUND_USER_URL = `${CHATPLAYGROUND_API_BASE}/user`;
export const CHATPLAYGROUND_WEB_ORIGIN = "https://web.chatplayground.ai";
export const CHATPLAYGROUND_DEFAULT_CONTEXT = 128000;
export const CHATPLAYGROUND_FALLBACK_MODELS = [
    // Azure Endpoint Models
    {
        id: "gpt-5.6-sol",
        name: "GPT 5.6 Sol",
        modelName: "gpt-5.6-sol",
        endpoint: "azure",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "gpt-5.6-terra",
        name: "GPT 5.6 Terra",
        modelName: "gpt-5.6-terra",
        endpoint: "azure",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "gpt-5.6-luna",
        name: "GPT 5.6 Luna",
        modelName: "gpt-5.6-luna",
        endpoint: "azure",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "gpt-5.5",
        name: "GPT 5.5",
        modelName: "gpt-5.5",
        endpoint: "azure",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "gpt-5.5-pro",
        name: "GPT 5.5 Pro",
        modelName: "gpt-5.5-pro",
        endpoint: "azure",
        active: true,
        creditWeight: 2.0,
        premiumOnly: true,
        contextLength: 128000,
    },
    {
        id: "gpt-4.5",
        name: "GPT 4.5",
        modelName: "gpt-4.5",
        endpoint: "azure",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "gpt-4o",
        name: "GPT-4o",
        modelName: "gpt-4o",
        endpoint: "azure",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "claude-sonnet-5",
        name: "Claude Sonnet 5",
        modelName: "claude-sonnet-5",
        endpoint: "azure",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 200000,
    },
    {
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6",
        modelName: "claude-sonnet-4-6",
        endpoint: "azure",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 200000,
    },
    {
        id: "claude-opus-4-8",
        name: "Claude Opus 4.8",
        modelName: "claude-opus-4-8",
        endpoint: "azure",
        active: true,
        creditWeight: 2.0,
        premiumOnly: true,
        contextLength: 200000,
    },
    {
        id: "claude-opus-4-6",
        name: "Claude Opus 4.6",
        modelName: "claude-opus-4-6",
        endpoint: "azure",
        active: true,
        creditWeight: 2.0,
        premiumOnly: true,
        contextLength: 200000,
    },
    {
        id: "claude-haiku-4-5",
        name: "Claude Haiku 4.5",
        modelName: "claude-haiku-4-5",
        endpoint: "azure",
        active: true,
        creditWeight: 0.5,
        premiumOnly: false,
        contextLength: 200000,
    },
    {
        id: "deepseek-v4-pro",
        name: "DeepSeek V4 Pro",
        modelName: "deepseek-v4-pro",
        endpoint: "azure",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "deepseek-v4-flash",
        name: "DeepSeek V4 Flash",
        modelName: "deepseek-v4-flash",
        endpoint: "azure",
        active: true,
        creditWeight: 0.5,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "mistral-large-3",
        name: "Mistral Large 3",
        modelName: "mistral-large-3",
        endpoint: "azure",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "gemini-3-flash",
        name: "Gemini 3 Flash",
        modelName: "gemini-3-flash",
        endpoint: "azure",
        active: true,
        creditWeight: 0.5,
        premiumOnly: false,
        contextLength: 1000000,
    },
    {
        id: "gemini-3-pro",
        name: "Gemini 3 Pro",
        modelName: "gemini-3-pro",
        endpoint: "azure",
        active: true,
        creditWeight: 1.5,
        premiumOnly: true,
        contextLength: 1000000,
    },
    // LMSYS Endpoint Models
    {
        id: "kimi-k3",
        name: "Kimi K3",
        modelName: "kimi-k3",
        endpoint: "lmsys",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "kimi-k2.6",
        name: "Kimi K2.6",
        modelName: "kimi-k2.6",
        endpoint: "lmsys",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "llama-4-scout",
        name: "Llama 4 Scout",
        modelName: "llama-4-scout",
        endpoint: "lmsys",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "llama-3.3-70b",
        name: "Llama 3.3 70B",
        modelName: "llama-3.3-70b",
        endpoint: "lmsys",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "command-a",
        name: "Command A",
        modelName: "command-a",
        endpoint: "lmsys",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "qwen3.8-max",
        name: "Qwen 3.8 Max",
        modelName: "qwen3.8-max",
        endpoint: "lmsys",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "qwen3.7-plus",
        name: "Qwen 3.7 Plus",
        modelName: "qwen3.7-plus",
        endpoint: "lmsys",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "grok-4.5",
        name: "Grok 4.5",
        modelName: "grok-4.5",
        endpoint: "lmsys",
        active: true,
        creditWeight: 1.5,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "grok-4",
        name: "Grok 4",
        modelName: "grok-4",
        endpoint: "lmsys",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "minimax-m3",
        name: "MiniMax M3",
        modelName: "minimax-m3",
        endpoint: "lmsys",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "glm-5",
        name: "GLM 5",
        modelName: "glm-5",
        endpoint: "lmsys",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    // Perplexity Endpoint Models
    {
        id: "perplexity-sonar-pro",
        name: "Sonar Pro",
        modelName: "sonar-pro",
        endpoint: "perplexity",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "sonar",
        name: "Sonar",
        modelName: "sonar",
        endpoint: "perplexity",
        active: true,
        creditWeight: 0.5,
        premiumOnly: false,
        contextLength: 128000,
    },
    {
        id: "sonar-pro",
        name: "Sonar Pro",
        modelName: "sonar-pro",
        endpoint: "perplexity",
        active: true,
        creditWeight: 1.0,
        premiumOnly: false,
        contextLength: 128000,
    },
];
/**
 * Strip client/routing prefixes like `chatplayground/`, `cpl/`, `cpl.`, `cp.` from model IDs.
 * Loops so chained prefixes (e.g. `cpl/chatplayground/gpt-4o`) collapse fully.
 */
export function stripChatPlaygroundPrefix(model) {
    let cleaned = (model || "").trim();
    let changed = true;
    while (changed) {
        changed = false;
        for (const prefix of ["chatplayground/", "cpl/", "cpl.", "cp.", "cpl:", "cp:"]) {
            if (cleaned.toLowerCase().startsWith(prefix)) {
                cleaned = cleaned.slice(prefix.length);
                changed = true;
            }
        }
    }
    return cleaned;
}
const EXPLICIT_ENDPOINTS = new Set(["azure", "lmsys", "perplexity"]);
const LMSYS_PROVIDERS = [
    "lmsys",
    "together",
    "anyscale",
    "groq",
    "meta",
    "mistral",
    "qwen",
    "deepseek",
];
const LMSYS_KEYWORDS = ["llama", "qwen", "grok", "glm", "minimax", "command", "kimi"];
function readEndpointHints(modelInfo) {
    if (typeof modelInfo === "string") {
        return { endpoint: "", provider: "", botId: modelInfo.toLowerCase().trim() };
    }
    if (!modelInfo || typeof modelInfo !== "object") {
        return { endpoint: "", provider: "", botId: "" };
    }
    return {
        endpoint: (modelInfo.endpoint || "").toLowerCase().trim(),
        provider: (modelInfo.provider || "").toLowerCase().trim(),
        botId: (modelInfo.botId || modelInfo.modelName || "").toLowerCase().trim(),
    };
}
function isPerplexityHint(provider, botId) {
    return provider === "perplexity" || botId.includes("sonar") || botId.includes("perplexity");
}
function isLmsysHint(provider, botId) {
    return (LMSYS_PROVIDERS.some((p) => provider.includes(p)) ||
        LMSYS_KEYWORDS.some((k) => botId.includes(k)));
}
/**
 * Determine the upstream ChatPlayground endpoint for a model.
 */
export function resolveChatPlaygroundEndpoint(modelInfo) {
    const { endpoint, provider, botId } = readEndpointHints(modelInfo);
    if (EXPLICIT_ENDPOINTS.has(endpoint)) {
        return endpoint;
    }
    if (isPerplexityHint(provider, botId))
        return "perplexity";
    if (isLmsysHint(provider, botId))
        return "lmsys";
    return "azure";
}
function asUnknownArray(value) {
    return Array.isArray(value) ? value : [];
}
function extractRawModelList(data) {
    if (Array.isArray(data))
        return data;
    if (!data || typeof data !== "object")
        return [];
    const rec = data;
    const fromData = asUnknownArray(rec.data);
    if (fromData.length > 0)
        return fromData;
    return asUnknownArray(rec.models);
}
function trimmedString(value) {
    return typeof value === "string" ? value.trim() : "";
}
function parseDiscoveryItem(item, seen) {
    if (!item || typeof item !== "object")
        return null;
    const rec = item;
    const botId = trimmedString(rec.botId);
    if (!botId || seen.has(botId))
        return null;
    if (rec.group && rec.group !== "chat")
        return null;
    seen.add(botId);
    const modelName = trimmedString(rec.modelName) || botId;
    const name = trimmedString(rec.displayName) || modelName;
    return { id: botId, name, owned_by: "chatplayground" };
}
/**
 * Parse raw /api/models JSON response into discovery catalog entries.
 */
export function parseChatPlaygroundDiscoveryModels(data) {
    const seen = new Set();
    const models = [];
    for (const item of extractRawModelList(data)) {
        const parsed = parseDiscoveryItem(item, seen);
        if (parsed)
            models.push(parsed);
    }
    return models;
}
/** Discovery config for `/api/providers/{id}/models` (chatplayground + cpl alias). */
export function buildChatPlaygroundModelsDiscoveryEntry() {
    return {
        url: CHATPLAYGROUND_MODELS_URL,
        method: "GET",
        headers: {
            Accept: "application/json",
            Origin: CHATPLAYGROUND_WEB_ORIGIN,
            Referer: `${CHATPLAYGROUND_WEB_ORIGIN}/`,
        },
        parseResponse: parseChatPlaygroundDiscoveryModels,
    };
}
/**
 * Resolve client model string to a ChatPlayground model definition.
 * Validates against catalog and returns null for unrecognized/invalid models (no synthesis fallback).
 */
export function resolveChatPlaygroundModel(requestedModel, catalog = CHATPLAYGROUND_FALLBACK_MODELS) {
    const stripped = stripChatPlaygroundPrefix(requestedModel).toLowerCase();
    if (!stripped)
        return null;
    // 1. Direct ID match
    const byId = catalog.find((m) => m.id.toLowerCase() === stripped);
    if (byId)
        return byId;
    // 2. Direct modelName match
    const byModelName = catalog.find((m) => m.modelName.toLowerCase() === stripped);
    if (byModelName)
        return byModelName;
    // 3. Direct displayName match
    const byName = catalog.find((m) => m.name.toLowerCase() === stripped);
    if (byName)
        return byName;
    // 4. Suffix match (e.g. "openai/gpt-4o" -> "gpt-4o")
    if (stripped.includes("/")) {
        const afterSlash = stripped.split("/").pop();
        const match = resolveChatPlaygroundModel(afterSlash, catalog);
        if (match)
            return match;
    }
    // Reject unrecognized models without fallback synthesis
    return null;
}
