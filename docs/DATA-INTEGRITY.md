# Market Data Integrity Rules

## Required observation metadata

Every candle/quote must carry:
- Provider/source identifier and adapter version.
- Canonical symbol and original provider instrument identifier.
- Market category: SPOT, FUTURES, or OTC (never inferred).
- Timeframe and interval boundaries.
- Provider event timestamp and local receive timestamp in UTC.
- OHLCV values where applicable, plus source precision.
- Validation status and rejection reason where applicable.

## Validation gates

- Reject non-finite values, invalid OHLC relationships, negative volume, and malformed timestamps.
- Detect duplicate and out-of-order events.
- Enforce source-specific freshness thresholds.
- Detect gaps and mark incomplete candle windows.
- Do not combine observations from different providers without explicit reconciliation.
- Do not treat a crypto exchange candle as a broker OTC candle.
- Do not claim a feed is official without verifiable authorization and documentation.

## Failure behavior

- No valid feed: display NO DATA.
- Data too old: display STALE DATA and suppress actionable signals.
- Insufficient history: display INSUFFICIENT DATA.
- Conflicting sources: display SOURCE CONFLICT and suppress signals.
- Unsupported OTC instrument: display UNSUPPORTED INSTRUMENT.

No demo fixtures or synthetic candles may enter production adapters or signal paths. Tests may use clearly labelled fixtures isolated from production configuration.

## Signal provenance

Each signal must reference exact input observation IDs, source, analysis version, strategy configuration version, creation time, expiry time, and deterministic reason codes.
