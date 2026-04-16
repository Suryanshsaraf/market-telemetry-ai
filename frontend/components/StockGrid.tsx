'use client';

import { StockState } from '@/types';
import StockCard from './StockCard';
import LoadingCard from './LoadingCard';

interface StockGridProps {
  stocks: Record<string, StockState>;
  watchlist: string[];
  onToggleWatchlist: (ticker: string) => void;
  filter: 'all' | 'watchlist';
}

export default function StockGrid({ stocks, watchlist, onToggleWatchlist, filter }: StockGridProps) {
  const stockList = Object.values(stocks);
  
  const filteredStocks = filter === 'watchlist'
    ? stockList.filter((s) => watchlist.includes(s.ticker))
    : stockList;

  // Sort: watchlisted first, then by ticker
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    const aWatched = watchlist.includes(a.ticker) ? 0 : 1;
    const bWatched = watchlist.includes(b.ticker) ? 0 : 1;
    if (aWatched !== bWatched) return aWatched - bWatched;
    return a.ticker.localeCompare(b.ticker);
  });

  if (stockList.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  if (filter === 'watchlist' && sortedStocks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted text-lg">No stocks in your watchlist yet.</p>
        <p className="text-text-muted text-sm mt-1">Click the ★ on any stock to add it.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedStocks.map((stock) => (
        <StockCard
          key={stock.ticker}
          stock={stock}
          isWatchlisted={watchlist.includes(stock.ticker)}
          onToggleWatchlist={onToggleWatchlist}
        />
      ))}
    </div>
  );
}
