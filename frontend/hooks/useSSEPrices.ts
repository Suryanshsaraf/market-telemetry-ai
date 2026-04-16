'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { StockPrice, StockState } from '@/types';
import { getSSEPricesUrl } from '@/services/api';

const MAX_HISTORY = 200;

export function useSSEPrices() {
  const [stocks, setStocks] = useState<Record<string, StockState>>({});
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = getSSEPricesUrl();
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const data: StockPrice = JSON.parse(event.data);
        
        setStocks((prev) => {
          const existing = prev[data.ticker];
          const prevPrice = existing?.price ?? data.price;
          const percentChange = prevPrice > 0
            ? ((data.price - prevPrice) / prevPrice) * 100
            : 0;

          const newHistory = [
            ...(existing?.history ?? []),
            { price: data.price, timestamp: data.timestamp },
          ].slice(-MAX_HISTORY);

          return {
            ...prev,
            [data.ticker]: {
              ticker: data.ticker,
              price: data.price,
              prevPrice,
              percentChange,
              company: data.company || existing?.company || data.ticker,
              displayName: data.display_name || existing?.displayName || data.ticker,
              history: newHistory,
              lastUpdate: Date.now(),
            },
          };
        });
      } catch (e) {
        // skip malformed messages
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);

  return { stocks, connected };
}
