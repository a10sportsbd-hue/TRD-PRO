# TRD Pro

**Trade Smarter. Analyze Deeper.**

TRD Pro is a multi-platform trading analysis and decision-support platform for cryptocurrency markets and carefully validated OTC data integrations. It is planned to combine market-data ingestion, technical analysis, strategy confluence, risk analytics, explainable AI assistance, backtesting, and trade journaling.

> **Project status:** Foundation stage. No live signal engine is claimed to be operational.

## Non-negotiable data integrity

- Never fabricate, interpolate, or relabel sample data as live market data.
- Every observation must retain source, instrument, market type, timeframe, event time, receive time, and validation status.
- Reject stale, malformed, incomplete, or out-of-order data.
- If a trusted feed is unavailable, show **NO DATA** or **NO SIGNAL**.
- OTC feeds must be explicitly identified and never represented as official broker prices without authorization and verification.
- Strategy scores are not win probabilities. Performance claims require reproducible out-of-sample testing.

## Planned capabilities

- Crypto market data through documented exchange APIs and WebSocket feeds.
- OTC provider adapters only where access, terms, provenance, and data quality can be verified.
- Candlestick and multi-timeframe analysis.
- Technical indicators, price action, market structure, and configurable strategy confluence.
- Risk/reward tools, backtesting, and trade journaling.
- AI-assisted chart explanation using user-configured providers or local models.
- Responsive web/PWA foundation, with Android and desktop delivery planned.

## Architecture and policies

- [Architecture](docs/ARCHITECTURE.md)
- [Data Integrity](docs/DATA-INTEGRITY.md)
- [Roadmap](docs/ROADMAP.md)
- [Security Policy](SECURITY.md)

## Security

Never commit API keys, tokens, passwords, private account data, or production secrets. Use environment variables and deployment secret stores. Market-data credentials should be read-only where possible.

## Development status

This repository currently contains project documentation and secure configuration templates. Application code, integrations, and signal calculations will be added incrementally with tests and source-backed data adapters.

## Disclaimer

TRD Pro is analytical software, not financial advice. Trading involves substantial risk, including loss of capital. Signals and indicators can be wrong. Users are responsible for independent verification and decisions.
