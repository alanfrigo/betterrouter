import { AntigravityExecutor } from "./antigravity.js";
import { AzureExecutor } from "./azure.js";
import { BedrockExecutor } from "./bedrock.js";
import { GeminiCLIExecutor } from "./gemini-cli.js";
import { GithubExecutor } from "./github.js";
import { IFlowExecutor } from "./iflow.js";
import { QoderExecutor } from "./qoder.js";
import { KiroExecutor } from "./kiro.js";
import { KimchiExecutor } from "./kimchi.js";
import { CodexExecutor } from "./codex.js";
import { CursorExecutor } from "./cursor.js";
import { VertexExecutor } from "./vertex.js";
import { OpenCodeExecutor } from "./opencode.js";
import { OpenCodeGoExecutor } from "./opencode-go.js";
import { OpenCodeZenExecutor } from "./opencode-zen.js";
import { GrokWebExecutor } from "./grok-web.js";
import { GrokCliExecutor } from "./grok-cli.js";
import { PerplexityWebExecutor } from "./perplexity-web.js";
import { OllamaLocalExecutor } from "./ollama-local.js";
import { CommandCodeExecutor } from "./commandcode.js";
import { XiaomiTokenplanExecutor } from "./xiaomi-tokenplan.js";
import { XiaomiMimoExecutor } from "./xiaomi-mimo.js";
import { MimoFreeExecutor } from "./mimo-free.js";
import { CodeBuddyExecutor } from "./codebuddy-cn.js";
import { CodeBuddyIntlExecutor } from "./codebuddy-intl.js";
import TraeExecutor from "./trae.js";
import ZedExecutor from "./zed.js";
import WindsurfExecutor from "./windsurf.js";
import { DefaultExecutor } from "./default.js";
import { MinimaxCodeExecutor } from "./minimax-code.js";
import { DevinCliExecutor } from "./devin-cli.js";
import { EnterpriseExecutor } from "./enterprise.js";
import { FreebuffExecutor } from "./freebuff.js";
import { GlmExecutor } from "./glm.js";
import { GheCopilotExecutor } from "./ghe-copilot.js";
import { GitlabExecutor } from "./gitlab.js";
import { MoonshotExecutor } from "./moonshot.js";
import { AuggieExecutor } from "./auggie.js";
import { ZcodeExecutor } from "./zcode.js";
import { CodexAppServerExecutor } from "./codex-app-server.js";
import { DevinDesktopExecutor } from "./devin-desktop.js";
import { DevinCliAgenticExecutor } from "./devin-cli-agentic.js";
import { UpstreamProxyExecutor } from "./upstream-proxy.js";
import { CursorApiExecutor } from "./cursor-api.js";
import { AdaptaWebExecutor } from "./adapta-web.js";
import { BlackboxWebExecutor } from "./blackbox-web.js";
import { ChatGptWebExecutor } from "./chatgpt-web.js";
import { ChatGptWebCodexExecutor } from "./chatgpt-web-codex.js";
import { ChatPlaygroundExecutor } from "./chatplayground.js";
import { ClaudeWebExecutor } from "./claude-web.js";
import { ConolWebExecutor } from "./conol-web.js";
import { CopilotM365WebExecutor } from "./copilot-m365-web.js";
import { CopilotWebExecutor } from "./copilot-web.js";
import { DeepSeekWebWithAutoRefreshExecutor } from "./deepseek-web-with-auto-refresh.js";
import { DoubaoWebExecutor } from "./doubao-web.js";
import { GeminiWebExecutor } from "./gemini-web.js";
import { HuggingChatExecutor } from "./huggingchat.js";
import { InnerAiExecutor } from "./inner-ai.js";
import { KimiWebExecutor } from "./kimi-web.js";
import { LMArenaExecutor } from "./lmarena.js";
import { MaxAiExecutor } from "./maxai.js";
import { MuseSparkWebExecutor } from "./muse-spark-web.js";
import { NotionWebExecutor } from "./notion-web.js";
import { NotrackWebExecutor } from "./notrack-web.js";
import { T3ChatWebExecutor } from "./t3-chat-web.js";
import { TencentAIStudioWebExecutor } from "./tencent-aistudio-web.js";
import { TinyCmsExecutor } from "./tinycms.js";
import { UcExecutor } from "./uc.js";
import { YuanbaoWebExecutor } from "./yuanbao-web.js";
import { ZaiWebExecutor } from "./zai-web.js";
import { ZenmuxFreeExecutor } from "./zenmux-free.js";
import { DuckDuckGoWebExecutor } from "./duckduckgo-web.js";
import { CloudflarePlaygroundExecutor } from "./cloudflare-playground.js";
import { VeoAIFreeWebExecutor } from "./veoaifree-web.js";
import { NlpCloudExecutor } from "./nlpcloud.js";
import { OneMinAiExecutor } from "./oneminai.js";
import { ClovaStudioExecutor } from "./clova-studio.js";
import { PromptQlExecutor } from "./promptql.js";
import { HyperAgentExecutor } from "./hyperagent.js";
import { PollinationsExecutor } from "./pollinations.js";
import { CheaperInferenceExecutor } from "./cheaperinference.js";
import { TwinmindExecutor } from "./twinmind.js";
import { SyntxExecutor } from "./syntx.js";

