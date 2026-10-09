"use client";
import { useState } from "react";
import { Modal, Button, Input, OAuthModal } from "@/shared/components";

export default function SpecialProtocolAuthModal({ isOpen, provider, providerInfo, onSuccess, onClose }) {
  const [meta, setMeta] = useState({ baseUrl: "https://gitlab.com", gheUrl: "", clientId: "", clientSecret: "" });
  const [accessToken, setAccessToken] = useState("");
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const imported = ["devin-desktop", "devin-cli"].includes(provider);
  const close = () => { setStarted(false); setAccessToken(""); setMeta({ baseUrl: "https://gitlab.com", gheUrl: "", clientId: "", clientSecret: "" }); setError(""); onClose(); };
  const connect = async () => {
    setError("");
    if (!imported) {
      const value = provider === "ghe-copilot" ? meta.gheUrl : meta.baseUrl;
      try { const url = new URL(value); if (url.protocol !== "https:" || url.username || url.password) throw new Error(); } catch { setError("Valid HTTPS provider URL required"); return; }
      if (provider === "gitlab-duo" && !meta.clientId.trim()) { setError("GitLab OAuth application Client ID required"); return; }
      setStarted(true); return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/oauth/${provider}/import`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Token import failed");
      onSuccess?.(); close();
    } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  };
  if (!isOpen) return null;
  if (started) return <OAuthModal isOpen provider={provider} providerInfo={providerInfo} oauthMeta={provider === "ghe-copilot" ? { gheUrl: meta.gheUrl, clientId: meta.clientId } : meta} onSuccess={() => { onSuccess?.(); close(); }} onClose={close} />;
  const field = (name, label, type = "text") => <Input key={name} label={label} type={type} value={meta[name]} onChange={event => setMeta(previous => ({ ...previous, [name]: event.target.value }))} />;
  return <Modal isOpen title={`Connect ${providerInfo.name}`} onClose={close}>
    <div className="flex flex-col gap-4">
      {imported ? <><p className="text-sm text-text-muted">Import access token from authenticated Devin IDE or CLI. Credentials stay server-side. CLI subprocess still requires local authentication.</p><Input label="Access token" type="password" value={accessToken} onChange={event => setAccessToken(event.target.value)} /></> : provider === "ghe-copilot" ? <>{field("gheUrl", "GitHub Enterprise HTTPS URL")}{field("clientId", "OAuth Client ID (optional)")}</> : <><p className="text-sm text-text-muted">Register GitLab OAuth app with ai_features and read_user scopes; use dashboard callback URL. Public PKCE apps need no client secret.</p>{field("baseUrl", "GitLab HTTPS URL")}{field("clientId", "OAuth Client ID")}{field("clientSecret", "OAuth Client Secret (optional)", "password")}</>}
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <Button onClick={connect} disabled={busy || (imported && accessToken.trim().length < 16)} loading={busy}>Connect</Button>
    </div>
  </Modal>;
}
