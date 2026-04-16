'use client';

import { useState, useEffect } from 'react';
import { Trash2, Bell, Loader2 } from 'lucide-react';
import { Alert } from '@/types';
import { getAlerts, deleteAlert } from '@/services/api';
import { timeAgo } from '@/utils/formatters';

interface AlertListProps {
  refreshKey?: number;
}

export default function AlertList({ refreshKey }: AlertListProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (e) {
      console.error('Failed to fetch alerts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [refreshKey]);

  const handleDelete = async (alertId: string) => {
    setDeleting(alertId);
    try {
      await deleteAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.alert_id !== alertId));
    } catch (e) {
      console.error('Failed to delete alert', e);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-text-primary">Active Alerts</h3>
        <span className="text-xs text-text-muted ml-auto">{alerts.length} active</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : alerts.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">
          No active alerts. Create one to get started.
        </p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <div
              key={alert.alert_id}
              className="flex items-center justify-between bg-surface-light rounded-lg px-4 py-3 group hover:border-border-light border border-transparent transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{alert.ticker}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    alert.type === 'above'
                      ? 'bg-success/10 text-success'
                      : alert.type === 'below'
                        ? 'bg-danger/10 text-danger'
                        : 'bg-primary/10 text-primary'
                  }`}>
                    {alert.type}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  ${alert.threshold?.toFixed(2)} · {timeAgo(alert.created_at)}
                </p>
              </div>

              <button
                onClick={() => handleDelete(alert.alert_id)}
                disabled={deleting === alert.alert_id}
                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100"
              >
                {deleting === alert.alert_id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
