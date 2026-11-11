import { useEffect, useState } from "react";
import { createKlineSocket, fetchHistoricalCandles } from "./binanceSpot";
import type { Candle, FeedStatus, MarketInterval } from "./types";

interface MarketState {
  candles: Candle[];
  status: FeedStatus;
  lastUpdated: number | null;
  error: string | null;
}

const initialState: MarketState = { candles: [], status: "CONNECTING", lastUpdated: null, error: null };
const STALE_AFTER_MS = 15_000;

export function useBinanceMarketData(symbol: string, interval: MarketInterval, enabled: boolean) {
  const [state, setState] = useState<MarketState>(initialState);

  useEffect(() => {
    if (!enabled) {
      setState({ candles: [], status: "NO_DATA", lastUpdated: null, error: "This market feed is not supported by this adapter." });
      return;
    }

    const controller = new AbortController();
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let staleTimer: ReturnType<typeof setInterval> | undefined;
    let reconnectAttempt = 0;
    let disposed = false;

    setState({ candles: [], status: "CONNECTING", lastUpdated: null, error: null });

    const mergeCandle = (incoming: Candle) => {
      if (disposed) return;
      setState((previous) => {
        const candles = [...previous.candles];
        const existing = candles.findIndex((item) => item.time === incoming.time);
        if (existing >= 0) candles[existing] = incoming;
        else candles.push(incoming);
        candles.sort((a, b) => a.time - b.time);
        const bounded = candles.slice(-500);
        return { candles: bounded, status: "LIVE", lastUpdated: incoming.receivedAt, error: null };
      });
    };

    const connectSocket = () => {
      if (disposed) return;
      try {
        socket = createKlineSocket(symbol, interval, mergeCandle, (status) => {
          if (disposed) return;
          if (status === "OPEN") reconnectAttempt = 0;
          if (status === "ERROR") {
            setState((previous) => ({ ...previous, status: previous.candles.length ? "STALE" : "CONNECTING" }));
          }
          if (status === "CLOSED") {
            setState((previous) => ({ ...previous, status: previous.candles.length ? "STALE" : "CONNECTING" }));
            const delay = Math.min(1000 * 2 ** reconnectAttempt, 30_000);
            reconnectAttempt += 1;
            reconnectTimer = setTimeout(connectSocket, delay);
          }
        });
      } catch {
        setState((previous) => ({ ...previous, status: "ERROR", error: "Unable to initialize market WebSocket." }));
      }
    };

    fetchHistoricalCandles(symbol, interval, controller.signal)
      .then((candles) => {
        if (disposed) return;
        const latest = candles[candles.length - 1];
        setState({ candles, status: latest ? "CONNECTING" : "NO_DATA", lastUpdated: latest?.receivedAt ?? null, error: null });
      })
      .catch((error: unknown) => {
        if (disposed || (error instanceof DOMException && error.name === "AbortError")) return;
        setState((previous) => ({
          ...previous,
          status: previous.candles.length ? "STALE" : "ERROR",
          error: error instanceof Error ? error.message : "Market data request failed.",
        }));
      });

    connectSocket();
    staleTimer = setInterval(() => {
      setState((previous) => {
        if (!previous.lastUpdated || Date.now() - previous.lastUpdated <= STALE_AFTER_MS) return previous;
        return { ...previous, status: "STALE" };
      });
    }, 3000);

    return () => {
      disposed = true;
      controller.abort();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (staleTimer) clearInterval(staleTimer);
      socket?.close();
    };
  }, [symbol, interval, enabled]);

  return state;
}
