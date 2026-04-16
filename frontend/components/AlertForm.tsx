'use client';

import { useState } from 'react';
import { AlertCircle, Bell, Loader2 } from 'lucide-react';
import { setAlert } from '@/services/api';

interface AlertFormProps {
  tickers: string[];
  defaultTicker?: string;
  onAlertCreated?: () => void;
}

export default function AlertForm({ tickers, defaultTicker, onAlertCreated }: AlertFormProps) {
  const [ticker, setTicker] = useState(defaultTicker || '');
  const [type, setType] = useState('above');
  const [threshold, setThreshold] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!ticker || !threshold) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await setAlert({
        ticker,
        type,
        threshold: parseFloat(threshold),
      });
      setSuccess(`Alert created: ${result.message}`);
      setThreshold('');
      onAlertCreated?.();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">Set Alert</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ticker Select */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Asset</label>
          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Select ticker...</option>
            {tickers.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Condition</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'above', label: 'Price Above' },
              { value: 'below', label: 'Price Below' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  type === opt.value
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-surface-light text-text-secondary border border-border hover:border-border-light'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Threshold */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Threshold ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="e.g. 150.00"
            className="w-full bg-surface-light border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="text-success text-sm bg-success/10 px-3 py-2 rounded-lg">
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          {loading ? 'Creating...' : 'Create Alert'}
        </button>
      </form>
    </div>
  );
}
