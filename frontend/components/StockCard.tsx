'use client';

import Link from 'next/link';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StockState } from '@/types';
import { formatPrice, formatPercentChange, getChangeColor, getChangeBg } from '@/utils/formatters';

interface StockCardProps {
  stock: StockState;
  isWatchlisted: boolean;
  onToggleWatchlist: (ticker: string) => void;
}

export default function StockCard({ stock, isWatchlisted, onToggleWatchlist }: StockCardProps) {
  const isPositive = stock.percentChange > 0;
  const isNegative = stock.percentChange < 0;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  // Mini sparkline data from history
  const sparklinePoints = stock.history.slice(-20).map((h, i, arr) => {
    const minP = Math.min(...arr.map(a => a.price));
    const maxP = Math.max(...arr.map(a => a.price));
    const range = maxP - minP || 1;
    const x = (i / (arr.length - 1)) * 80;
    const y = 24 - ((h.price - minP) / range) * 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Link
      href={`/stock/${stock.ticker}`}
      className="group block bg-surface rounded-xl border border-border hover:border-primary/40 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border">
            <span className="text-sm font-bold text-primary">
              {stock.ticker.slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
              {stock.ticker}
            </h3>
            <p className="text-xs text-text-muted truncate max-w-[120px]">
              {stock.company}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWatchlist(stock.ticker);
          }}
          className={`p-1.5 rounded-lg transition-all duration-200 ${
            isWatchlisted
              ? 'text-warning bg-warning/10'
              : 'text-text-muted hover:text-warning hover:bg-warning/10'
          }`}
        >
          <Star className="w-4 h-4" fill={isWatchlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mb-3">
        <span className="text-2xl font-bold text-text-primary">
          ${formatPrice(stock.price)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getChangeBg(stock.percentChange)} ${getChangeColor(stock.percentChange)}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          {formatPercentChange(stock.percentChange)}
        </div>

        {/* Mini Sparkline */}
        {stock.history.length > 2 && (
          <svg width="80" height="24" className="opacity-60 group-hover:opacity-100 transition-opacity">
            <polyline
              points={sparklinePoints}
              fill="none"
              stroke={isPositive ? '#10b981' : isNegative ? '#ef4444' : '#64748b'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </Link>
  );
}
