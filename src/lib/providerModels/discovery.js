import { isOpenAICompatibleProvider, isAnthropicCompatibleProvider } from "@/shared/constants/providers";
import { GEMINI_CONFIG, ZED_HOSTED_CONFIG } from "@/lib/oauth/constants/oauth";
import { refreshGoogleToken, refreshCodexToken, updateProviderCredentials } from "@/sse/services/tokenRefresh";
import { resolveOllamaLocalHost } from "open-sse/config/providers.js";
import { getModelsByProviderId } from "open-sse/config/providerModels.js";
import { resolveKiroModels } from "open-sse/services/kiroModels.js";
import { resolveKimchiModels } from "open-sse/services/kimchiModels.js";
import { resolveQoderModels } from "open-sse/services/qoderModels.js";
import { resolveGrokCliModels } from "open-sse/services/grokCliModels.js";
import { resolveConnectionProxyConfig } from "@/lib/network/connectionProxy";
import { resolveCursorModels } from "open-sse/services/cursorModels.js";
import { resolveZedModels } from "open-sse/shared/zedAuth.js";
import { resolveClineModels, resolveClinepassModels } from "open-sse/services/clinepassModels.js";
import codexProvider from "open-sse/providers/registry/codex.js";
import registry from "open-sse/providers/registry/index.js";
import { proxyAwareFetch } from "open-sse/utils/proxyFetch.js";
import { GheCopilotExecutor } from "open-sse/executors/ghe-copilot.js";
import { publicProtocolFetch } from "open-sse/executors/protocolSupport.js";
import { updateModelSyncState } from "@/lib/db/repos/modelSyncRepo.js";

async function discoverSpecialModels(connection) {
  const provider = connection.provider;
  const fetchImpl = (url, options = {}) => publicProtocolFetch(url, { ...options, signal: options.signal || AbortSignal.timeout(20000) });
  const token = (connection.apiKey || connection.accessToken || "").replace(/^Bearer\s+/i, "").trim();
  if (provider === "syntx") {
    const { resolveSyntxToken } = await import("open-sse/services/syntxAuth.js");
    const { discoverSyntxModels } = await import("open-sse/services/syntxModels.js");
    return { models: await discoverSyntxModels({ token: resolveSyntxToken(connection), fetchImpl }) };
  }
  if (provider === "twinmind") {
    const { TWINMIND_MODELS_URLS, flattenTwinmindModelsCatalog } = await import("open-sse/services/twinmindModels.js");
    for (const url of TWINMIND_MODELS_URLS) {
      try {
        const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) continue;
        const models = flattenTwinmindModelsCatalog(await response.json());
        if (models.length > 1) return { models };
      } catch {}
    }
    return { error: "Twinmind live discovery unavailable", status: 502 };
  }
  if (provider === "promptql") {
    const { discoverPromptQlModels } = await import("open-sse/services/promptqlModels.js");
    const graphqlEndpoint = connection.providerSpecificData?.graphqlEndpoint || process.env.PROMPTQL_GRAPHQL_ENDPOINT || "https://data.prompt.ql.app/promptql/playground-v2-hge/v1/graphql";
    return { models: await discoverPromptQlModels({ token, graphqlEndpoint, fetchImpl, signal: AbortSignal.timeout(20000) }) };
  }
  if (provider === "adobe-firefly") {
    const { resolveAdobeAccessToken } = await import("open-sse/services/adobeFireflyIms.js");
    const { discoverAdobeFireflyModels } = await import("open-sse/services/adobeFireflyAccount.js");
    const { mapDiscoveredToCatalog } = await import("open-sse/services/adobeFireflyModels.js");
    const accessToken = await resolveAdobeAccessToken(connection, fetchImpl);
    const models = mapDiscoveredToCatalog(await discoverAdobeFireflyModels(accessToken, fetchImpl));
    return { models: models.map((model) => ({ id: model.id, name: model.name, type: model.modality })) };
  }
  if (provider === "aihorde") {
    const { parseHordeImageModels } = await import("open-sse/services/aihordeImageCatalog.js");
    const response = await fetchImpl("https://aihorde.net/api/v2/status/models?type=image");
    if (!response.ok) return { error: `Model discovery returned HTTP ${response.status}`, status: 502 };
    return { models: parseHordeImageModels(await response.json()).map((model) => ({ id: model.name, name: model.name, type: "image" })) };
  }
  return null;
}

