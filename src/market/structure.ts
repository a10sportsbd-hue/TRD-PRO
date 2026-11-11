import type { Candle } from "./types";

export interface PriceLevel {
  price: number;
  firstIndex: number;
  touches: number;
  kind: "SUPPORT" | "RESISTANCE";
}

export interface SwingPoint {
  index: number;
  time: number;
  price: number;
  kind: "HIGH" | "LOW";
}

export interface StructureSnapshot {
  swings: SwingPoint[];
  support: PriceLevel[];
  resistance: PriceLevel[];
  bos: "BULLISH" | "BEARISH" | null;
  choch: "BULLISH" | "BEARISH" | null;
  fvg: { direction: "BULLISH" | "BEARISH"; low: number; high: number; index: number } | null;
  liquiditySweep: { direction: "BULLISH" | "BEARISH"; level: number; index: number } | null;
}

export function findSwingPoints(candles: Candle[], left = 3, right = 3): SwingPoint[] {
  const points: SwingPoint[] = [];
  for (let index = left; index < candles.length - right; index += 1) {
    const current = candles[index];
    const neighbors = candles.slice(index - left, index + right + 1);
    const isHigh = neighbors.every((item, offset) => offset === left || current.high > item.high);
    const isLow = neighbors.every((item, offset) => offset === left || current.low < item.low);
    if (isHigh) points.push({ index, time: current.time, price: current.high, kind: "HIGH" });
    if (isLow) points.push({ index, time: current.time, price: current.low, kind: "LOW" });
  }
  return points;
}

function clusterLevels(points: SwingPoint[], kind: "HIGH" | "LOW", tolerance: number): PriceLevel[] {
  const clusters: { priceSum: number; firstIndex: number; touches: number }[] = [];
  for (const point of points.filter((item) => item.kind === kind)) {
    const match = clusters.find((cluster) => Math.abs(cluster.priceSum / cluster.touches - point.price) <= tolerance);
    if (match) {
      match.priceSum += point.price;
      match.touches += 1;
    } else {
      clusters.push({ priceSum: point.price, firstIndex: point.index, touches: 1 });
    }
  }
  return clusters.map((cluster) => ({
    price: cluster.priceSum / cluster.touches,
    firstIndex: cluster.firstIndex,
    touches: cluster.touches,
    kind: kind === "LOW" ? "SUPPORT" : "RESISTANCE",
  }));
}

export function analyzeMarketStructure(candles: Candle[], atrValue: number | null): StructureSnapshot {
  const swings = findSwingPoints(candles);
  if (candles.length < 20 || swings.length < 2) {
    return { swings, support: [], resistance: [], bos: null, choch: null, fvg: null, liquiditySweep: null };
  }

  const tolerance = Math.max((atrValue ?? 0) * 0.15, candles[candles.length - 1].close * 0.0005);
  const support = clusterLevels(swings, "LOW", tolerance);
  const resistance = clusterLevels(swings, "HIGH", tolerance);
  const latest = candles[candles.length - 1];
  const previous = candles[candles.length - 2];
  const priorHighs = swings.filter((point) => point.kind === "HIGH" && point.index < candles.length - 1);
  const priorLows = swings.filter((point) => point.kind === "LOW" && point.index < candles.length - 1);
  const lastHigh = priorHighs.at(-1);
  const lastLow = priorLows.at(-1);

  const bullishBreak = Boolean(lastHigh && previous.close <= lastHigh.price && latest.close > lastHigh.price);
  const bearishBreak = Boolean(lastLow && previous.close >= lastLow.price && latest.close < lastLow.price);
  const earlierHighs = priorHighs.slice(0, -1);
  const earlierLows = priorLows.slice(0, -1);
  const previousBias = earlierHighs.length && earlierLows.length
    ? (earlierHighs.at(-1)!.price < lastHigh!.price && earlierLows.at(-1)!.price < lastLow!.price ? "BULLISH" : "BEARISH")
    : null;
  const breakDirection = bullishBreak ? "BULLISH" : bearishBreak ? "BEARISH" : null;
  const choch = breakDirection && previousBias && breakDirection !== previousBias ? breakDirection : null;

  let fvg: StructureSnapshot["fvg"] = null;
  if (candles.length >= 3) {
    const a = candles[candles.length - 3];
    const c = candles[candles.length - 1];
    if (c.low > a.high) fvg = { direction: "BULLISH", low: a.high, high: c.low, index: candles.length - 1 };
    else if (c.high < a.low) fvg = { direction: "BEARISH", low: c.high, high: a.low, index: candles.length - 1 };
  }

  let liquiditySweep: StructureSnapshot["liquiditySweep"] = null;
  if (lastHigh && latest.high > lastHigh.price && latest.close < lastHigh.price) {
    liquiditySweep = { direction: "BEARISH", level: lastHigh.price, index: candles.length - 1 };
  } else if (lastLow && latest.low < lastLow.price && latest.close > lastLow.price) {
    liquiditySweep = { direction: "BULLISH", level: lastLow.price, index: candles.length - 1 };
  }

  return { swings, support, resistance, bos: breakDirection, choch, fvg, liquiditySweep };
}
