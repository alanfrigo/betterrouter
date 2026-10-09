import { assertPublicUrl as parseAndValidatePublicUrl } from "../../../src/shared/utils/ssrfGuard.js";
function parseDomainFilter(domainFilter) {
  if (!domainFilter?.length)
    return { includes: [], excludes: [] };
  const includes = domainFilter.filter((d) => !d.startsWith("-"));
  const excludes = domainFilter.filter((d) => d.startsWith("-")).map((d) => d.slice(1));
  return { includes, excludes };
}
function firecrawlSearchTbs(timeRange) {
  if (!timeRange || timeRange === "any")
    return;
  const map = {
    day: "qdr:d",
    week: "qdr:w",
    month: "qdr:m",
    year: "qdr:y"
  };
  return map[timeRange];
}
export function buildFirecrawlSearchRequest(config, params) {
  const envBase = process.env.FIRECRAWL_BASE_URL?.trim().replace(/\/+$/, "");
  const providerData = params.providerSpecificData;
  const paramBase = typeof params.baseUrl === "string" ? params.baseUrl : providerData?.baseUrl;
  const customBase = typeof paramBase === "string" && paramBase.trim() ? paramBase.trim().replace(/\/+$/, "") : undefined;
  const rawBase = envBase || customBase;
  if (customBase) {
    parseAndValidatePublicUrl(customBase);
  }
  const url = rawBase ? `${rawBase}/v2/search` : config.baseUrl;
  const { includes, excludes } = parseDomainFilter(params.domainFilter);
  const source = params.searchType === "news" ? "news" : "web";
  const body = {
    query: params.query,
    limit: params.maxResults,
    sources: [source]
  };
  if (params.country)
    body.country = params.country.toLowerCase();
  if (params.language)
    body.lang = params.language;
  const tbs = firecrawlSearchTbs(params.timeRange);
  if (tbs)
    body.tbs = tbs;
  if (includes.length)
    body.includeDomains = includes.map((d) => d.toLowerCase());
  if (excludes.length)
    body.excludeDomains = excludes.map((d) => d.toLowerCase());
  const headers = { "Content-Type": "application/json" };
  if (params.token) {
    headers.Authorization = `Bearer ${params.token}`;
  }
  return {
    url,
    init: {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    }
  };
}
function pickFirecrawlSearchItems(data, searchType) {
  const buckets = data?.data;
  if (!buckets || Array.isArray(buckets))
    return [];
  const items = searchType === "news" ? buckets.news : buckets.web;
  return Array.isArray(items) ? items : [];
}
export function collectFirecrawlSearchHits(data, searchType) {
  const isNews = searchType === "news";
  return pickFirecrawlSearchItems(data, searchType).map((item) => ({
    title: item.title || item.metadata?.title || "",
    url: item.url || item.metadata?.sourceURL || item.link || "",
    snippet: item.description || item.snippet || item.markdown?.slice(0, 300) || item.content?.slice(0, 300) || "",
    published_at: item.date || item.published_at || item.metadata?.publishedTime || null,
    image_url: item.imageUrl || undefined,
    source_type: isNews ? "news" : undefined
  }));
}
export function normalizeFirecrawlSearchResponse(data, searchType, makeResult) {
  const now = new Date().toISOString();
  const results = collectFirecrawlSearchHits(data, searchType).map((item, idx) => makeResult("firecrawl", item, idx, now));
  return { results, totalResults: results.length };
}