async function discoverGheModels(connection) {
  let data = connection.providerSpecificData || {};
  if (!data.copilotToken || !data.copilotApiUrl || Number(data.copilotTokenExpiresAt) * 1000 <= Date.now()) {
    const refreshed = await new GheCopilotExecutor().refreshCredentials(connection);
    if (!refreshed?.copilotToken) return { error: "GHE model credentials unavailable", status: 401 };
    await updateProviderCredentials(connection.id, {
      accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken, expiresIn: refreshed.expiresIn,
    });
    const specific = refreshed.providerSpecificData || {};
    const patch = Object.fromEntries(["copilotToken", "copilotTokenExpiresAt", "copilotApiUrl", "copilotProxyUrl"].filter((key) => specific[key] !== undefined).map((key) => [key, specific[key]]));
    await updateModelSyncState(connection.id, patch);
    data = { ...data, ...patch };
  }
  const root = data.copilotApiUrl || data.copilotProxyUrl;
  if (!root) return { error: "GHE model endpoint unavailable", status: 400 };
  const response = await publicProtocolFetch(`${root.replace(/\/+$/, "")}/models`, {
    headers: { Authorization: `Bearer ${data.copilotToken}`, Accept: "application/json", "Copilot-Integration-Id": "vscode-chat" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) return { error: `Model discovery returned HTTP ${response.status}`, status: 502 };
  return { models: parseOpenAIStyleModels(await response.json()).filter((model) => model.capabilities?.type === "chat" && model.policy?.state !== "disabled") };
}

function getRegistryModelsConfig(connection) {
  const entry = registry.find((item) => item.id === connection.provider);
  const transport = entry?.transport || {};
  const configuredBaseUrl = transport.connectionBaseUrl && connection.providerSpecificData?.baseUrl;
  const modelsUrl = configuredBaseUrl ? null : transport.modelsUrl;
  const endpoint = transport.connectionBaseUrl
    ? connection.providerSpecificData?.baseUrl || transport.localDefault || transport.baseUrl
    : Array.isArray(transport.baseUrls) ? transport.baseUrls[0] : transport.baseUrl;
  if (!modelsUrl && (typeof endpoint !== "string" || (transport.format && !["openai", "claude", "openai-responses"].includes(transport.format)))) return null;
  const url = new URL(modelsUrl || endpoint);
  if (!modelsUrl) {
    if (/\/(chat\/completions|responses|messages)\/?$/.test(url.pathname)) {
      url.pathname = url.pathname.replace(/\/(chat\/completions|responses|messages)\/?$/, "/models");
    } else if (transport.connectionBaseUrl) {
      url.pathname = `${url.pathname.replace(/\/$/, "")}/models`;
    } else return null;
  }
  const auth = transport.auth || {};
  return {
    ...createOpenAIModelsConfig(url.href),
    headers: { ...transport.headers, "Content-Type": "application/json", ...(transport.format === "claude" ? { "anthropic-version": "2023-06-01" } : {}) },
    authHeader: auth.header || (transport.format === "claude" ? "x-api-key" : "Authorization"),
    authPrefix: auth.scheme === "raw" || transport.format === "claude" ? "" : "Bearer ",
    noAuth: entry?.noAuth === true || transport.noAuth === true,
    anonymousApiKey: transport.anonymousApiKey,
    combined: auth.combined === true,
    parseResponse: connection.provider === "aimlapi"
      ? (data) => parseOpenAIStyleModels(data).filter((model) => model.type === "chat-completion").map((model) => ({ ...model, name: model.info?.name || model.name }))
      : parseOpenAIStyleModels,
  };
}

const GEMINI_CLI_MODELS_URL = "https://cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels";

// Model discovery must identify as the same Codex CLI version as inference.
const CODEX_MODELS_URL = `https://chatgpt.com/backend-api/codex/models?client_version=${codexProvider.transport.cliVersion}`;

const parseOpenAIStyleModels = (data) => {
  if (Array.isArray(data)) return data;
  return data?.data || data?.models || data?.results || [];
};

const parseGeminiCliModels = (data) => {
  if (Array.isArray(data?.models)) {
    return data.models
      .map((item) => {
        const id = item?.id || item?.model || item?.name;
        if (!id) return null;
        return { id, name: item?.displayName || item?.name || id };
      })
      .filter(Boolean);
  }

  if (data?.models && typeof data.models === "object") {
    return Object.entries(data.models)
      .filter(([, info]) => !info?.isInternal)
      .map(([id, info]) => ({
        id,
        name: info?.displayName || info?.name || id,
      }));
  }

  return [];
};

const appendCodexReviewModels = (models) => models.flatMap((model) => {
  const id = model?.id || model?.slug || model?.model || model?.name;
  if (!id) return [];
  const name = model?.display_name || model?.displayName || model?.name || id;
  const normalized = { ...model, id, name };
  const isChatModel = (model?.type || "llm") !== "image" && !id.toLowerCase().includes("embed");
  if (!isChatModel || id.endsWith("-review")) return [normalized];
  return [
    normalized,
    {
      ...normalized,
      id: `${id}-review`,
      name: `${name} Review`,
      upstreamModelId: id,
      quotaFamily: "review",
    },
  ];
});

const parseCodexModels = (data) => appendCodexReviewModels(parseOpenAIStyleModels(data));

const createOpenAIModelsConfig = (url) => ({
  url,
  method: "GET",
  headers: { "Content-Type": "application/json" },
  authHeader: "Authorization",
  authPrefix: "Bearer ",
  parseResponse: parseOpenAIStyleModels
});

const getStaticProviderModels = (providerId) =>
  getModelsByProviderId(providerId).map((model) => ({
    ...model,
    id: model.id,
    name: model.name || model.id,
  }));

// Generic custom resolver for OAuth providers that need refresh-on-401 + token persist.
// Receives a `fetchFn(token)` and returns parsed models or throws.
const buildOAuthResolver = ({ refreshFn, fetchFn, parseFn, errorLabel }) => async (connection) => {
  const { accessToken, refreshToken } = connection;
  if (!accessToken) {
    return { error: "No valid token found", status: 401 };
  }
  let warning;
  try {
    let response = await fetchFn(accessToken, connection);
    if (!response.ok && (response.status === 401 || response.status === 403) && refreshToken) {
      const refreshed = await refreshFn(connection);
      if (refreshed?.accessToken) {
        await updateProviderCredentials(connection.id, {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken || refreshToken,
          expiresIn: refreshed.expiresIn,
        });
        connection.accessToken = refreshed.accessToken;
        if (refreshed.refreshToken) connection.refreshToken = refreshed.refreshToken;
        response = await fetchFn(refreshed.accessToken, connection);
      }
    }
    if (response.ok) {
      const data = await response.json();
      const models = parseFn(data);
      if (models.length > 0) return { models };
    } else {
      warning = `${errorLabel}: HTTP ${response.status}`;
    }
  } catch (error) {
    warning = errorLabel;
  }
  return { models: [], warning };
};

// Qoder shares one resolver across intl (qoder) and CN (qoder-cn); the
// credentials carry the connection's provider so qoderModels picks the right
// region's catalog endpoint, and the ids keep the provider prefix.
function buildQoderModelsResolver(providerId) {
  return {
    customResolver: async (connection) => {
      const credentials = {
        provider: providerId,
        accessToken: connection.accessToken,
        apiKey: connection.apiKey,
        refreshToken: connection.refreshToken,
        email: connection.email,
        displayName: connection.displayName,
        providerSpecificData: connection.providerSpecificData || {},
      };
      let warning;
      try {
        const result = await resolveQoderModels(credentials, { forceRefresh: true, signal: AbortSignal.timeout(20000) });
        if (result?.models?.length) {
          return {
            models: result.models.map((m) => ({
              // Use the canonical "<providerId>/<key>" id so the dashboard
              // surfaces the same identifier the chat router expects.
              id: `${providerId}/${m.id}`,
              name: m.name,
              contextLength: m.contextLength,
              isVL: m.isVL,
              isReasoning: m.isReasoning,
              maxOutputTokens: m.maxOutputTokens,
              description: m.description,
            })),
          };
        }
        warning = "Qoder returned no models; falling back to static catalog.";
      } catch (error) {
        warning = "Failed to fetch Qoder models";
      }
      return { models: [], warning };
    },
  };
}

// Provider models endpoints configuration
const PROVIDER_MODELS_CONFIG = {
  "muse": {
    url: "https://api.meta.ai/v1/models",
    method: "GET",
    headers: { "Content-Type": "application/json", "x-api-version": "1.0.0" },
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    parseResponse: (data) => data.data || [],
  },
  claude: {
    url: "https://api.anthropic.com/v1/models",
    method: "GET",
    headers: {
      "Anthropic-Version": "2023-06-01",
      "Content-Type": "application/json"
    },
    authHeader: "x-api-key",
    parseResponse: (data) => data.data || []
  },
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/models",
    method: "GET",
    headers: { "Content-Type": "application/json" },
    authQuery: "key", // Use query param for API key
    parseResponse: (data) => data.models || []
  },
  codex: {
    customResolver: buildOAuthResolver({
      refreshFn: (conn) => refreshCodexToken(conn.refreshToken),
      fetchFn: (token) => fetch(CODEX_MODELS_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "originator": "codex_cli_rs"
        }
      }),
      parseFn: parseCodexModels,
      errorLabel: "Failed to fetch Codex models"
    })
  },
  antigravity: {
    url: "https://daily-cloudcode-pa.sandbox.googleapis.com/v1internal:models",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    body: {},
    parseResponse: (data) => data.models || []
  },
  github: {
    url: "https://api.githubcopilot.com/models",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Copilot-Integration-Id": "vscode-chat",
      "editor-version": "vscode/1.107.1",
      "editor-plugin-version": "copilot-chat/0.26.7",
      "user-agent": "GitHubCopilotChat/0.26.7"
    },
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    parseResponse: (data) => {
      if (!data?.data) return [];
      // Filter out embeddings, non-chat models, and disabled models
      return data.data
        .filter(m => m.capabilities?.type === "chat")
        .filter(m => m.policy?.state !== "disabled") // Only return explicitly enabled models
        .map(m => ({
          id: m.id,
          name: m.name || m.id,
          version: m.version,
          capabilities: m.capabilities,
          isDefault: m.model_picker_enabled === true
        }));
    }
  },
  openai: createOpenAIModelsConfig("https://api.openai.com/v1/models"),
  openrouter: createOpenAIModelsConfig("https://openrouter.ai/api/v1/models"),
  anthropic: {
    url: "https://api.anthropic.com/v1/models",
    method: "GET",
    headers: {
      "Anthropic-Version": "2023-06-01",
      "Content-Type": "application/json"
    },
    authHeader: "x-api-key",
    parseResponse: (data) => data.data || []
  },

  alicode: {
    url: "https://coding.dashscope.aliyuncs.com/v1/models",
    method: "GET",
    headers: { "Content-Type": "application/json" },
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    parseResponse: (data) => data.data || []
  },
  "alicode-intl": {
    url: "https://coding-intl.dashscope.aliyuncs.com/v1/models",
    method: "GET",
    headers: { "Content-Type": "application/json" },
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    parseResponse: (data) => data.data || []
  },
  "alims-intl": {
    url: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models",
    method: "GET",
    headers: { "Content-Type": "application/json" },
    authHeader: "Authorization",
    authPrefix: "Bearer ",
    parseResponse: (data) => data.data || []
  },
  "volcengine-ark": createOpenAIModelsConfig("https://ark.cn-beijing.volces.com/api/coding/v3/models"),
  byteplus: createOpenAIModelsConfig("https://ark.ap-southeast.bytepluses.com/api/coding/v3/models"),

  // OpenAI-compatible API key providers
  deepseek: createOpenAIModelsConfig("https://api.deepseek.com/models"),
  groq: createOpenAIModelsConfig("https://api.groq.com/openai/v1/models"),
  xai: createOpenAIModelsConfig("https://api.x.ai/v1/models"),
  mistral: createOpenAIModelsConfig("https://api.mistral.ai/v1/models"),
  perplexity: createOpenAIModelsConfig("https://api.perplexity.ai/v1/models"),
  "perplexity-agent": createOpenAIModelsConfig("https://api.perplexity.ai/v1/models"),
  together: createOpenAIModelsConfig("https://api.together.xyz/v1/models"),
  fireworks: createOpenAIModelsConfig("https://api.fireworks.ai/inference/v1/models"),
  cerebras: createOpenAIModelsConfig("https://api.cerebras.ai/v1/models"),
  cohere: createOpenAIModelsConfig("https://api.cohere.ai/v1/models"),
  nebius: createOpenAIModelsConfig("https://api.studio.nebius.ai/v1/models"),
  siliconflow: createOpenAIModelsConfig("https://api.siliconflow.com/v1/models"),
  hyperbolic: createOpenAIModelsConfig("https://api.hyperbolic.xyz/v1/models"),
  ollama: createOpenAIModelsConfig("https://ollama.com/api/tags"),
  // ollama-local: url resolved dynamically below via providerSpecificData.baseUrl
  nanobanana: createOpenAIModelsConfig("https://api.nanobananaapi.ai/v1/models"),
  chutes: createOpenAIModelsConfig("https://llm.chutes.ai/v1/models"),
  nvidia: createOpenAIModelsConfig("https://integrate.api.nvidia.com/v1/models"),
  assemblyai: createOpenAIModelsConfig("https://api.assemblyai.com/v1/models"),
  "vercel-ai-gateway": createOpenAIModelsConfig("https://ai-gateway.vercel.sh/v1/models"),
  // OpenAI-compatible aggregators.
  tokenharbor: createOpenAIModelsConfig("https://tokenharbor.ai/v1/models"),
  dahl: createOpenAIModelsConfig("https://inference.dahl.global/v1/models"),
  atria: createOpenAIModelsConfig("https://api.atria-asi.ai/v1/models"),
  agnes: createOpenAIModelsConfig("https://apihub.agnes-ai.com/v1/models"),
  bai: createOpenAIModelsConfig("https://api.b.ai/v1/models"),
  kimchi: {
    customResolver: async (connection) => {
      const result = await resolveKimchiModels({
        accessToken: connection.accessToken,
        apiKey: connection.apiKey,
        providerSpecificData: connection.providerSpecificData || {},
      }, { forceRefresh: true, log: console });
      if (result?.models?.length) {
        return { models: result.models };
      }
      return {
        models: getStaticProviderModels("kimchi"),
        warning: "Kimchi returned no live models; falling back to static catalog.",
      };
    }
  },
  cursor: {
    customResolver: async (connection) => {
      const result = await resolveCursorModels({
        accessToken: connection.accessToken,
        providerSpecificData: connection.providerSpecificData || {},
      }, { forceRefresh: true, log: console, signal: AbortSignal.timeout(20000) });
      if (result?.models?.length) return { models: result.models };
      return {
        models: getStaticProviderModels("cursor"),
        warning: "Cursor returned no live models; falling back to static catalog.",
      };
    },
  },
  // Zed has no static catalog by design (live /models only) — same cursor
  // direct pattern: resolve with the connection's own credentials (never
  // exposed to the browser), return rich metadata, drop disabled entries.
  // Empty/failure yields an explicit warning, never a silent zero list.
  zed: {
    customResolver: async (connection) => {
      try {
        const result = await resolveZedModels({
          accessToken: connection.accessToken,
          providerSpecificData: connection.providerSpecificData || {},
        }, { config: ZED_HOSTED_CONFIG, forceRefresh: true, signal: AbortSignal.timeout(20000) });
        const models = (result?.models || [])
          .filter((m) => m && !m.isDisabled)
          .map((m) => ({
            id: m.id,
            name: m.name || m.id,
            provider: m.provider,
            contextLength: m.contextLength,
            contextLengthInMaxMode: m.contextLengthInMaxMode,
            maxOutputTokens: m.maxOutputTokens,
            supportsTools: m.supportsTools,
            supportsImages: m.supportsImages,
            supportsThinking: m.supportsThinking,
            supportsDisablingThinking: m.supportsDisablingThinking,
            supportsFastMode: m.supportsFastMode,
            supportsServerSideCompaction: m.supportsServerSideCompaction,
            supportedEffortLevels: m.supportedEffortLevels || [],
            supportsStreamingTools: m.supportsStreamingTools,
            supportsParallelToolCalls: m.supportsParallelToolCalls,
          }));
        if (models.length > 0) return { models };
        return { models: [], warning: "Zed returned no live models." };
      } catch (error) {
        return { models: [], warning: "Failed to fetch Zed models" };
      }
    },
  },

  // Cline/ClinePass share api.cline.bot/api/v1/models. The service layer already
  // handles Bearer-vs-`workos:` auth and swallows failures into null, so these follow
  // the cursor direct pattern (no refreshFn) and only differ in filtering:
  // cline returns the whole catalog verbatim, clinepass keeps cline-pass/* only.
  cline: {
    customResolver: async (connection) => {
      const result = await resolveClineModels({
        accessToken: connection.accessToken,
        apiKey: connection.apiKey,
      });
      if (result?.models?.length) return { models: result.models };
      return {
        models: getStaticProviderModels("cline"),
        warning: "Cline returned no live models; falling back to static catalog.",
      };
    },
  },
  clinepass: {
    customResolver: async (connection) => {
      const result = await resolveClinepassModels({
        accessToken: connection.accessToken,
        apiKey: connection.apiKey,
      });
      if (result?.models?.length) return { models: result.models };
      return {
        models: getStaticProviderModels("clinepass"),
        warning: "ClinePass returned no live models; falling back to static catalog.",
      };
    },
  },

  // Custom resolvers (non-OpenAI-shaped APIs / token-refresh flows)
  kiro: {
    customResolver: async (connection) => {
      const credentials = {
        accessToken: connection.accessToken,
        refreshToken: connection.refreshToken,
        providerSpecificData: connection.providerSpecificData || {}
      };
      let warning;
      try {
        const result = await resolveKiroModels(credentials, {
          log: console,
          forceRefresh: true,
          signal: AbortSignal.timeout(20000),
          onCredentialsRefreshed: async (refreshed) => {
            if (refreshed?.accessToken) {
              await updateProviderCredentials(connection.id, {
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken || connection.refreshToken,
                expiresIn: refreshed.expiresIn,
              });
              connection.accessToken = refreshed.accessToken;
              if (refreshed.refreshToken) connection.refreshToken = refreshed.refreshToken;
            }
          }
        });
        if (result?.models?.length) {
          return {
            models: result.models.map((m) => ({
              id: m.id,
              name: m.name,
              upstreamModelId: m.upstreamModelId,
              contextLength: m.contextLength,
              rateMultiplier: m.rateMultiplier,
              capabilities: m.capabilities,
              description: m.description
            }))
          };
        }
        warning = "Kiro returned no models; falling back to static catalog.";
      } catch (error) {
        warning = "Failed to fetch Kiro models";
      }
      return { models: [], warning };
    }
  },
  qoder: buildQoderModelsResolver("qoder"),
  "qoder-cn": buildQoderModelsResolver("qoder-cn"),
  "gemini-cli": {
    customResolver: buildOAuthResolver({
      refreshFn: (conn) => refreshGoogleToken(conn.refreshToken, GEMINI_CONFIG.clientId, GEMINI_CONFIG.clientSecret),
      fetchFn: (token, conn) => {
        const projectId = conn.projectId || conn.providerSpecificData?.projectId;
        const body = projectId ? { project: projectId } : {};
        return fetch(GEMINI_CLI_MODELS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "User-Agent": "google-api-nodejs-client/9.15.1",
            "X-Goog-Api-Client": "google-cloud-sdk vscode_cloudshelleditor/0.1"
          },
          body: JSON.stringify(body)
        });
      },
      parseFn: parseGeminiCliModels,
      errorLabel: "Failed to fetch Gemini CLI models"
    })
  },
  "grok-cli": {
    customResolver: async (connection) => {
      const proxy = await resolveConnectionProxyConfig(connection.providerSpecificData || {});
      const result = await resolveGrokCliModels({
        ...connection,
        connectionId: connection.id,
      }, {
        fetchFn: (url, options, proxyOptions) => proxyAwareFetch(url, { ...options, redirect: "error", signal: AbortSignal.timeout(20000) }, proxyOptions),
        log: console,
        proxyOptions: {
          connectionProxyEnabled: proxy.connectionProxyEnabled === true,
          connectionProxyUrl: proxy.connectionProxyUrl || "",
          connectionNoProxy: proxy.connectionNoProxy || "",
          vercelRelayUrl: proxy.vercelRelayUrl || "",
          strictProxy: proxy.strictProxy === true,
        },
        onCredentialsRefreshed: async (refreshed) => {
          await updateProviderCredentials(connection.id, {
            ...refreshed,
            existingProviderSpecificData: connection.providerSpecificData || {},
          });
        },
      });
      if (result.models.length) return result;
      return {
        models: getStaticProviderModels("grok-cli"),
        warning: "Grok CLI returned no live models; using static catalog.",
      };
    },
  },
  "ollama-local": {
    customResolver: async (connection) => {
      const url = `${resolveOllamaLocalHost(connection)}/api/tags`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        return { error: `Failed to fetch models: ${response.status}`, status: response.status };
      }
      const data = await response.json();
      return { models: parseOpenAIStyleModels(data) };
    }
  }
};


