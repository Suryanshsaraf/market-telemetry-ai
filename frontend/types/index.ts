export interface StockPrice {
  ticker: string;
  price: number;
  timestamp: number;
  company?: string;
  display_name?: string;
}

export interface PriceHistory {
  price: number;
  timestamp: number;
}

export interface StockState {
  ticker: string;
  price: number;
  prevPrice: number;
  percentChange: number;
  company: string;
  displayName: string;
  history: PriceHistory[];
  lastUpdate: number;
}

export interface Alert {
  alert_id: string;
  ticker: string;
  threshold: number;
  type: string;
  created_at: number;
  time_window?: number | null;
}

export interface AlertCreate {
  ticker: string;
  type: string;
  threshold?: number;
  time_window?: number;
}

export interface TriggeredAlert {
  alert_id: string;
  user_id: string;
  ticker: string;
  price: number;
  threshold: number;
  type: string;
  timestamp: number;
  message: string;
}
