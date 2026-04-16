export function formatPrice(price: number): string {
  if (price >= 10000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toFixed(2);
}

export function formatPercentChange(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

export function getChangeColor(change: number): string {
  if (change > 0) return 'text-success';
  if (change < 0) return 'text-danger';
  return 'text-text-secondary';
}

export function getChangeBg(change: number): string {
  if (change > 0) return 'bg-success/10';
  if (change < 0) return 'bg-danger/10';
  return 'bg-surface-light';
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function generateUserId(): string {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('market_telemetry_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('market_telemetry_user_id', userId);
  }
  return userId;
}
