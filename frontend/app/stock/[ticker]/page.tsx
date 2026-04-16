'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PriceChart from '@/components/PriceChart';
import AlertForm from '@/components/AlertForm';
import AlertList from '@/components/AlertList';
import NotificationToast from '@/components/NotificationToast';
import { useSSEPrices } from '@/hooks/useSSEPrices';
import { useSSEAlerts } from '@/hooks/useSSEAlerts';
import { useWatchlist } from '@/hooks/useWatchlist';
import { formatPrice, formatPercentChange, getChangeColor } from '@/utils/formatters';
import { useState } from 'react';

export default function StockDetailPage() {
  const params = useParams();
  const ticker = decodeURIComponent(params.ticker as string);
  const { stocks, connected } = useSSEPrices();
  const { triggeredAlerts, latestAlert, dismissAlert } = useSSEAlerts();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [alertRefreshKey, setAlertRefreshKey] = useState(0);

  const stock = stocks[ticker];
  const isWatchlisted = isInWatchlist(ticker);

  const TrendIcon = stock
    ? stock.percentChange > 0
      ? TrendingUp
      : stock.percentChange < 0
        ? TrendingDown
        : Minus
    : Minus;

  return (
    <div className="min-h-screen">
      <Navbar connected={connected} alertCount={triggeredAlerts.length} />
      <NotificationToast alert={latestAlert} onDismiss={dismissAlert} />

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Back button + header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-text-primary">{ticker}</h1>
                <button
                  onClick={() => toggleWatchlist(ticker)}
                  className={`p-2 rounded-lg transition-all ${
                    isWatchlisted
                      ? 'text-warning bg-warning/10'
                      : 'text-text-muted hover:text-warning hover:bg-warning/10'
                  }`}
                >
                  <Star className="w-5 h-5" fill={isWatchlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
              <p className="text-text-secondary">
                {stock?.company || 'Loading...'}
              </p>
            </div>

            {stock && (
              <div className="text-right">
                <p className="text-4xl font-bold text-text-primary tabular-nums">
                  ${formatPrice(stock.price)}
                </p>
                <div className={`flex items-center gap-1.5 justify-end mt-1 ${getChangeColor(stock.percentChange)}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatPercentChange(stock.percentChange)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        {stock && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Current Price', value: `$${formatPrice(stock.price)}` },
              { label: 'Session Change', value: formatPercentChange(stock.percentChange) },
              { label: 'Data Points', value: stock.history.length.toString() },
              { label: 'Status', value: connected ? 'Streaming' : 'Offline' },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface rounded-xl border border-border p-4">
                <p className="text-xs text-text-muted mb-1">{stat.label}</p>
                <p className="text-lg font-semibold text-text-primary">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <PriceChart history={stock?.history || []} height={400} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AlertForm
              tickers={Object.keys(stocks)}
              defaultTicker={ticker}
              onAlertCreated={() => setAlertRefreshKey((k) => k + 1)}
            />
            <AlertList refreshKey={alertRefreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
}
