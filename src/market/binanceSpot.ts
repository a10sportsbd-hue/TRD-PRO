import type { Candle, MarketInterval } from "./types";

const REST_BASE = "https://data-api.binance.vision";
const WS_BASE = "wss://data-stream.binance.vision/ws";
const MAX_CANDLES = 500;

function finitePositive(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Invalid non-positive market value");
  }
  return parsed;
}

function validateCandle(candle: Candle): Candle {
  const { time, open, high, low, close, volume } = candle;
  if (!Number.isSafeInteger(time) || time <= 0) throw new Error("Invalid candle timestamp");
  if (![open, high, low, close, volume].every(Number.isFinite)) throw new Error("Non-finite OHLCV value");
  if (open <= 0 || high <= 0 || low <= 0 || close <= 0 || volume < 0) throw new Error("Invalid OHLCV range");
  if (high < Math.max(open, close, low) || low > Math.min(open, close, high)) {
    throw new Error("Invalid OHLC relationship");
  }
  return candle;
}

export function parseRestKline(row: unknown, receivedAt = Date.now()): Candle {
  if (!Array.isArray(row) || row.length < 7) throw new Error("Malformed Binance kline row");
  return validateCandle({
    time: Number(row[0]),
    open: finitePositive(row[1]),
    high: finitePositive(row[2]),
    low: finitePositive(row[3]),
    close: finitePositive(row[4]),
    volume: Number(row[5]),
    source: "BINANCE_SPOT",
    receivedAt,
    closed: Number(row[6]) < receivedAt,
  });
}

export function parseWebSocketKline(payload: unknown, receivedAt = Date.now()): Candle {
  if (!payload || typeof payload !== "object") throw new Error("Malformed WebSocket event");
  const event = payload as { e?: unknown; E?: unknown; s?: unknown; k?: Record<string, unknown> };
  const k = event.k;
  if (event.e !== "kline" || !k || typeof k !== "object") throw new Error("Unexpected WebSocket event");
  if (typeof event.s !== "string" || event.s !== k.s) throw new Error("Symbol mismatch");
  return validateCandle({
    time: Number(k.t),
    open: finitePositive(k.o),
    high: finitePositive(k.h),
    low: finitePositive(k.l),
    close: finitePositive(k.c),
    volume: Number(k.v),
    source: "BINANCE_SPOT",
    receivedAt,
    closed: k.x === true,
  });
}

export async function fetchHistoricalCandles(
  symbol: string,
  interval: MarketInterval,
  signal: AbortSignal,
): Promise<Candle[]> {
  const params = new URLSearchParams({ symbol, interval, limit: String(MAX_CANDLES) });
  const response = await fetch(`${REST_BASE}/api/v3/klines?${params}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Binance REST returned HTTP ${response.status}`);
  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error("Unexpected Binance REST response");
  const receivedAt = Date.now();
  const candles = rows.map((row) => parseRestKline(row, receivedAt));
  for (let i = 1; i < candles.length; i += 1) {
    if (candles[i].time <= candles[i - 1].time) throw new Error("Duplicate or out-of-order candles");
  }
  return candles;
}

export function createKlineSocket(
  symbol: string,
  interval: MarketInterval,
  onCandle: (candle: Candle) => void,
  onStatus: (status: "OPEN" | "CLOSED" | "ERROR") => void,
): WebSocket {
  const socket = new WebSocket(`${WS_BASE}/${symbol.toLowerCase()}@kline_${interval}`);
  socket.onopen = () => onStatus("OPEN");
  socket.onerror = () => onStatus("ERROR");
  socket.onclose = () => onStatus("CLOSED");
  socket.onmessage = (message) => {
    try {
      const parsed: unknown = JSON.parse(String(message.data));
      const candle = parseWebSocketKline(parsed);
      onCandle(candle);
    } catch {
      onStatus("ERROR");
    }
  };
  return socket;
}
