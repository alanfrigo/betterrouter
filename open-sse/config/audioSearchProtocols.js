export const AUDIO_PROTOCOLS = {
  soniox: {
    id: "soniox",
    baseUrl: "https://api.soniox.com/v1/transcriptions",
    authType: "apikey",
    authHeader: "bearer",
    async: true,
    format: "soniox",
    models: [
      { id: "stt-async-v5", name: "Soniox STT Async v5" },
      { id: "stt-async-v4", name: "Soniox STT Async v4" }
    ]
  },
  gladia: {
    id: "gladia",
    baseUrl: "https://api.gladia.io/v2/pre-recorded",
    authType: "apikey",
    authHeader: "x-gladia-key",
    async: true,
    format: "gladia",
    models: [
      { id: "solaria-1", name: "Solaria 1" },
      { id: "solaria-mini", name: "Solaria Mini" }
    ]
  },
  "rev-ai": {
    id: "rev-ai",
    baseUrl: "https://api.rev.ai/speechtotext/v1",
    authType: "apikey",
    authHeader: "bearer",
    async: true,
    format: "rev-ai",
    models: [
      { id: "machine", name: "Reverb ASR" },
      { id: "low_cost", name: "Low-Cost ASR" },
      { id: "fusion", name: "Fusion ASR" }
    ]
  },
  speechmatics: {
    id: "speechmatics",
    baseUrl: "https://asr.api.speechmatics.com/v2/jobs",
    authType: "apikey",
    authHeader: "bearer",
    async: true,
    format: "speechmatics",
    models: [{ id: "enhanced", name: "Enhanced" }]
  }
};
export const SPEECH_PROTOCOLS = { "aws-polly": {
  id: "aws-polly",
  baseUrl: "https://polly.us-east-1.amazonaws.com",
  authType: "apikey",
  authHeader: "aws-sigv4",
  format: "aws-polly",
  models: [
    { id: "standard", name: "Polly Standard" },
    { id: "neural", name: "Polly Neural" },
    { id: "long-form", name: "Polly Long-Form" },
    { id: "generative", name: "Polly Generative" }
  ]
} };
export const SEARCH_PROTOCOLS = {
  "perplexity-search": {
    id: "perplexity-search",
    name: "Perplexity Search",
    baseUrl: "https://api.perplexity.ai/search",
    method: "POST",
    authType: "apikey",
    authHeader: "bearer",
    costPerQuery: 0.005,
    freeMonthlyQuota: 0,
    searchTypes: ["web"],
    defaultMaxResults: 5,
    maxMaxResults: 20,
    timeoutMs: 1e4,
    cacheTTLMs: 5 * 60 * 1000
  },
  "nimble-search": {
    id: "nimble-search",
    name: "Nimble Search",
    baseUrl: "https://sdk.nimbleway.com/v1/search",
    method: "POST",
    authType: "apikey",
    authHeader: "bearer",
    costPerQuery: 0.005,
    freeMonthlyQuota: 0,
    searchTypes: ["web", "news"],
    defaultMaxResults: 5,
    maxMaxResults: 100,
    timeoutMs: 1e4,
    cacheTTLMs: 5 * 60 * 1000
  },
  firecrawl: {
    id: "firecrawl",
    name: "Firecrawl",
    baseUrl: "https://api.firecrawl.dev/v2/search",
    method: "POST",
    authType: "apikey",
    authHeader: "bearer",
    costPerQuery: 0.002,
    freeMonthlyQuota: 1000,
    searchTypes: ["web", "news"],
    defaultMaxResults: 5,
    maxMaxResults: 100,
    timeoutMs: 30000,
    cacheTTLMs: 5 * 60 * 1000
  },
  context7: {
    id: "context7",
    name: "Context7 (library docs)",
    baseUrl: "https://context7.com/api/v1",
    method: "GET",
    authType: "none",
    authHeader: "none",
    costPerQuery: 0,
    freeMonthlyQuota: 999999,
    searchTypes: ["web"],
    defaultMaxResults: 5,
    maxMaxResults: 20,
    timeoutMs: 1e4,
    cacheTTLMs: 5 * 60 * 1000,
    fallbackOnly: true
  },
  "x-search": {
    id: "x-search",
    name: "X Search (Grok)",
    baseUrl: "https://api.x.ai/v1/responses",
    method: "POST",
    authType: "apikey",
    authHeader: "bearer",
    costPerQuery: 0,
    freeMonthlyQuota: 0,
    searchTypes: ["x"],
    defaultMaxResults: 5,
    maxMaxResults: 20,
    timeoutMs: 60000,
    cacheTTLMs: 5 * 60 * 1000
  },
  "anysearch-search": {
    id: "anysearch-search",
    name: "AnySearch",
    baseUrl: "https://api.anysearch.com/v1/search",
    method: "POST",
    authType: "apikey",
    authHeader: "bearer",
    costPerQuery: 0,
    freeMonthlyQuota: 0,
    searchTypes: ["web"],
    defaultMaxResults: 5,
    maxMaxResults: 10,
    timeoutMs: 1e4,
    cacheTTLMs: 5 * 60 * 1000,
    fallbackOnly: true
  }
};
