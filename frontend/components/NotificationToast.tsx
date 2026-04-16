'use client';

import { useEffect, useState } from 'react';
import { X, AlertTriangle, Bell } from 'lucide-react';
import { TriggeredAlert } from '@/types';

interface NotificationToastProps {
  alert: TriggeredAlert | null;
  onDismiss: () => void;
}

export default function NotificationToast({ alert, onDismiss }: NotificationToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [alert]);

  if (!alert || !visible) return null;

  const isAnomaly = alert.type === 'anomaly';

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-down">
      <div className={`max-w-sm w-full rounded-xl border shadow-2xl backdrop-blur-xl p-4 ${
        isAnomaly
          ? 'bg-danger/10 border-danger/30 shadow-danger/10'
          : 'bg-surface border-border shadow-primary/10'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg flex-shrink-0 ${
            isAnomaly ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'
          }`}>
            {isAnomaly ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">{alert.ticker}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                isAnomaly ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'
              }`}>
                {alert.type}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">
              {alert.message}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Price: ${alert.price?.toFixed(2)}
            </p>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