// Credentials only travel to configured upstreams, never across redirects.
const fetch = (url, options = {}) => {
  const target = new URL(url);
  if (!["http:", "https:"].includes(target.protocol) || target.username || target.password) {
    throw new Error("Invalid model discovery URL");
  }
  return globalThis.fetch(target, {
    ...options,
    redirect: "error",
    cache: "no-store",
    signal: options.signal || AbortSignal.timeout(20000),
  });
};

export async function discoverProviderModels(connection) {
  const provider = connection.provider;
  if (provider === "ghe-copilot") return discoverGheModels(connection);
  if (["syntx", "twinmind", "promptql", "adobe-firefly", "aihorde"].includes(provider)) return discoverSpecialModels(connection);
  if (isOpenAICompatibleProvider(provider) || isAnthropicCompatibleProvider(provider)) {
    const baseUrl = connection.providerSpecificData?.baseUrl;
    if (!baseUrl) return { error: "No base URL configured", status: 400 };
    const base = baseUrl.replace(/\/$/, "").replace(/\/messages$/, "");
    const headers = { "Content-Type": "application/json" };
    if (connection.apiKey) headers.Authorization = `Bearer ${connection.apiKey}`;
    if (isAnthropicCompatibleProvider(provider)) {
      if (connection.apiKey) headers["x-api-key"] = connection.apiKey;
      headers["anthropic-version"] = "2023-06-01";
    }
    const response = await fetch(`${base}/models`, { headers });
    if (!response.ok) return { error: `Model discovery returned HTTP ${response.status}`, status: 502 };
    return { models: parseOpenAIStyleModels(await response.json()) };
  }
  const config = PROVIDER_MODELS_CONFIG[provider] || getRegistryModelsConfig(connection);
  if (!config) {
    if (!registry.some((entry) => entry.id === provider)) return { error: "Provider does not support models listing", status: 400 };
    return { models: getStaticProviderModels(provider), source: "static", warning: "Provider does not support live model discovery" };
  }
  if (config.customResolver) {
    const result = await config.customResolver(connection);
    if (result?.warning) return { ...result, source: "fallback" };
    return result;
  }
  const token = connection.providerSpecificData?.copilotToken || connection.accessToken || connection.apiKey || config.anonymousApiKey;
  if (!token && !config.noAuth) return { error: "No valid token found", status: 401 };
  const url = new URL(config.url);
  if (config.authQuery) url.searchParams.set(config.authQuery, token);
  const headers = { ...config.headers };
  if (token && config.authHeader && !config.authQuery) headers[config.authHeader] = (config.authPrefix || "") + token;
  if (token && config.combined) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, {
    method: config.method,
    headers,
    ...(config.body && config.method === "POST" ? { body: JSON.stringify(config.body) } : {}),
  });
  if (!response.ok) return { error: `Model discovery returned HTTP ${response.status}`, status: 502 };
  return { models: config.parseResponse(await response.json()) };
}
