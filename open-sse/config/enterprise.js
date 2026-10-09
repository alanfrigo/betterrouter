// Provider-owned endpoint defaults. Tenant-scoped services require a configured URL.
export const ENTERPRISE_DEFAULTS = {
  "azure-ai": "",
  watsonx: "https://ca-tor.ml.cloud.ibm.com/ml/gateway/v1",
  oci: "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/openai/v1",
  sap: "",
  datarobot: "https://app.datarobot.com",
  clarifai: "https://api.clarifai.com/v2/ext/openai/v1",
  snowflake: "",
  databricks: "",
  heroku: "https://us.inference.heroku.com",
  gigachat: "https://gigachat.devices.sberbank.ru/api/v1",
  dify: "https://api.dify.ai/v1",
  coze: "https://api.coze.com",
};

export const GIGACHAT_AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
export const GIGACHAT_SCOPE = "GIGACHAT_API_PERS";
export const AZURE_AI_API_VERSION = "2024-12-01-preview";

export function enterpriseBaseUrl(provider, data = {}) {
  const value = typeof data.baseUrl === "string" ? data.baseUrl.trim() : "";
  const target = value || ENTERPRISE_DEFAULTS[provider];
  if (!target) throw new Error(`${provider} base URL is required`);
  const url = new URL(target);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Provider base URL must use HTTP(S) without embedded credentials");
  }
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/, "");
  return url;
}

export function enterpriseChatUrl(provider, model, data = {}) {
  const url = enterpriseBaseUrl(provider, data);
  let path = url.pathname.replace(/\/+$/, "").replace(/\/(?:chat\/completions|responses|models)$/i, "");
  switch (provider) {
    case "azure-ai": {
      const classic = /\.(?:openai\.azure\.com|cognitiveservices\.azure\.com)$/i.test(url.hostname) && !/\/v1(?:\/|$)/.test(path);
      if (classic) {
        if (!model) throw new Error("Azure deployment name is required");
        path = path.replace(/\/openai(?:\/deployments\/[^/]+)?$/i, "");
        url.pathname = `${path}/openai/deployments/${encodeURIComponent(model)}/chat/completions`;
        url.searchParams.set("api-version", data.apiVersion || AZURE_AI_API_VERSION);
        return url.toString();
      }
      if (!path || path === "/") path = "/openai/v1";
      else if (path.endsWith("/openai")) path += "/v1";
      break;
    }
    case "watsonx":
      if (!path || path === "/") path = "/ml/gateway/v1";
      else if (path.endsWith("/ml/gateway")) path += "/v1";
      break;
    case "oci":
      if (!path || path === "/") path = "/openai/v1";
      else if (path.endsWith("/openai")) path += "/v1";
      break;
    case "sap":
      if (!/\/v2\/lm\/deployments\/[^/]+$/i.test(path)) throw new Error("SAP base URL must be a deployment URL under /v2/lm/deployments/<id>");
      break;
    case "datarobot":
      if (/\/api\/v2\/deployments\/[^/]+$/i.test(path)) break;
      path = path.replace(/\/genai\/llmgw(?:\/chat)?$/i, "");
      if (!path.endsWith("/api/v2")) path += "/api/v2";
      url.pathname = `${path}/genai/llmgw/chat/completions/`;
      return url.toString();
    case "clarifai":
      if (!path || path === "/") path = "/v2/ext/openai/v1";
      break;
    case "snowflake":
      // Cortex's legacy inference:complete response is not OpenAI-compatible.
      path = path.replace(/\/cortex\/inference(?::|\/)complete$/i, "");
      if (/\/aigateways\/[^/]+(?:\/v1)?$/i.test(path)) {
        if (!path.endsWith("/v1")) path += "/v1";
      } else {
        path = path.replace(/\/api\/v2(?:\/cortex(?:\/v1)?)?$/i, "");
        path += "/api/v2/cortex/v1";
      }
      break;
    case "databricks":
      if (!path || path === "/") path = "/serving-endpoints";
      break;
    case "heroku":
      if (!path.endsWith("/v1")) path += "/v1";
      break;
    case "dify":
      path = path.replace(/\/chat-messages$/i, "");
      if (!path.endsWith("/v1")) path += "/v1";
      url.pathname = `${path}/chat-messages`;
      return url.toString();
    case "coze":
      path = path.replace(/\/v[13](?:\/chat)?$/i, "");
      url.pathname = `${path}/v3/chat`;
      if (data.conversationId) url.searchParams.set("conversation_id", data.conversationId);
      return url.toString();
  }
  url.pathname = `${path}/chat/completions`;
  return url.toString();
}
