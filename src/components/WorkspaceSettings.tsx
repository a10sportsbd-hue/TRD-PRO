import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, UserRound, X, Eye, EyeOff, Save } from "lucide-react";

type Props = { onClose: () => void };
type Provider = "Gemini" | "OpenAI" | "Custom";
const KEY_NAME = "trdpro.provider.config.v1";
const ACCOUNT_NAME = "trdpro.workspace.profile.v1";

export function WorkspaceSettings({ onClose }: Props) {
  const [provider, setProvider] = useState<Provider>("Gemini");
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [account, setAccount] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);

  useEffect(() => {
    try {
      const config = JSON.parse(localStorage.getItem(KEY_NAME) || "{}");
      if (config.provider) setProvider(config.provider);
      if (config.apiKey) setApiKey(config.apiKey);
      if (config.endpoint) setEndpoint(config.endpoint);
      const profile = JSON.parse(localStorage.getItem(ACCOUNT_NAME) || "{}");
      if (profile.name) setAccount(profile.name);
      if (profile.email) setEmail(profile.email);
    } catch { /* ignore invalid local settings */ }
  }, []);

  const saveKey = () => {
    localStorage.setItem(KEY_NAME, JSON.stringify({ provider, apiKey: apiKey.trim(), endpoint: endpoint.trim() }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };
  const saveAccount = () => {
    if (!account.trim()) return;
    localStorage.setItem(ACCOUNT_NAME, JSON.stringify({ name: account.trim(), email: email.trim() }));
    setAccountSaved(true);
    window.setTimeout(() => setAccountSaved(false), 2500);
  };

  return <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="Workspace settings">
    <div className="settings-dialog">
      <div className="settings-title"><div><span className="panel-kicker">TRD PRO WORKSPACE</span><h2>Account & API settings</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
      <section className="settings-section">
        <div className="settings-section-title"><UserRound size={17}/> <strong>Workspace profile</strong></div>
        <p className="settings-help">Create a local profile for this device. Cloud account sync is not configured yet.</p>
        <label>Display name<input value={account} onChange={e=>setAccount(e.target.value)} placeholder="Your name" autoComplete="name"/></label>
        <label>Email (optional)<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email"/></label>
        <button className="settings-save" onClick={saveAccount}><Save size={15}/> {accountSaved ? "Profile saved" : "Save workspace profile"}</button>
      </section>
      <section className="settings-section">
        <div className="settings-section-title"><KeyRound size={17}/> <strong>AI provider API key</strong></div>
        <p className="settings-help">Add your own key to enable provider-backed explanations. A key does not provide access to broker OTC feeds or private charts.</p>
        <label>Provider<select value={provider} onChange={e=>setProvider(e.target.value as Provider)}><option>Gemini</option><option>OpenAI</option><option>Custom</option></select></label>
        {provider === "Custom" && <label>API endpoint<input value={endpoint} onChange={e=>setEndpoint(e.target.value)} placeholder="https://your-provider.example/v1"/></label>}
        <label>API key<div className="key-input"><input type={showKey ? "text" : "password"} value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Paste your API key" autoComplete="off"/><button type="button" onClick={()=>setShowKey(v=>!v)} aria-label="Toggle key visibility">{showKey ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></label>
        <button className="settings-save" onClick={saveKey}><Save size={15}/> {saved ? "API settings saved" : "Save API settings"}</button>
        <div className="settings-warning"><ShieldCheck size={16}/> Key is stored locally in this app's browser storage on this device. Do not use a key with broad account or trading permissions. Secure Android Keystore storage and server-side proxy are not implemented yet.</div>
      </section>
      <div className="settings-footer">No exchange trading permissions are requested. TRD Pro remains analysis-only.</div>
    </div>
  </div>;
}
