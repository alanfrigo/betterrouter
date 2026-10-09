import { AI_PROVIDERS } from "@/shared/constants/providers";

export function usesAwsCredentialForm(provider) {
  return AI_PROVIDERS[provider]?.credentialForm === "aws";
}

const SECRET_FIELD = /(?:secret|password|api[_-]?key|access[_-]?token|refresh[_-]?token|id[_-]?token|cookie|session[_-]?token|storage[_-]?state|service[_-]?account|private[_-]?key|copilot[_-]?token|authorization|credentials|codexAppServerToken)/i;
const SECRET_KEYS = new Set(["token", "token_v2", "jwt", "bearer", "convexSessionId", "arpSessionId", "__client", "__session", "runtimeKey", "ucSid", "sid", "inputs", "customVariables"]);

export function isProviderSecretField(name, provider) {
  return SECRET_FIELD.test(name) || SECRET_KEYS.has(name) || AI_PROVIDERS[provider]?.credentialFields?.some((field) => field.name === name && field.secret);
}

export function redactProviderSecrets(value, provider) {
  if (Array.isArray(value)) return value.map((item) => redactProviderSecrets(item, provider));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).filter(([name]) => !isProviderSecretField(name, provider)).map(([name, item]) => [name, redactProviderSecrets(item, provider)]));
}

export function mergeProviderSecretFields(existing = {}, incoming = {}, provider) {
  const merged = { ...existing };
  for (const [name, value] of Object.entries(incoming)) {
    if (["__proto__", "constructor", "prototype"].includes(name)) continue;
    if (isProviderSecretField(name, provider) && value === "") continue;
    if (isProviderSecretField(name, provider) && value === null) delete merged[name];
    else if (value && typeof value === "object" && !Array.isArray(value)) merged[name] = mergeProviderSecretFields(existing[name] || {}, value, provider);
    else merged[name] = value;
  }
  return merged;
}

export function toProviderConnectionResponse(connection) {
  return redactProviderSecrets(connection, connection.provider);
}
