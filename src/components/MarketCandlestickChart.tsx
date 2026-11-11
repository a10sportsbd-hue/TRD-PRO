import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle } from "../market/types";

interface Props {
  candles: Candle[];
}

export function MarketCandlestickChart({ candles }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const chart = createChart(element, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "#0d141e" }, textColor: "#8290a5" },
      grid: { vertLines: { color: "#172130" }, horzLines: { color: "#172130" } },
      rightPriceScale: { borderColor: "#263243" },
      timeScale: { borderColor: "#263243", timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: "#496184" }, horzLine: { color: "#496184" } },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#31c995",
      downColor: "#e16e78",
      borderUpColor: "#31c995",
      borderDownColor: "#e16e78",
      wickUpColor: "#31c995",
      wickDownColor: "#e16e78",
    });
    chartRef.current = chart;
    seriesRef.current = series;

    const observer = new ResizeObserver(() => chart.timeScale().fitContent());
    observer.observe(element);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    series.setData(candles.map((candle) => ({
      time: Math.floor(candle.time / 1000) as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    })));
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return <div className="live-chart" ref={containerRef} aria-label="Verified market candlestick chart" />;
}
