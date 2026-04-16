'use client';

import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface TickData { price: number; timestamp: number }

function formatCandles(history: TickData[]) {
  if (history.length === 0) return [];
  
  const candles = new Map<number, { open: number, high: number, low: number, close: number, time: number }>();
  
  for (const tick of history) {
    const minTimestamp = Math.floor(tick.timestamp / 60) * 60;
    
    if (!candles.has(minTimestamp)) {
      candles.set(minTimestamp, {
        time: minTimestamp,
        open: tick.price,
        high: tick.price,
        low: tick.price,
        close: tick.price
      });
    } else {
      const candle = candles.get(minTimestamp)!;
      candle.high = Math.max(candle.high, tick.price);
      candle.low = Math.min(candle.low, tick.price);
      candle.close = tick.price;
    }
  }
  
  return Array.from(candles.values()).sort((a, b) => a.time - b.time);
}

export default function TradingChart({ history, height = 400 }: { history: TickData[], height?: number }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.3)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.3)' },
      },
      height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    
    chartRef.current = chart;
    
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    seriesRef.current = series;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (!seriesRef.current || history.length === 0) return;
    const candleData = formatCandles(history) as any[];
    seriesRef.current.setData(candleData);
    chartRef.current?.timeScale().fitContent();
  }, [history]);

  return <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden bg-[#131722]" />;
}
