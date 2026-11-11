import { describe, expect, it } from "vitest";
import { calculateIndicators, formatIndicator } from "../src/market/indicators";
import type { Candle } from "../src/market/types";

function fixtureCandles(count: number): Candle[] {
  return Array.from({ length: count }, (_, index) => {
    const close = 100 + index * 0.5 + Math.sin(index / 3);
    return {
      time: 1_700_000_000_000 + index * 60_000,
      open: close - 0.2,
      high: close + 0.8,
      low: close - 0.7,
      close,
      volume: 10 + index,
      source: "BINANCE_SPOT",
      receivedAt: 1_700_000_000_000 + index * 60_000 + 100,
      closed: true,
    };
  });
}

describe("technical indicators", () => {
  it("returns null values before the minimum warm-up history", () => {
    const result = calculateIndicators(fixtureCandles(10));
    expect(result.ema20).toBeNull();
    expect(result.ema50).toBeNull();
    expect(result.rsi14).toBeNull();
    expect(result.atr14).toBeNull();
    expect(result.bollingerMiddle).toBeNull();
  });

  it("calculates the supported indicators after sufficient history", () => {
    const result = calculateIndicators(fixtureCandles(100));
    expect(result.ema20).toEqual(expect.any(Number));
    expect(result.ema50).toEqual(expect.any(Number));
    expect(result.rsi14).toEqual(expect.any(Number));
    expect(result.macd).toEqual(expect.any(Number));
    expect(result.macdSignal).toEqual(expect.any(Number));
    expect(result.macdHistogram).toEqual(expect.any(Number));
    expect(result.bollingerUpper).toBeGreaterThan(result.bollingerMiddle!);
    expect(result.bollingerLower).toBeLessThan(result.bollingerMiddle!);
    expect(result.atr14).toBeGreaterThan(0);
  });

  it("formats missing values as insufficient data", () => {
    expect(formatIndicator(null)).toBe("INSUFFICIENT DATA");
  });
});
