const sources = new Map;
export function registerDynamicImageModelSource(providerId, source) {
  sources.set(providerId, source);
}
export function getDynamicImageModels(providerId) {
  const source = sources.get(providerId);
  if (!source)
    return [];
  return source();
}
export function resetDynamicImageModelSources() {
  sources.clear();
}
