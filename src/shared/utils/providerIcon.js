// Provider icon paths under /public/providers.
// Alias related brands; session-cache 404s so one miss never spams again.

const ICON_ALIASES = {
  "perplexity-agent": "perplexity",
  "gitlab-duo": "gitlab",
  "vercel-ai-gateway": "vercel",
  "ollama-search": "ollama",
  // MiniMax Code rides the existing MiniMax brand mark
  "minimax-code": "minimax",
  "minimax-code-global": "minimax",
};
const SVG_ICONS = new Set(["360ai","alibaba","anthropic","arcee-ai","assemblyai","auggie","baichuan","baidu","baseten","bluesminds","bytez","cerebras","charm-hyper","chutes","claude-web","claude","cline","codex","cohere","comfyui","coze","crof","cursor","deepgram","deepinfra","deepseek","dgrid","dify","dit","doubao","elevenlabs","factory","fireworks","freeaiapikey","freemodel-dev","galadriel","gemini","gitlawb-gmi","gitlawb","groq","hcnsec","heroku","huggingchat","huggingface","hyperbolic","iflytek","kenari","kimi","kiro","liquid","llm7","longcat","minimax","mistral","monsterapi","moonshot","morph","nebius","nomic","notrack-web","novita","nube","nvidia","openadapter","openai","openrouter","opper","orcarouter","ovhcloud","perplexity","pioneer","poe","pollinations","poolside","publicai","recraft","requesty","sambanova","sensenova","snowflake","sparkdesk","stepfun","sumopod","t3-web","tencent","tokenrouter","trae","udio","uncloseai","upstage","veoaifree-web","vllm","volcengine","wafer","x5lab","xai","xinference","yi","yuanbao-web","zed-hosted","zenmux-free","zenmux"]);

// Runtime only — first 404 remembers id for the whole session
const failedIds = new Set();

function normalizeId(providerId) {
  if (!providerId || typeof providerId !== "string") return "";
  return providerId.trim().toLowerCase();
}

/** Resolve icon file id (after alias). Empty if previously failed this session. */
export function resolveProviderIconId(providerId) {
  const id = normalizeId(providerId);
  if (!id) return "";
  if (failedIds.has(id)) return "";
  const aliased = ICON_ALIASES[id] || id;
  if (failedIds.has(aliased)) return "";
  return aliased;
}

/** `/providers/{id}.png` or null when previously failed. */
export function getProviderIconSrc(providerId) {
  const id = resolveProviderIconId(providerId);
  return id ? `/providers/${id}.${SVG_ICONS.has(id) ? "svg" : "png"}` : null;
}

/** Call from img onError so later mounts skip the request. */
export function markProviderIconMissing(providerId) {
  const id = normalizeId(providerId);
  if (id) failedIds.add(id);
  const aliased = ICON_ALIASES[id];
  if (aliased) failedIds.add(aliased);
}
