# Technical Indicator Engine

The indicator module calculates deterministic values from normalized candle close/high/low data.

## Implemented
- EMA 20 and EMA 50
- RSI 14 using Wilder smoothing
- MACD 12/26/9
- Bollinger Bands 20, 2 standard deviations (population deviation)
- ATR 14 using Wilder smoothing

## Warm-up behavior
A value is `null` until enough input candles are present. The UI must show `INSUFFICIENT DATA` rather than display a fabricated or partial indicator value.

## Important interpretation notes
- Indicators are descriptive transformations of historical observations, not predictions.
- RSI can remain at 100 when there are gains and no losses; it returns 50 for a flat series.
- Bollinger Bands use the latest 20 closes and population standard deviation.
- ATR uses true range and Wilder smoothing.
- MACD uses EMA(12), EMA(26), and EMA(9) signal smoothing.

## Validation
Indicator input must be the output of a validated market-data adapter. Do not call these functions with generated production candles. Unit tests and backtests may use isolated fixtures that are clearly marked as test-only.
