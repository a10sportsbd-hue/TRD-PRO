# TRD Pro — Architecture

## Design principles

1. Source-backed data only; no synthetic market feed in production paths.
2. Provider adapters isolate exchange/provider-specific formats.
3. Deterministic calculations are separate from AI explanations.
4. Every signal is explainable, timestamped, expiring, and traceable to source observations.
5. Fail closed: missing, stale, or invalid data produces NO DATA / NO SIGNAL.
6. Initial product is analysis-only; no broker order execution.

## Logical components

- **Clients:** responsive web application/PWA; Android and desktop packaging later.
- **API gateway:** authentication, validation, rate limiting, request routing.
- **Market data adapters:** crypto REST/WebSocket sources and separately validated OTC providers.
- **Normalization layer:** canonical instruments, OHLCV candles, timestamps, precision, and provenance.
- **Analysis engine:** indicators, price action, multi-timeframe context, market structure, configurable strategies.
- **Signal evaluator:** hard validation gates, confluence rules, expiry, and reason codes.
- **AI assistant:** optional provider router for explanations and chart interpretation; AI cannot invent missing observations.
- **Persistence:** users, preferences, watchlists, source metadata, analyses, signals, journals, and audit events.
- **Research:** reproducible backtests, walk-forward validation, and performance reports.

## Proposed stack

- TypeScript + React + Vite for the web client.
- Tailwind CSS and a charting library for visualization.
- Cloudflare Workers for API services; D1 for relational persistence; R2 for files; KV for suitable cache/config use.
- Replaceable provider adapters and automated tests.

Exact services and quotas must be confirmed before deployment. Free tiers have limits and are not guaranteed to cover production traffic.

## Data flow

1. Adapter obtains observations from a documented source.
2. Ingestion validates schema, instrument identity, timestamps, ordering, and source health.
3. Normalizer stores canonical observations with immutable provenance.
4. Analysis computes deterministic features from validated candles.
5. Signal evaluator applies strategy rules and risk/data-quality gates.
6. AI may explain the computed result but cannot override hard gates.
7. UI displays source, freshness, timeframe, reasons, and status.

## Signal lifecycle

OBSERVED → VALIDATED → ANALYZED → ELIGIBLE or REJECTED → EXPIRED

Rejected or expired signals must never be presented as actionable. Provider outage must not trigger fabricated fallback data.
