import type { Candle } from "./types";

export interface IndicatorSnapshot {
  ema20: number | null;
  ema50: number | null;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  bollingerUpper: number | null;
  bollingerMiddle: number | null;
  bollingerLower: number | null;
  atr14: number | null;
  sampleSize: number;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ema(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const multiplier = 2 / (period + 1);
  let result = mean(values.slice(0, period));
  for (let index = period; index < values.length; index += 1) {
    result = (values[index] - result) * multiplier + result;
  }
  return result;
}

function rsi(values: number[], period = 14): number | null {
  if (values.length <= period) return null;
  let gains = 0;
  let losses = 0;
  for (let index = 1; index <= period; index += 1) {
    const change = values[index] - values[index - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  let averageGain = gains / period;
  let averageLoss = losses / period;
  for (let index = period + 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    averageGain = (averageGain * (period - 1) + Math.max(change, 0)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(-change, 0)) / period;
  }
  if (averageLoss === 0) return averageGain === 0 ? 50 : 100;
  const relativeStrength = averageGain / averageLoss;
  return 100 - 100 / (1 + relativeStrength);
}

function atr(candles: Candle[], period = 14): number | null {
  if (candles.length <= period) return null;
  const ranges = candles.slice(1).map((candle, index) => {
    const previousClose = candles[index].close;
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previousClose),
      Math.abs(candle.low - previousClose),
    );
  });
  let value = mean(ranges.slice(0, period));
  for (let index = period; index < ranges.length; index += 1) {
    value = (value * (period - 1) + ranges[index]) / period;
  }
  return value;
}

function macd(values: number[]) {
  if (values.length < 35) return { line: null, signal: null, histogram: null };
  const fast = 12;
  const slow = 26;
  const multiplierFast = 2 / (fast + 1);
  const multiplierSlow = 2 / (slow + 1);
  let fastEma = mean(values.slice(0, fast));
  let slowEma = mean(values.slice(0, slow));
  const lineValues: number[] = [];
  for (let index = fast; index < slow; index += 1) {
    fastEma = (values[index] - fastEma) * multiplierFast + fastEma;
  }
  for (let index = slow; index < values.length; index += 1) {
    fastEma = (values[index] - fastEma) * multiplierFast + fastEma;
    slowEma = (values[index] - slowEma) * multiplierSlow + slowEma;
    lineValues.push(fastEma - slowEma);
  }
  if (lineValues.length < 9) return { line: lineValues.at(-1) ?? null, signal: null, histogram: null };
  const signal = ema(lineValues, 9);
  const line = lineValues[lineValues.length - 1];
  return { line, signal, histogram: signal === null ? null : line - signal };
}

export function calculateIndicators(candles: Candle[]): IndicatorSnapshot {
  const closes = candles.map((candle) => candle.close);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const rsi14 = rsi(closes, 14);
  const macdValues = macd(closes);
  const window = closes.slice(-20);
  const bollingerMiddle = window.length === 20 ? mean(window) : null;
  const deviation = bollingerMiddle === null
    ? null
    : Math.sqrt(mean(window.map((value) => (value - bollingerMiddle) ** 2)));
  return {
    ema20,
    ema50,
    rsi14,
    macd: macdValues.line,
    macdSignal: macdValues.signal,
    macdHistogram: macdValues.histogram,
    bollingerUpper: deviation === null || bollingerMiddle === null ? null : bollingerMiddle + 2 * deviation,
    bollingerMiddle,
    bollingerLower: deviation === null || bollingerMiddle === null ? null : bollingerMiddle - 2 * deviation,
    atr14: atr(candles, 14),
    sampleSize: candles.length,
  };
}

export function formatIndicator(value: number | null, digits = 4): string {
  return value === null || !Number.isFinite(value) ? "INSUFFICIENT DATA" : value.toFixed(digits);
}
