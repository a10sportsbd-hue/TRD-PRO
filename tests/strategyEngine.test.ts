import { describe, expect, it } from "vitest";
import { evaluateStrategy } from "../src/market/strategyEngine";
import { analyzeMarketStructure, findSwingPoints } from "../src/market/structure";
import type { Candle } from "../src/market/types";

function candle(index: number, open: number, high: number, low: number, close: number, closed = true): Candle {
  return {
    time: 1_700_000_000_000 + index * 60_000,
    open, high, low, close, volume: 100 + index,
    source: "BINANCE_SPOT",
    receivedAt: 1_700_000_000_100 + index * 60_000,
    closed,
  };
}

function risingCandles(count: number): Candle[] {
  return Array.from({ length: count }, (_, index) => {
    const close = 100 + index * 0.2 + Math.sin(index / 4) * 0.25;
    return candle(index, close - 0.1, close + 0.5, close - 0.5, close);
  });
}

describe("strategy validation gates", () => {
  it("blocks when the feed is not live", () => {
    const candles = risingCandles(120);
    const result = evaluateStrategy({
      candles, feedStatus: "STALE", symbol: "BTCUSDT", interval: "1m",
      now: candles[candles.length - 1].time + 60_000,
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.direction).toBe("NO_SIGNAL");
    expect(result.entry).toBeNull();
  });

  it("blocks insufficient candle history", () => {
    const candles = risingCandles(30);
    const result = evaluateStrategy({
      candles, feedStatus: "LIVE", symbol: "BTCUSDT", interval: "1m",
      now: candles[candles.length - 1].time + 60_000,
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.direction).toBe("NO_SIGNAL");
  });

  it("blocks if an open candle is passed to the evaluator", () => {
    const candles = risingCandles(120);
    candles[candles.length - 1] = { ...candles[candles.length - 1], closed: false };
    const result = evaluateStrategy({
      candles, feedStatus: "LIVE", symbol: "BTCUSDT", interval: "1m",
      now: candles[candles.length - 1].time + 60_000,
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.direction).toBe("NO_SIGNAL");
  });

  it("blocks stale latest candle", () => {
    const candles = risingCandles(120);
    const result = evaluateStrategy({
      candles, feedStatus: "LIVE", symbol: "BTCUSDT", interval: "1m",
      now: candles[candles.length - 1].time + 10 * 60_000,
    });
    expect(result.status).toBe("BLOCKED");
    expect(result.reason).toContain("stale");
  });
});

describe("market structure observations", () => {
  it("returns no confirmed pivots with insufficient candles", () => {
    expect(findSwingPoints(risingCandles(5))).toHaveLength(0);
  });

  it("detects a three-candle bullish fair value gap", () => {
    const candles = risingCandles(17);
    candles.push(
      candle(17, 100, 101, 99, 100),
      candle(18, 100, 105, 100, 104),
      candle(19, 106, 108, 105, 107),
    );
    const result = analyzeMarketStructure(candles, 1);
    expect(result.fvg?.direction).toBe("BULLISH");
    expect(result.fvg?.low).toBe(101);
    expect(result.fvg?.high).toBe(105);
  });
});
