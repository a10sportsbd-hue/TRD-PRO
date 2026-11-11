# Strategy Engine — Phase 4

## Scope

The first deterministic research engine evaluates Binance Spot candles only. It does not submit orders and does not generate entry, stop-loss, or take-profit prices.

## Implemented market-structure observations

- Confirmed swing highs and lows using a 3-candle left/right pivot.
- Clustered support and resistance levels using a volatility-aware tolerance.
- Close-confirmed BOS (break of structure).
- Basic CHoCH (change of character) classification from the prior swing sequence.
- Three-candle fair value gap observation.
- Wick-through / close-back liquidity sweep observation.

These are heuristic observations, not institutional order-flow facts. A three-candle FVG is a price-gap pattern and is not proof of unfilled institutional orders.

## Confluence rules

The evaluator counts up to five directional observations:
- EMA20 versus EMA50
- RSI14 directional band (extreme readings are not counted)
- MACD histogram sign
- BOS or CHoCH direction
- Liquidity sweep direction

A candidate requires at least four bullish or bearish observations and must exceed the opposite direction. Otherwise it returns WAIT. The confluence count is not a probability, confidence percentage, or expected win rate.

## Hard gates

The evaluator returns NO_SIGNAL / BLOCKED unless:
- Feed status is LIVE.
- At least 100 candles are present.
- Every candle is closed and identified as BINANCE_SPOT.
- OHLCV values and OHLC relationships are valid.
- Timestamps are strictly increasing.
- The latest candle is fresh for the selected timeframe.
- Indicator warm-up is complete.

## Explicit limitations

- This is an initial research heuristic, not a validated trading strategy.
- BUY / SELL are directional candidates only, not execution instructions.
- Entry, stop loss, take profit, risk/reward, fees, slippage, and funding are not implemented.
- No backtest or profitability claim is made.
- OTC and broker-specific feeds are unsupported.
- Do not use this module as financial advice.
