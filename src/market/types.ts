export type MarketInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  source: "BINANCE_SPOT";
  receivedAt: number;
  closed: boolean;
}

export type FeedStatus = "CONNECTING" | "LIVE" | "STALE" | "ERROR" | "NO_DATA";
