'use client';

import { Star, X } from 'lucide-react';
import Link from 'next/link';
import { StockState } from '@/types';
import { formatPrice, formatPercentChange, getChangeColor } from '@/utils/formatters';

interface WatchlistPanelProps {
  watchlist: string[];
  stocks: Record<string, StockState>;
  onRemove: (ticker: string) => void;
}

export default function WatchlistPanel({ watchlist, stocks, onRemove }: WatchlistPanelProps) {
  if (watchlist.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold text-text-primary">Watchlist</h3>
        </div>
        <p className="text-text-muted text-sm text-center py-4">
          Your watchlist is empty. Star stocks to track them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-warning" fill="currentColor" />
        <h3 className="text-lg font-semibold text-text-primary">Watchlist</h3>
        <span className="text-xs text-text-muted ml-auto">{watchlist.length} stocks</span>
      </div>

      <div className="space-y-1">
        {watchlist.map((ticker) => {
          const stock = stocks[ticker];
          if (!stock) return null;

          return (
            <Link
              key={ticker}
              href={`/stock/${ticker}`}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-light transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold text-primary">
                  {ticker.slice(0, 2)}
                </div>
                <div>
                  <span className="text-sm font-medium text-text-primary">{ticker}</span>
                  <p className="text-xs text-text-muted">{stock.displayName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm font-medium text-text-primary">
                    ${formatPrice(stock.price)}
                  </span>
                  <p className={`text-xs ${getChangeColor(stock.percentChange)}`}>
                    {formatPercentChange(stock.percentChange)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(ticker);
                  }}
                  className="p-1 rounded text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
