import { useState } from "react";
import { KeyRound, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";

type Props = { onBack: () => void };

export function SettingsPage({ onBack }: Props) {
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState(() => {
    try { return sessionStorage.getItem("trdpro.ai.apiKey") ?? ""; } catch { return ""; }
  });
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("");
  const [checking, setChecking] = useState(false);

  const saveKey = () => {
    try {
      sessionStorage.setItem("trdpro.ai.provider", provider);
      sessionStorage.setItem("trdpro.ai.apiKey", apiKey.trim());
      setStatus("Key saved for this app session on this device. It is not sent to TRD Pro servers.");
    } catch {
      setStatus("Unable to save key in this browser session.");
    }
  };

  const verifyKey = async () => {
    if (!apiKey.trim()) { setStatus("Enter an API key first."); return; }
    if (provider !== "gemini") { setStatus("This provider is not connected yet. Gemini verification is currently supported."); return; }
    setChecking(true); setStatus("");
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`);
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "Key rejected by Google. Check the key and API access." : `Provider returned HTTP ${response.status}.`);
      const data = await response.json();
      if (!Array.isArray(data.models) || data.models.length === 0) throw new Error("Key responded, but no usable models were returned.");
      sessionStorage.setItem("trdpro.ai.provider", provider);
      sessionStorage.setItem("trdpro.ai.apiKey", apiKey.trim());
      setStatus(`Verified with Google Gemini. ${data.models.length} models listed. Key kept in this session only.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "API verification failed.");
    } finally { setChecking(false); }
  };

  return <section className="panel settings-page">
    <div className="panel-kicker">WORKSPACE CONFIGURATION</div>
    <h2>API & security settings</h2>
    <p className="risk-intro">Connect an AI provider for explanations based on verified market observations. Binance Spot public prices do not require an API key.</p>
    <div className="settings-section">
      <div className="settings-title"><KeyRound size={17}/> AI provider API key</div>
      <label className="settings-label">Provider
        <select value={provider} onChange={e => { setProvider(e.target.value); setStatus(""); }}>
          <option value="gemini">Google Gemini</option>
          <option value="openai">OpenAI (not connected yet)</option>
          <option value="custom">Custom provider (not connected yet)</option>
        </select>
      </label>
      <label className="settings-label">API key
        <div className="api-key-field"><input type={visible ? "text" : "password"} autoComplete="off" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Paste your provider API key"/><button type="button" onClick={() => setVisible(v => !v)} aria-label="Toggle key visibility">{visible ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div>
      </label>
      <div className="settings-actions"><button className="risk-calculate" onClick={saveKey}>Save for this session</button><button className="risk-calculate" onClick={verifyKey} disabled={checking}>{checking ? "Checking…" : "Verify API key"}</button></div>
      {status && <div className="settings-status"><CheckCircle2 size={15}/>{status}</div>}
      <div className="settings-warning"><ShieldCheck size={16}/> API key stays in session storage and is cleared when the app session ends. Do not use exchange trading keys or enable withdrawal/trading permissions. AI key verification does not connect a broker or unlock OTC market data.</div>
    </div>
    <div className="settings-section">
      <div className="settings-title"><AlertTriangle size={17}/> Data source status</div>
      <p className="risk-intro">Binance Spot public market feed is supported. Quotex OTC has no verified official public feed configured; TRD Pro will not invent OTC prices or signals.</p>
    </div>
    <button className="text-action" onClick={onBack}>← Back to overview</button>
  </section>;
}
