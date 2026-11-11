import { useEffect, useState } from "react";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"] as const;
const REST_BASE = "https://data-api.binance.vision";
const WS_BASE = "wss://data-stream.binance.vision/stream?streams=";

export interface TickerSnapshot {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  quoteVolume: number;
  receivedAt: number;
}

type TickerState = {
  items: Record<string, TickerSnapshot>;
  status: "CONNECTING" | "LIVE" | "STALE" | "ERROR";
};

function parseTicker(value: unknown, receivedAt: number): TickerSnapshot {
  if (!value || typeof value !== "object") throw new Error("Malformed ticker");
  const item = value as Record<string, unknown>;
  const symbol = String(item.s ?? "");
  const lastPrice = Number(item.c);
  const priceChangePercent = Number(item.P);
  const quoteVolume = Number(item.q);
  if (!SYMBOLS.includes(symbol as (typeof SYMBOLS)[number])) throw new Error("Unexpected ticker symbol");
  if (![lastPrice, priceChangePercent, quoteVolume].every(Number.isFinite) || lastPrice <= 0 || quoteVolume < 0) {
    throw new Error("Invalid ticker values");
  }
  return { symbol, lastPrice, priceChangePercent, quoteVolume, receivedAt };
}

export function useBinanceTicker() {
  const [state, setState] = useState<TickerState>({ items: {}, status: "CONNECTING" });

  useEffect(() => {
    let disposed = false;
    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let staleTimer: ReturnType<typeof setInterval> | undefined;
    let retries = 0;

    const setTicker = (raw: unknown) => {
      const receivedAt = Date.now();
      const ticker = parseTicker(raw, receivedAt);
      setState((previous) => ({
        items: { ...previous.items, [ticker.symbol]: ticker },
        status: "LIVE",
      }));
    };

    const params = new URLSearchParams({ symbols: JSON.stringify(SYMBOLS), type: "FULL" });
    fetch(`${REST_BASE}/api/v3/ticker/24hr?${params}`, { headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Ticker REST returned HTTP ${response.status}`);
        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) throw new Error("Unexpected ticker REST payload");
        payload.forEach((item) => {
          if (!disposed) setTicker(item);
        });
      })
      .catch(() => {
        if (!disposed) setState((previous) => ({ ...previous, status: Object.keys(previous.items).length ? "STALE" : "ERROR" }));
      });

    const connect = () => {
      if (disposed) return;
      const streams = SYMBOLS.map((symbol) => `${symbol.toLowerCase()}@ticker`).join("/");
      socket = new WebSocket(`${WS_BASE}${streams}`);
      socket.onopen = () => { retries = 0; };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as { stream?: unknown; data?: unknown };
          if (typeof message.stream !== "string" || !message.data) throw new Error("Malformed combined stream event");
          setTicker(message.data);
        } catch {
          if (!disposed) setState((previous) => ({ ...previous, status: Object.keys(previous.items).length ? "STALE" : "ERROR" }));
        }
      };
      socket.onerror = () => {
        if (!disposed) setState((previous) => ({ ...previous, status: Object.keys(previous.items).length ? "STALE" : "ERROR" }));
      };
      socket.onclose = () => {
        if (disposed) return;
        setState((previous) => ({ ...previous, status: Object.keys(previous.items).length ? "STALE" : "CONNECTING" }));
        const delay = Math.min(1000 * 2 ** retries, 30_000);
        retries += 1;
        retryTimer = setTimeout(connect, delay);
      };
    };

    connect();
    staleTimer = setInterval(() => {
      setState((previous) => {
        const newest = Math.max(0, ...Object.values(previous.items).map((item) => item.receivedAt));
        return newest && Date.now() - newest > 15_000 ? { ...previous, status: "STALE" } : previous;
      });
    }, 3000);

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (staleTimer) clearInterval(staleTimer);
      socket?.close();
    };
  }, []);

  return { ...state, symbols: SYMBOLS };
}
