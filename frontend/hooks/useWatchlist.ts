'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'market_telemetry_watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setWatchlist(JSON.parse(stored));
        } catch {
          setWatchlist([]);
        }
      }
    }
  }, []);

  const addToWatchlist = useCallback((ticker: string) => {
    setWatchlist((prev) => {
      if (prev.includes(ticker)) return prev;
      const next = [...prev, ticker];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromWatchlist = useCallback((ticker: string) => {
    setWatchlist((prev) => {
      const next = prev.filter((t) => t !== ticker);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isInWatchlist = useCallback(
    (ticker: string) => watchlist.includes(ticker),
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    (ticker: string) => {
      if (isInWatchlist(ticker)) {
        removeFromWatchlist(ticker);
      } else {
        addToWatchlist(ticker);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleWatchlist };
}
