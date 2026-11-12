import { useState } from "react";
import { MarketCandlestickChart } from "./components/MarketCandlestickChart";
import { useBinanceMarketData } from "./market/useBinanceMarketData";
import type { MarketInterval } from "./market/types";
import { calculateIndicators, formatIndicator } from "./market/indicators";
import { useBinanceTicker } from "./market/useBinanceTicker";
import { evaluateStrategy } from "./market/strategyEngine";
import { RiskCalculator } from "./components/RiskCalculator";
import {
  Activity, ArrowUpRight, Bell, BookOpen, ChartCandlestick,
  ChevronDown, Command, Compass, Cpu, Crosshair, LayoutDashboard,
  Menu, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Wallet,
  X
} from "lucide-react";

type MarketTab = "Crypto" | "OTC";
type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1D";

const watchlist = [
  { symbol: "BTC", name: "Bitcoin", pair: "BTC / USDT", market: "SPOT" },
  { symbol: "ETH", name: "Ethereum", pair: "ETH / USDT", market: "SPOT" },
  { symbol: "SOL", name: "Solana", pair: "SOL / USDT", market: "SPOT" },
  { symbol: "BNB", name: "BNB", pair: "BNB / USDT", market: "SPOT" },
  { symbol: "XRP", name: "XRP", pair: "XRP / USDT", market: "SPOT" },
];

