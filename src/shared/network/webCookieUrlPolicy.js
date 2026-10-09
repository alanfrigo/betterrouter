// Remote user-supplied attachments are public Internet resources, never LAN or metadata URLs.
export function getProviderOutboundGuard() {
  return "public-only";
}