const executors = {
  antigravity: new AntigravityExecutor(),
  azure: new AzureExecutor(),
  "gemini-cli": new GeminiCLIExecutor(),
  github: new GithubExecutor(),
  iflow: new IFlowExecutor(),
  qoder: new QoderExecutor(),
  "qoder-cn": new QoderExecutor("qoder-cn"),
  kiro: new KiroExecutor(),
  kimchi: new KimchiExecutor(),
  codex: new CodexExecutor(),
  cursor: new CursorExecutor(),
  cu: new CursorExecutor(), // Alias for cursor
  vertex: new VertexExecutor("vertex"),
  "vertex-partner": new VertexExecutor("vertex-partner"),
  opencode: new OpenCodeExecutor(),
  "opencode-go": new OpenCodeGoExecutor(),
  "opencode-zen": new OpenCodeZenExecutor(),
  "grok-web": new GrokWebExecutor(),
  "grok-cli": new GrokCliExecutor(),
  gcli: new GrokCliExecutor(), // Alias
  gb: new GrokCliExecutor(), // Alias (Grok Build)
  "perplexity-web": new PerplexityWebExecutor(),
  "ollama-local": new OllamaLocalExecutor(),
  commandcode: new CommandCodeExecutor(),
  "xiaomi-tokenplan": new XiaomiTokenplanExecutor(),
  "xiaomi-mimo": new XiaomiMimoExecutor(),
  "mimo-free": new MimoFreeExecutor(),
  mmf: new MimoFreeExecutor(), // Alias for mimo-free
  "codebuddy-cn": new CodeBuddyExecutor(),
  "codebuddy-intl": new CodeBuddyIntlExecutor(),
  trae: new TraeExecutor(),
  zed: new ZedExecutor(),
  windsurf: new WindsurfExecutor(),
  "minimax-code": new MinimaxCodeExecutor("minimax-code"),
  "minimax-code-global": new MinimaxCodeExecutor("minimax-code-global"),
  "devin-cli": new DevinCliExecutor(),
  bedrock: new BedrockExecutor(),
  br: new BedrockExecutor(), // Alias for bedrock
  // Second Bedrock entry for xAI's Grok, which speaks OpenAI Chat Completions rather than the
  // Anthropic Messages format. Same executor, different registry transport format — the pattern
  // vertex / vertex-partner already uses.
  "bedrock-xai": new BedrockExecutor("bedrock-xai"),
  brx: new BedrockExecutor("bedrock-xai"), // Alias for bedrock-xai
  ...Object.fromEntries(["azure-ai", "watsonx", "oci", "sap", "datarobot", "clarifai", "snowflake", "databricks", "heroku", "gigachat", "dify", "coze"].map((provider) => [provider, new EnterpriseExecutor(provider)])),
  freebuff: new FreebuffExecutor(),
  glm: new GlmExecutor("glm"),
  "glm-cn": new GlmExecutor("glm-cn"),
  glmt: new GlmExecutor("glmt"),
  "ghe-copilot": new GheCopilotExecutor(),
  gitlab: new GitlabExecutor("gitlab"),
  "gitlab-duo": new GitlabExecutor("gitlab-duo"),
  moonshot: new MoonshotExecutor(),
  auggie: new AuggieExecutor(),
  zcode: new ZcodeExecutor(),
  "codex-app-server": new CodexAppServerExecutor(),
  "devin-desktop": new DevinDesktopExecutor(),
  "devin-cli-agentic": new DevinCliAgenticExecutor(),
  cliproxyapi: new UpstreamProxyExecutor("cliproxyapi"),
  "9router": new UpstreamProxyExecutor("9router"),
  "cursor-api": new CursorApiExecutor(),
  agy: new AntigravityExecutor("agy"),
  "amazon-q": new KiroExecutor("amazon-q"),
  "adapta-web": new AdaptaWebExecutor(),
  "blackbox-web": new BlackboxWebExecutor(),
  "chatgpt-web": new ChatGptWebExecutor(),
  "chatgpt-web-codex": new ChatGptWebCodexExecutor(),
  "chatplayground": new ChatPlaygroundExecutor(),
  "claude-web": new ClaudeWebExecutor(),
  "conol-web": new ConolWebExecutor(),
  "copilot-m365-web": new CopilotM365WebExecutor(),
  "copilot-web": new CopilotWebExecutor(),
  "deepseek-web": new DeepSeekWebWithAutoRefreshExecutor(),
  "doubao-web": new DoubaoWebExecutor(),
  "gemini-web": new GeminiWebExecutor(),
  "huggingchat": new HuggingChatExecutor(),
  "inner-ai": new InnerAiExecutor(),
  "kimi-web": new KimiWebExecutor(),
  "lmarena": new LMArenaExecutor(),
  "maxai": new MaxAiExecutor(),
  "muse-spark-web": new MuseSparkWebExecutor(),
  "notion-web": new NotionWebExecutor(),
  "notrack-web": new NotrackWebExecutor(),
  "t3-web": new T3ChatWebExecutor(),
  "tencent-aistudio-web": new TencentAIStudioWebExecutor(),
  "tinycms-web": new TinyCmsExecutor(),
  "uc": new UcExecutor(),
  "yuanbao-web": new YuanbaoWebExecutor(),
  "zai-web": new ZaiWebExecutor(),
  "zenmux-free": new ZenmuxFreeExecutor(),
  "duckduckgo-web": new DuckDuckGoWebExecutor(),
  "cloudflare-playground": new CloudflarePlaygroundExecutor(),
  "veoaifree-web": new VeoAIFreeWebExecutor(),
  "nlpcloud": new NlpCloudExecutor(),
  "oneminai": new OneMinAiExecutor(),
  "clova-studio": new ClovaStudioExecutor(),
  "promptql": new PromptQlExecutor(),
  "hyperagent": new HyperAgentExecutor(),
  "pollinations": new PollinationsExecutor(),
  "cheaperinference": new CheaperInferenceExecutor(),
  "twinmind": new TwinmindExecutor(),
  "syntx": new SyntxExecutor(),
};

