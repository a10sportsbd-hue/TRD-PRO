import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Play, RefreshCw, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { evaluateStrategy, type StrategyAnalysis } from "../market/strategyEngine";
import type { Candle, MarketInterval } from "../market/types";

type ScanRow = { symbol: string; analysis?: StrategyAnalysis; lastClose?: number; error?: string };
const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"];
const INTERVALS: MarketInterval[] = ["1m", "5m", "15m", "1h", "4h", "1d"];

async function scanSymbol(symbol: string, interval: MarketInterval): Promise<ScanRow> {
  const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=300`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Binance HTTP ${response.status}`);
  const rows: unknown[] = await response.json();
  if (!Array.isArray(rows) || rows.length < 100) throw new Error("Insufficient live candle history");
  const now = Date.now();
  const candles: Candle[] = rows.map((raw) => {
    const k = raw as (string | number)[];
    const closeTime = Number(k[6]);
    return {
      time: Number(k[0]),
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
      volume: Number(k[5]),
      source: "BINANCE_SPOT" as const,
      receivedAt: now,
      closed: closeTime < now,
    };
  }).filter(c => c.closed);
  const analysis = evaluateStrategy({ candles, feedStatus: "LIVE", symbol, interval, now });
  return { symbol, analysis, lastClose: candles[candles.length - 1]?.close };
}

function money(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export function LiveMarketScanner() {
  const [interval, setInterval] = useState<MarketInterval>("5m");
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [lastScan, setLastScan] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [continuous, setContinuous] = useState(false);
  const runScan = async () => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const results = await Promise.all(SYMBOLS.map(async symbol => {
        try { return await scanSymbol(symbol, interval); }
        catch (e) { return { symbol, error: e instanceof Error ? e.message : "Market data request failed" }; }
      }));
      setRows(results); setLastScan(Date.now());
      if (results.every(r => r.error)) setError("No Binance market data could be verified. Check your connection and retry.");
    } finally { setBusy(false); }
  };
  useEffect(() => { if (!continuous) return; const timer = window.setInterval(() => { void runScan(); }, 30000); return () => window.clearInterval(timer); }, [continuous, interval]);
  const signals = rows.filter(r => r.analysis && (r.analysis.direction === "BUY" || r.analysis.direction === "SELL"));
  return <section className="panel live-scanner">
    <div className="scanner-head">
      <div><div className="panel-kicker">REAL-TIME MARKET ENGINE</div><h2>Live market scanner</h2><p>Scans verified Binance Spot candles. OTC feeds are not fabricated or substituted.</p></div>
      <span className={busy || continuous ? "scanner-state scanning" : "scanner-state"}><i/>{busy ? "SCANNING" : continuous ? "AUTO SCAN ON" : lastScan ? "SCAN COMPLETE" : "READY"}</span>
    </div>
    <div className="scanner-controls">
      <label>Timeframe<select value={interval} onChange={e=>setInterval(e.target.value as MarketInterval)} disabled={busy}>{INTERVALS.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
      <button className="scanner-run" onClick={runScan} disabled={busy}>{busy ? <RefreshCw className="spin" size={16}/> : <Play size={16}/>} {busy ? "Scanning live markets..." : rows.length ? "Scan now" : "Start live scan"}</button><button className="scanner-auto" onClick={()=>setContinuous(v=>!v)} disabled={busy}>{continuous ? "Pause auto scan" : "Auto scan · 30s"}</button>
      <span className="scanner-count">{signals.length} directional candidates / {rows.length} markets</span>
    </div>
    {error && <div className="scanner-error"><AlertTriangle size={15}/>{error}</div>}
    {!rows.length && !busy && <div className="scanner-empty"><Activity size={24}/><strong>Scanner is ready</strong><span>Tap Start live scan to fetch fresh closed candles and calculate technical confluence.</span></div>}
    {busy && <div className="scanner-progress">Requesting live OHLCV data from Binance Spot for five markets. No sample candles are used.</div>}
    {!!rows.length && <div className="scanner-table-wrap"><table className="scanner-table"><thead><tr><th>MARKET</th><th>LAST CLOSE</th><th>BIAS</th><th>CONFLUENCE</th><th>RSI</th><th>STATUS</th></tr></thead><tbody>
      {rows.map(row=>{const a=row.analysis;const d=a?.direction;return <tr key={row.symbol}><td><strong>{row.symbol.replace("USDT","")}</strong><small>USDT · Binance Spot</small></td><td>{row.lastClose != null ? money(row.lastClose) : "—"}</td><td><span className={d==="BUY"?"bias-buy":d==="SELL"?"bias-sell":"bias-wait"}>{d==="BUY"?<TrendingUp size={13}/>:d==="SELL"?<TrendingDown size={13}/>:null}{d ?? "NO DATA"}</span></td><td>{a ? `${a.confluenceScore}/5` : "—"}</td><td>{a?.indicators.rsi14?.toFixed(1) ?? "—"}</td><td>{row.error ? <span className="scan-fail">{row.error}</span> : <span className="scan-ok"><ShieldCheck size={12}/>{a?.status}</span>}</td></tr>})}
    </tbody></table></div>}
    {!!rows.length && <div className="scanner-notes">{rows.map(r=><div key={r.symbol}><strong>{r.symbol}</strong>: {r.error ?? r.analysis?.reason}</div>)}</div>}
    <div className="scanner-foot"><span>Source: Binance public Spot REST API</span><span>Last scan: {lastScan ? new Date(lastScan).toLocaleTimeString() : "Not run"}</span><span>Rule count is not win probability. Analysis only.</span></div>
  </section>;
}
