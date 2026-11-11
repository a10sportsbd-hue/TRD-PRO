import { useState } from "react";
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
              <strong>Market data is not connected yet</strong>
              <span>Connect a trusted provider to load live prices, candles, indicators and analysis.</span>
            </div>
            <button className="connect-button" onClick={() => setActiveNav("Data Sources")}>Configure data source <ArrowUpRight size={15} /></button>
          </section>

          <section className="metric-grid">
            <div className="metric-card">
              <div className="metric-head"><span>MARKET STATUS</span><Activity size={16} /></div>
              <div className="metric-value status-value"><i /> Awaiting feed</div>
              <div className="metric-foot">No validated market stream</div>
            </div>
            <div className="metric-card">
              <div className="metric-head"><span>ACTIVE SIGNALS</span><Crosshair size={16} /></div>
              <div className="metric-value">— <small>signals</small></div>
              <div className="metric-foot">No signal without verified data</div>
            </div>
            <div className="metric-card">
              <div className="metric-head"><span>WATCHLIST</span><Compass size={16} /></div>
              <div className="metric-value">{watchlist.length} <small>instruments</small></div>
              <div className="metric-foot">Symbols configured · prices unavailable</div>
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
                  <div className="price-placeholder">— — — <span>Live price unavailable</span></div>
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
                <span className="feed-label"><i /> NO VERIFIED FEED</span>
              </div>
              <div className="chart-empty">
                <div className="empty-chart-icon"><ChartCandlestick size={27} /></div>
                <strong>No candle data available</strong>
                <p>Connect a verified {marketTab === "Crypto" ? "crypto exchange" : "OTC data provider"} to display the {timeframe} chart.</p>
                <span className="empty-state-code">DATA STATUS: NO_DATA</span>
              </div>
              <div className="chart-footer">
                <span>Source: <b>Not connected</b></span>
                <span>Last update: <b>—</b></span>
                <span>Chart engine: <b>Ready</b></span>
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
                    <span className="coin-price"><strong>—</strong><small>NO DATA</small></span>
                  </button>
                ))}
              </div>
              <div className="watchlist-note"><ShieldCheck size={14} /> Prices appear only after source validation.</div>
            </div>
          </section>

          <section className="bottom-grid">
            <div className="panel signal-panel">
              <div className="panel-heading">
                <div><div className="panel-kicker">DECISION SUPPORT</div><h2>Signal center</h2></div>
                <span className="disabled-pill"><i /> SIGNALS DISABLED</span>
              </div>
              <div className="signal-empty">
                <div className="signal-lock"><ShieldCheck size={20} /></div>
                <div><strong>No actionable signals</strong><p>Signal evaluation unlocks only when fresh, complete and validated candles are available.</p></div>
              </div>
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
