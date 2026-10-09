import { z } from "zod";
export const ANYSEARCH_SEARCH_PROVIDER_ID = "anysearch-search";

export class AnysearchSearchEnvelopeError extends Error {
  code;
  quota;
  constructor(code, quota, message) {
    super(message);
    this.code = code;
    this.quota = quota;
    this.name = "AnysearchSearchEnvelopeError";
  }
}
const QUOTA_SIGNAL = /quota|exceed|limit|balance|credit|exhaust/i;
export function detectAnysearchEnvelopeError(data) {
  if (!data || typeof data !== "object" || Array.isArray(data))
    return null;
  const record = data;
  const code = record.code;
  if (typeof code !== "number" || code === 0)
    return null;
  const message = typeof record.message === "string" && record.message || typeof record.error === "string" && record.error || typeof record.error_code === "string" && record.error_code || `AnySearch envelope error (code ${code})`;
  return new AnysearchSearchEnvelopeError(code, QUOTA_SIGNAL.test(message), message);
}
const AnysearchItemSchema = z.object({
  title: z.string().optional(),
  url: z.string().optional(),
  snippet: z.string().optional(),
  summary: z.string().optional(),
  score: z.number().optional(),
  date: z.string().optional(),
  published_at: z.string().optional()
}).passthrough();
export function extractAnysearchSearchItems(data, maxResults) {
  if (!data || typeof data !== "object")
    return [];
  const record = data;
  const inner = record.data && typeof record.data === "object" && !Array.isArray(record.data) ? record.data : {};
  const candidates = [
    inner.results,
    record.results,
    inner.items,
    record.items,
    Array.isArray(record.data) ? record.data : undefined
  ];
  const rows = candidates.find((c) => Array.isArray(c)) ?? [];
  const items = [];
  for (const row of rows) {
    const parsed = AnysearchItemSchema.safeParse(row);
    if (!parsed.success || !parsed.data.url)
      continue;
    items.push({
      title: parsed.data.title,
      url: parsed.data.url,
      snippet: parsed.data.snippet ?? parsed.data.summary,
      score: parsed.data.score,
      publishedAt: parsed.data.published_at ?? parsed.data.date
    });
    if (items.length >= maxResults)
      break;
  }
  return items;
}
export function buildAnysearchSearchRequest(config, params) {
  const maxResults = Math.min(Math.max(Math.trunc(params.maxResults) || 5, 1), 10);
  return {
    url: config.baseUrl.replace(/\/+$/, ""),
    init: {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...params.token ? { Authorization: `Bearer ${params.token}` } : {}
      },
      body: JSON.stringify({ query: params.query, max_results: maxResults })
    }
  };
}
export function normalizeAnysearchSearchResponse(data, makeResult) {
  const envelopeError = detectAnysearchEnvelopeError(data);
  if (envelopeError)
    throw envelopeError;
  const now = new Date().toISOString();
  const items = extractAnysearchSearchItems(data, 10);
  const results = items.map((item, index) => makeResult(ANYSEARCH_SEARCH_PROVIDER_ID, {
    title: item.title || item.url,
    url: item.url,
    snippet: item.snippet ?? "",
    score: item.score,
    published_at: item.publishedAt,
    source_type: "web"
  }, index, now));
  return { results, totalResults: results.length };
}