function App() {
  const [marketTab, setMarketTab] = useState<MarketTab>("Crypto");
  const [timeframe, setTimeframe] = useState<Timeframe>("15m");
  const [activePair, setActivePair] = useState("BTC");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");

  const selected = watchlist.find((item) => item.symbol === activePair) ?? watchlist[0];
  const interval = (timeframe === "1D" ? "1d" : timeframe) as MarketInterval;
  const marketData = useBinanceMarketData(`${activePair}USDT`, interval, marketTab === "Crypto");
  const latestCandle = marketData.candles[marketData.candles.length - 1];
  const tickerData = useBinanceTicker();
  const selectedTicker = tickerData.items[`${activePair}USDT`];
  const indicators = calculateIndicators(marketData.candles);
  const strategy = evaluateStrategy({
    candles: marketData.candles.filter((candle) => candle.closed),
    feedStatus: marketData.status,
    symbol: `${activePair}USDT`,
    interval,
  });
  const formattedPrice = selectedTicker ? selectedTicker.lastPrice.toLocaleString("en-US", { maximumFractionDigits: 8 }) : latestCandle ? latestCandle.close.toLocaleString("en-US", { maximumFractionDigits: 8 }) : "— — —";
  const feedLabel = marketTab === "OTC" ? "OTC FEED UNSUPPORTED" : marketData.status === "LIVE" ? "BINANCE SPOT · LIVE" : marketData.status.replace("_", " ");

  const navItems = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Markets", icon: Compass },
    { label: "Strategy Lab", icon: Crosshair },
    { label: "AI Analyst", icon: Sparkles },
    { label: "Trade Journal", icon: BookOpen },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><ChartCandlestick size={22} /></div>
          <div><strong>TRD<span> PRO</span></strong><small>TRADING INTELLIGENCE</small></div>
          <button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`} onClick={() => { setActiveNav(label); setMenuOpen(false); }}>
              <Icon size={18} /><span>{label}</span>{label === "AI Analyst" && <span className="new-tag">NEW</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <div className="workspace-label">TOOLS</div>
        <button className="nav-item" onClick={() => setActiveNav("Risk Calculator")}><Wallet size={18} /><span>Risk Calculator</span></button>
        <button className="nav-item" onClick={() => setActiveNav("Data Sources")}><Activity size={18} /><span>Data Sources</span></button>
        <button className="nav-item" onClick={() => setActiveNav("Settings")}><Settings2 size={18} /><span>Settings</span></button>

        <div className="sidebar-bottom">
          <div className="secure-card">
            <div className="secure-icon"><ShieldCheck size={17} /></div>
            <strong>Data integrity first</strong>
            <p>Signals stay disabled until verified market data is connected.</p>
            <span><i /> VALIDATION GATE ACTIVE</span>
          </div>
          <div className="profile-row">
            <div className="avatar">T</div>
            <div className="profile-copy"><strong>TRD Workspace</strong><small>Personal account</small></div>
            <button className="icon-button" aria-label="Workspace options"><ChevronDown size={16} /></button>
          </div>
        </div>
      </aside>

      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
            <div className="breadcrumb">Workspace <span>/</span> <strong>{activeNav}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="system-status"><i /> SYSTEM OPERATIONAL</div>
            <button className="icon-button search-trigger" aria-label="Search"><Search size={18} /></button>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><b /></button>
            <div className="top-avatar">T</div>
          </div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> MARKET INTELLIGENCE TERMINAL</div>
              <h1>Market overview<span>.</span></h1>
              <p className="page-subtitle">Your trading workspace, built around verified data and disciplined analysis.</p>
            </div>
            <button className="date-chip"><Command size={14} /> LIVE WORKSPACE <span className="chip-dot" /></button>
          </section>

          <section className="status-banner">
            <div className="status-symbol"><Activity size={19} /></div>
            <div className="status-message">
              <strong>{marketData.status === "LIVE" ? "Verified Binance Spot market feed connected" : marketTab === "OTC" ? "No verified OTC provider configured" : marketData.status === "ERROR" ? "Unable to load Binance market data" : marketData.status === "STALE" ? "Market feed is stale" : "Connecting to Binance public market data"}</strong>
              <span>{marketData.error ?? "Public Spot prices only. No account API key or trading permission is used."}</span>
            </div>
            <button className="connect-button" onClick={() => setActiveNav("Data Sources")}>Configure data source <ArrowUpRight size={15} /></button>
          </section>

          <section className="metric-grid">
            <div className="metric-card">
              <div className="metric-head"><span>MARKET STATUS</span><Activity size={16} /></div>
              <div className="metric-value status-value"><i /> {marketData.status}</div>
              <div className="metric-foot">{marketData.status === "LIVE" ? "Binance Spot stream validated" : "No validated live stream"}</div>
            </div>
            <div className="metric-card">
              <div className="metric-head"><span>ACTIVE SIGNALS</span><Crosshair size={16} /></div>
              <div className="metric-value">— <small>signals</small></div>
              <div className="metric-foot">No signal without verified data</div>
            </div>
            <div className="metric-card">
              <div className="metric-head"><span>WATCHLIST</span><Compass size={16} /></div>
              <div className="metric-value">{Object.keys(tickerData.items).length} <small>/ {watchlist.length} live</small></div>
              <div className="metric-foot">Binance Spot 24h ticker coverage</div>
            </div>
            <div className="metric-card">
              <div className="metric-head"><span>AI ANALYST</span><Cpu size={16} /></div>
              <div className="metric-value">Standby</div>
              <div className="metric-foot">Waiting for validated observations</div>
            </div>
          </section>

          <section className="content-grid">
            <div className="panel chart-panel">
              <div className="panel-heading chart-heading">
                <div>
                  <div className="panel-kicker">PRICE ACTION</div>
                  <div className="instrument-title"><strong>{selected.symbol}</strong><span>{selected.pair}</span><span className="market-pill">{marketTab === "Crypto" ? "CRYPTO SPOT" : "OTC"}</span></div>
                  <div className="price-placeholder">{marketTab === "Crypto" ? formattedPrice : "— — —"} <span>{marketData.status === "LIVE" ? "USDT · live spot price" : "Live price unavailable"}</span></div>
                </div>
                <div className="chart-controls">
                  <div className="timeframe-control">
                    {(["1m", "5m", "15m", "1h", "4h", "1D"] as Timeframe[]).map((tf) => (
                      <button key={tf} className={timeframe === tf ? "selected" : ""} onClick={() => setTimeframe(tf)}>{tf}</button>
                    ))}
                  </div>
                  <button className="icon-button filter-button" aria-label="Chart settings"><SlidersHorizontal size={17} /></button>
                </div>
              </div>
              <div className="chart-toolbar">
                <div className="market-tabs">
                  <button className={marketTab === "Crypto" ? "active" : ""} onClick={() => setMarketTab("Crypto")}>Crypto</button>
                  <button className={marketTab === "OTC" ? "active" : ""} onClick={() => setMarketTab("OTC")}>OTC</button>
                </div>
                <span className="feed-label"><i /> {marketTab === "Crypto" ? feedLabel : "OTC FEED UNSUPPORTED"}</span>
              </div>
              {marketData.candles.length > 0 && marketTab === "Crypto" ? <MarketCandlestickChart candles={marketData.candles} /> : <div className="chart-empty">
                <div className="empty-chart-icon"><ChartCandlestick size={27} /></div>
                <strong>{marketTab === "OTC" ? "OTC data source not configured" : marketData.status === "ERROR" ? "Market data unavailable" : "Waiting for verified candles"}</strong>
                <p>{marketTab === "OTC" ? "No official broker OTC feed is integrated. OTC chart remains unavailable." : marketData.error ?? `Loading real Binance Spot ${timeframe} candles. No generated chart data is used.`}</p>
                <span className="empty-state-code">DATA STATUS: {marketData.status}</span>
              </div>}
              <div className="indicator-strip">
                <div><span>EMA 20</span><strong>{formatIndicator(indicators.ema20)}</strong></div>
                <div><span>EMA 50</span><strong>{formatIndicator(indicators.ema50)}</strong></div>
                <div><span>RSI 14</span><strong>{formatIndicator(indicators.rsi14, 2)}</strong></div>
                <div><span>MACD</span><strong>{formatIndicator(indicators.macd, 5)}</strong></div>
                <div><span>ATR 14</span><strong>{formatIndicator(indicators.atr14)}</strong></div>
              </div>
              <div className="chart-footer">
                <span>Source: <b>{marketTab === "Crypto" && marketData.candles.length ? "Binance Spot public data" : "Not connected"}</b></span>
                <span>Last update: <b>{marketData.lastUpdated ? new Date(marketData.lastUpdated).toLocaleTimeString() : "—"}</b></span>
                <span>Chart engine: <b>Lightweight Charts</b></span>
              </div>
            </div>

            <div className="panel watchlist-panel">
              <div className="panel-heading">
                <div><div className="panel-kicker">YOUR MARKETS</div><h2>Watchlist</h2></div>
                <button className="icon-button" aria-label="Watchlist options"><SlidersHorizontal size={17} /></button>
              </div>
              <div className="watchlist-labels"><span>INSTRUMENT</span><span>LAST PRICE</span></div>
              <div className="watchlist-items">
                {watchlist.map((item) => (
                  <button key={item.symbol} className={`watch-item ${activePair === item.symbol ? "watch-active" : ""}`} onClick={() => setActivePair(item.symbol)}>
                    <span className={`coin-icon coin-${item.symbol.toLowerCase()}`}>{item.symbol.slice(0, 1)}</span>
                    <span className="coin-copy"><strong>{item.symbol}</strong><small>{item.name}</small></span>
                    <span className="coin-price"><strong>{tickerData.items[`${item.symbol}USDT`]?.lastPrice.toLocaleString("en-US", { maximumFractionDigits: 6 }) ?? "—"}</strong><small>{tickerData.items[`${item.symbol}USDT`] ? `${tickerData.items[`${item.symbol}USDT`].priceChangePercent >= 0 ? "+" : ""}${tickerData.items[`${item.symbol}USDT`].priceChangePercent.toFixed(2)}% · 24H` : "NO DATA"}</small></span>
                  </button>
                ))}
              </div>
              <div className="watchlist-note"><ShieldCheck size={14} /> {tickerData.status === "LIVE" ? "Live Binance Spot 24h ticker · verified source" : `Ticker feed: ${tickerData.status}`}</div>
            </div>
          </section>

          <section className="bottom-grid">
            <div className="panel signal-panel">
              <div className="panel-heading">
                <div><div className="panel-kicker">RESEARCH ENGINE</div><h2>Strategy analysis</h2></div>
                <span className="disabled-pill"><i /> {strategy.status === "BLOCKED" ? "VALIDATION BLOCKED" : "RESEARCH ONLY"}</span>
              </div>
              <div className="signal-empty">
                <div className="signal-lock"><ShieldCheck size={20} /></div>
                <div>
                  <strong>{strategy.status === "BLOCKED" ? "No validated analysis" : strategy.direction === "WAIT" ? "No directional setup" : `${strategy.direction} research candidate · not a trade signal`}</strong>
                  <p>{strategy.reason}</p>
                </div>
              </div>
              <div className="strategy-meta">
                <span>Confluence <b>{strategy.confluenceScore}/{strategy.confluenceMaximum}</b></span>
                <span>Closed candles <b>{strategy.candleCount}</b></span>
                <span>Source <b>{marketTab === "Crypto" ? "Binance Spot" : "Unsupported OTC"}</b></span>
              </div>
              <div className="strategy-reasons">
                {strategy.reasons.slice(0, 3).map((reason) => <div key={reason}>• {reason}</div>)}
              </div>
              <div className="strategy-disclaimer">Research candidate only. No entry, SL, TP or execution instruction. Confluence is not win probability.</div>
            </div>
            <div className="panel assistant-panel">
              <div className="panel-heading">
                <div><div className="panel-kicker">INTELLIGENCE</div><h2>AI market analyst</h2></div>
                <Sparkles size={18} className="accent-icon" />
              </div>
              <div className="assistant-empty">
                <div className="ai-orb"><Sparkles size={19} /></div>
                <div><strong>Ready when data arrives</strong><p>AI explanations will be grounded in validated market observations—not guesses.</p></div>
              </div>
              <button className="text-action" onClick={() => setActiveNav("AI Analyst")}>Explore AI analyst <ArrowUpRight size={14} /></button>
            </div>
          </section>

          <section className="panel risk-panel"><RiskCalculator /></section>

          <footer className="app-footer">
            <span>TRD PRO <b>v0.1.0</b></span>
            <span><ShieldCheck size={13} /> DATA INTEGRITY GATES ENABLED</span>
            <span>Analysis only · Not financial advice</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
