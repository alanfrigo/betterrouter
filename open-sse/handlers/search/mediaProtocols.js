import { assertPublicUrl } from "../../../src/shared/utils/ssrfGuard.js";
import { NIMBLE_CLIENT_SOURCE_HEADER, NIMBLE_CLIENT_SOURCE } from "../../config/nimble.js";
import { buildAnysearchSearchRequest, normalizeAnysearchSearchResponse } from "./anysearchSearch.js";
import { buildFirecrawlSearchRequest, normalizeFirecrawlSearchResponse } from "./firecrawlSearch.js";
const resolveSearchBaseUrl = (config, params) => {
  const url = params.providerSpecificData?.baseUrl || config.baseUrl;
  assertPublicUrl(url);
  return url;
};
const isValidContext7LibraryId = (id) => typeof id === "string" && /^\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(id) && !id.includes("..");
function normalizeContext7ResponseWith(makeResult, data, _query, _searchType) {
  const now = new Date().toISOString();
  const items = data?.results;
  if (!Array.isArray(items))
    return { results: [], totalResults: null };
  const usable = items.filter((item) => isValidContext7LibraryId(item?.id ?? ""));
  const results = usable.map((item, idx) => makeResult("context7", {
    title: item?.title,
    url: `https://context7.com${item.id}`,
    snippet: item?.description,
    published_at: item?.lastUpdateDate
  }, idx, now));
  return { results, totalResults: null };
}
function parseDomainFilter(domainFilter) {
  if (!domainFilter?.length)
    return { includes: [], excludes: [] };
  const includes = domainFilter.filter((d) => !d.startsWith("-"));
  const excludes = domainFilter.filter((d) => d.startsWith("-")).map((d) => d.slice(1));
  return { includes, excludes };
}
function buildContext7Request(config, params) {
  const qp = new URLSearchParams({ query: params.query });
  return {
    url: `${config.baseUrl}/search?${qp}`,
    init: {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...params.token ? { Authorization: `Bearer ${params.token}` } : {}
      }
    }
  };
}
function buildNimbleRequest(config, params) {
  if (!params.token)
    throw new Error("Nimble Search requires an API key");
  const { includes, excludes } = parseDomainFilter(params.domainFilter);
  const body = {
    query: params.query,
    max_results: Math.min(params.maxResults, config.maxMaxResults),
    search_depth: "lite",
    output_format: "plain_text",
    focus: params.searchType === "news" ? "news" : "general"
  };
  if (params.country)
    body.country = params.country.toUpperCase();
  if (params.language)
    body.locale = params.language;
  if (params.timeRange && params.timeRange !== "any")
    body.time_range = params.timeRange;
  if (includes.length)
    body.include_domains = includes.slice(0, 50);
  if (excludes.length)
    body.exclude_domains = excludes.slice(0, 50);
  return {
    url: resolveSearchBaseUrl(config, params),
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.token}`,
        [NIMBLE_CLIENT_SOURCE_HEADER]: NIMBLE_CLIENT_SOURCE
      },
      body: JSON.stringify(body)
    }
  };
}
function normalizeNimbleResponseWith(makeResult, data, _query, _searchType) {
  const now = new Date().toISOString();
  const envelope = data ?? {};
  if (!Array.isArray(envelope.results))
    return { results: [], totalResults: null };
  const results = envelope.results.map((item, idx) => makeResult("nimble-search", {
    title: item.title,
    url: item.url,
    snippet: item.description || item.content?.slice(0, 300) || "",
    full_text: item.content || undefined,
    text_format: "text"
  }, idx, now));
  return {
    results,
    totalResults: typeof envelope.total_results === "number" ? envelope.total_results : results.length
  };
}
export const PROTOCOL_BUILDERS = { "nimble-search": buildNimbleRequest, context7: buildContext7Request, "anysearch-search": buildAnysearchSearchRequest, firecrawl: buildFirecrawlSearchRequest };
export function normalizeProtocolSearch(id, data, query, type, makeResult) {
  if (id === "nimble-search")
    return normalizeNimbleResponseWith(makeResult, data, query, type);
  if (id === "context7")
    return normalizeContext7ResponseWith(makeResult, data, query, type);
  return id === "anysearch-search" ? normalizeAnysearchSearchResponse(data, makeResult) : normalizeFirecrawlSearchResponse(data, type, makeResult);
}
