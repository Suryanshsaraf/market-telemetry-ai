import { AlertCreate, Alert } from '@/types';
import { generateUserId } from '@/utils/formatters';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getUserId(): string {
  return generateUserId();
}

export async function setAlert(alert: AlertCreate): Promise<{ message: string; alert_id: string }> {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/api/set-alert?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to set alert' }));
    throw new Error(err.detail || 'Failed to set alert');
  }
  return res.json();
}

export async function getAlerts(): Promise<Alert[]> {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/api/get-alerts?user_id=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  const data = await res.json();
  return data.alerts || [];
}

export async function deleteAlert(alertId: string): Promise<void> {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/api/delete-alert/${alertId}?user_id=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete alert');
}

export function getSSEPricesUrl(): string {
  return `${API_BASE}/api/stream-prices`;
}

export function getSSEAlertsUrl(): string {
  const userId = getUserId();
  return `${API_BASE}/api/stream-alerts?user_id=${userId}`;
}
