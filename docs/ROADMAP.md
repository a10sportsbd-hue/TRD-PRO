# Development Roadmap

## Phase 0 — Foundation
- [x] Public repository created
- [x] Scope and data integrity principles documented
- [x] Secret-safe environment template and ignore rules
- [ ] Application scaffold and CI checks

## Phase 1 — Core web application
- [ ] Responsive app shell and navigation
- [ ] Market watchlist and instrument model
- [ ] Data-source health and freshness indicators
- [ ] Accessible chart workspace

## Phase 2 — Verified market data
- [ ] Crypto public REST adapter
- [ ] Crypto WebSocket adapter and reconnect handling
- [ ] Candle normalization and validation
- [ ] Provider attribution and outage behavior
- [ ] OTC provider feasibility review; integrate only if terms and data are verified

## Phase 3 — Deterministic analysis
- [ ] Technical indicators with unit tests
- [ ] Multi-timeframe analysis
- [ ] Price action and market structure
- [ ] Configurable confluence and explainable rejection reasons

## Phase 4 — Risk and research
- [ ] Risk/reward and position sizing calculator
- [ ] Backtesting with fees/slippage assumptions
- [ ] Out-of-sample and walk-forward evaluation
- [ ] Trade journal and performance analytics

## Phase 5 — AI assistant
- [ ] Provider abstraction and user-managed API keys
- [ ] Free-tier-aware model routing and quota handling
- [ ] Chart explanation grounded in supplied observations
- [ ] AI output validation; AI cannot fabricate data or bypass signal gates

## Phase 6 — Multi-platform and release
- [ ] PWA installation support
- [ ] Android packaging evaluation
- [ ] Desktop packaging evaluation
- [ ] Security, accessibility, and performance audits

## Release gate

No release may claim live OTC support, predictive accuracy, or profitability until the source, test suite, and reproducible evidence have been reviewed.
