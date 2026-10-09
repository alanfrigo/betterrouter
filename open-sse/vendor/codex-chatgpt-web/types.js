/**
 * Wire name a chat model sees for a tool. Namespaced (MCP) tools are flattened to
 * "<namespace>__<name>" so they survive the chat-completions function-tool format;
 * the proxy maps this back to {namespace, name} on the return trip (Codex routes MCP
 * calls by an explicit `namespace` field, not by parsing the name).
 */
export function namespacedToolName(namespace, name) {
    return namespace ? `${namespace}__${name}` : name;
}
