import { calculateIndicators } from "./indicators";
import { analyzeMarketStructure } from "./structure";
import type { Candle, FeedStatus, MarketInterval } from "./types";

export type Direction = "BUY" | "SELL" | "WAIT" | "NO_SIGNAL";

export interface StrategyAnalysis {
  direction: Direction;
  status: "BLOCKED" | "ANALYZED" | "CANDIDATE";
  reason: string;
  reasons: string[];
  confluenceScore: number;
  confluenceMaximum: number;
  scoreIsProbability: false;
  source: "BINANCE_SPOT";
  symbol: string;
  interval: MarketInterval;
  analyzedAt: number;
  candleCount: number;
  indicators: ReturnType<typeof calculateIndicators>;
  structure: ReturnType<typeof analyzeMarketStructure>;
  entry: null;
  stopLoss: null;
  takeProfit: null;
}

export interface StrategyInput {
  candles: Candle[];
  feedStatus: FeedStatus;
  symbol: string;
  interval: MarketInterval;
  now?: number;
}

const MIN_CANDLES = 100;
const MAX_LAST_CANDLE_AGE_MS: Record<MarketInterval, number> = {
  "1m": 120_000,
  "5m": 600_000,
  "15m": 1_800_000,
  "1h": 7_200_000,
  "4h": 28_800_000,
  "1d": 172_800_000,
};

function emptyAnalysis(input: StrategyInput, reason: string, now: number): StrategyAnalysis {
  const indicators = calculateIndicators([]);
  const structure = analyzeMarketStructure([], null);
  return {
    direction: "NO_SIGNAL",
    status: "BLOCKED",
    reason,
    reasons: [reason],
    confluenceScore: 0,
    confluenceMaximum: 5,
    scoreIsProbability: false,
    source: "BINANCE_SPOT",
    symbol: input.symbol,
    interval: input.interval,
    analyzedAt: now,
    candleCount: input.candles.length,
    indicators,
    structure,
    entry: null,
    stopLoss: null,
    takeProfit: null,
  };
}

export function evaluateStrategy(input: StrategyInput): StrategyAnalysis {
  const now = input.now ?? Date.now();
  if (input.feedStatus !== "LIVE") return emptyAnalysis(input, `Feed status is ${input.feedStatus}; live validated data required.`, now);
  if (input.candles.length < MIN_CANDLES) return emptyAnalysis(input, `Insufficient history: need at least ${MIN_CANDLES} candles.`, now);

  const candles = input.candles;
  for (let index = 0; index < candles.length; index += 1) {
    const candle = candles[index];
    if (candle.source !== "BINANCE_SPOT" || !candle.closed) return emptyAnalysis(input, "Only closed Binance Spot candles are eligible for this strategy.", now);
    if (![candle.open, candle.high, candle.low, candle.close, candle.volume].every(Number.isFinite)) return emptyAnalysis(input, "Invalid OHLCV values detected.", now);
    if (candle.open <= 0 || candle.high <= 0 || candle.low <= 0 || candle.close <= 0 || candle.volume < 0) return emptyAnalysis(input, "Invalid OHLCV range detected.", now);
    if (candle.high < Math.max(candle.open, candle.close, candle.low) || candle.low > Math.min(candle.open, candle.close, candle.high)) return emptyAnalysis(input, "OHLC relationship validation failed.", now);
    if (index > 0 && candle.time <= candles[index - 1].time) return emptyAnalysis(input, "Duplicate or out-of-order candle timestamps detected.", now);
  }

  const last = candles[candles.length - 1];
  if (now - last.time > MAX_LAST_CANDLE_AGE_MS[input.interval]) return emptyAnalysis(input, "Latest candle is stale for the selected timeframe.", now);
  const indicators = calculateIndicators(candles);
  const structure = analyzeMarketStructure(candles, indicators.atr14);
  if (indicators.ema20 === null || indicators.ema50 === null || indicators.rsi14 === null || indicators.macdHistogram === null || indicators.atr14 === null) {
    return emptyAnalysis(input, "Indicator warm-up is incomplete.", now);
  }

  const reasons: string[] = [];
  let bullish = 0;
  let bearish = 0;
  if (indicators.ema20 > indicators.ema50) { bullish += 1; reasons.push("EMA20 is above EMA50."); }
  else if (indicators.ema20 < indicators.ema50) { bearish += 1; reasons.push("EMA20 is below EMA50."); }
  if (indicators.rsi14 >= 52 && indicators.rsi14 <= 68) { bullish += 1; reasons.push("RSI momentum is bullish without an extreme reading."); }
  else if (indicators.rsi14 <= 48 && indicators.rsi14 >= 32) { bearish += 1; reasons.push("RSI momentum is bearish without an extreme reading."); }
  if (indicators.macdHistogram > 0) { bullish += 1; reasons.push("MACD histogram is positive."); }
  else if (indicators.macdHistogram < 0) { bearish += 1; reasons.push("MACD histogram is negative."); }
  if (structure.bos === "BULLISH" || structure.choch === "BULLISH") { bullish += 1; reasons.push("Bullish market-structure break detected."); }
  if (structure.bos === "BEARISH" || structure.choch === "BEARISH") { bearish += 1; reasons.push("Bearish market-structure break detected."); }
  if (structure.liquiditySweep?.direction === "BULLISH") { bullish += 1; reasons.push("Bullish liquidity sweep detected."); }
  if (structure.liquiditySweep?.direction === "BEARISH") { bearish += 1; reasons.push("Bearish liquidity sweep detected."); }

  const confluenceScore = Math.max(bullish, bearish);
  const direction: Direction = bullish >= 4 && bullish > bearish ? "BUY" : bearish >= 4 && bearish > bullish ? "SELL" : "WAIT";
  const status = direction === "WAIT" ? "ANALYZED" : "CANDIDATE";
  if (direction === "WAIT") reasons.push("Confluence threshold not met; no directional candidate.");
  reasons.push("Confluence is a rule count, not a probability or win-rate estimate.");

  return {
    direction,
    status,
    reason: direction === "WAIT" ? "No directional setup passed the configured confluence threshold." : "Directional candidate only; execution levels and independent validation are not yet implemented.",
    reasons,
    confluenceScore,
    confluenceMaximum: 5,
    scoreIsProbability: false,
    source: "BINANCE_SPOT",
    symbol: input.symbol,
    interval: input.interval,
    analyzedAt: now,
    candleCount: candles.length,
    indicators,
    structure,
    entry: null,
    stopLoss: null,
    takeProfit: null,
  };
}
