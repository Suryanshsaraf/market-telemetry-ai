'use client';

import { useState } from 'react';
import { LayoutGrid, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StockGrid from '@/components/StockGrid';
import AlertForm from '@/components/AlertForm';
import AlertList from '@/components/AlertList';
import WatchlistPanel from '@/components/WatchlistPanel';
import NotificationToast from '@/components/NotificationToast';
import { useSSEPrices } from '@/hooks/useSSEPrices';
import { useSSEAlerts } from '@/hooks/useSSEAlerts';
import { useWatchlist } from '@/hooks/useWatchlist';

export default function DashboardPage() {
  const { stocks, connected } = useSSEPrices();
  const { triggeredAlerts, latestAlert, dismissAlert } = useSSEAlerts();
  const { watchlist, toggleWatchlist, removeFromWatchlist } = useWatchlist();
  const [filter, setFilter] = useState<'all' | 'watchlist'>('all');
  const [alertRefreshKey, setAlertRefreshKey] = useState(0);

  const tickers = Object.keys(stocks);

  return (
    <div className="min-h-screen">
      <Navbar connected={connected} alertCount={triggeredAlerts.length} />
      <NotificationToast alert={latestAlert} onDismiss={dismissAlert} />

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-1">
            Dashboard
          </h1>
          <p className="text-text-secondary">
            Real-time market monitoring &middot; {tickers.length} assets streaming
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-surface text-text-secondary border border-border hover:border-border-light'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            All Assets
          </button>
          <button
            onClick={() => setFilter('watchlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'watchlist'
                ? 'bg-warning/20 text-warning border border-warning/40'
                : 'bg-surface text-text-secondary border border-border hover:border-border-light'
            }`}
          >
            <Star className="w-4 h-4" />
            Watchlist
            {watchlist.length > 0 && (
              <span className="text-xs bg-surface-light px-1.5 py-0.5 rounded-full">
                {watchlist.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content: Stock Grid */}
          <div className="lg:col-span-3">
            <StockGrid
              stocks={stocks}
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlist}
              filter={filter}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WatchlistPanel
              watchlist={watchlist}
              stocks={stocks}
              onRemove={removeFromWatchlist}
            />
            <AlertForm
              tickers={tickers}
              onAlertCreated={() => setAlertRefreshKey((k) => k + 1)}
            />
            <AlertList refreshKey={alertRefreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
}
