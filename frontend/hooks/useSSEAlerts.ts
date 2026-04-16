'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TriggeredAlert } from '@/types';
import { getSSEAlertsUrl } from '@/services/api';

export function useSSEAlerts() {
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);
  const [latestAlert, setLatestAlert] = useState<TriggeredAlert | null>(null);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = getSSEAlertsUrl();
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const data: TriggeredAlert = JSON.parse(event.data);
        setTriggeredAlerts((prev) => [data, ...prev].slice(0, 50));
        setLatestAlert(data);

        // Auto-clear latest after 5 seconds
        setTimeout(() => {
          setLatestAlert((current) =>
            current?.alert_id === data.alert_id ? null : current
          );
        }, 5000);
      } catch (e) {
        // skip malformed messages
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      setTimeout(connect, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);

  const dismissAlert = useCallback(() => {
    setLatestAlert(null);
  }, []);

  return { triggeredAlerts, latestAlert, dismissAlert, connected };
}