const defaultCache = new Map();

export function getExecutor(provider) {
  if (["jules", "devin", "codex-cloud"].includes(provider)) throw new Error(`${provider} is a cloud task provider; use /v1/agents/${provider}`);
  if (executors[provider]) return executors[provider];
  if (!defaultCache.has(provider)) defaultCache.set(provider, new DefaultExecutor(provider));
  return defaultCache.get(provider);
}

export function hasSpecializedExecutor(provider) {
  return !!executors[provider];
}

export { BaseExecutor } from "./base.js";
export { AntigravityExecutor } from "./antigravity.js";
export { AzureExecutor } from "./azure.js";
export { BedrockExecutor } from "./bedrock.js";
export { GeminiCLIExecutor } from "./gemini-cli.js";
export { GithubExecutor } from "./github.js";
export { IFlowExecutor } from "./iflow.js";
export { QoderExecutor } from "./qoder.js";
export { KiroExecutor } from "./kiro.js";
export { KimchiExecutor } from "./kimchi.js";
export { CodexExecutor } from "./codex.js";
export { CursorExecutor } from "./cursor.js";
export { VertexExecutor } from "./vertex.js";
export { DefaultExecutor } from "./default.js";
export { OpenCodeExecutor } from "./opencode.js";
export { OpenCodeGoExecutor } from "./opencode-go.js";
export { OpenCodeZenExecutor } from "./opencode-zen.js";
export { GrokWebExecutor } from "./grok-web.js";
export { GrokCliExecutor } from "./grok-cli.js";
export { PerplexityWebExecutor } from "./perplexity-web.js";
export { OllamaLocalExecutor } from "./ollama-local.js";
export { CommandCodeExecutor } from "./commandcode.js";
export { XiaomiTokenplanExecutor } from "./xiaomi-tokenplan.js";
export { XiaomiMimoExecutor } from "./xiaomi-mimo.js";
export { MimoFreeExecutor } from "./mimo-free.js";
export { CodeBuddyExecutor } from "./codebuddy-cn.js";
export { CodeBuddyIntlExecutor } from "./codebuddy-intl.js";
export { default as TraeExecutor } from "./trae.js";
export { default as ZedExecutor } from "./zed.js";
export { default as WindsurfExecutor } from "./windsurf.js";
export { DevinCliExecutor } from "./devin-cli.js";
