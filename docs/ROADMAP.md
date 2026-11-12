# Development Roadmap

## Phase 0 — Foundation
- [x] Public repository created
- [x] Scope and data integrity principles documented
- [x] Secret-safe environment template and ignore rules
- [x] Application scaffold and CI checks

## Phase 1 — Core web application
- [x] Responsive app shell and navigation
- [x] Market watchlist and instrument model
- [x] Data-source health and freshness indicators
- [x] Accessible chart workspace

## Phase 2 — Verified market data
- [x] Crypto public REST adapter
- [x] Crypto WebSocket adapter and reconnect handling
- [x] Candle normalization and validation
- [x] Provider attribution and outage behavior
- [ ] OTC provider feasibility review; integrate only if terms and data are verified

## Phase 3 — Deterministic analysis
- [x] Technical indicators with unit tests
- [ ] Multi-timeframe analysis
- [x] Price action and market structure
- [x] Initial gated confluence evaluator and explainable rejection reasons

## Phase 4 — Risk and research
- [x] Risk/reward and position sizing calculator
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
- [x] Android packaging evaluation
- [ ] Desktop packaging evaluation
- [ ] Security, accessibility, and performance audits

## Release gate

No release may claim live OTC support, predictive accuracy, or profitability until the source, test suite, and reproducible evidence have been reviewed.
