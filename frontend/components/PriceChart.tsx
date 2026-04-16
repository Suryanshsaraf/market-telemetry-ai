'use client';

import { PriceHistory } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PriceChartProps {
  history: PriceHistory[];
  color?: string;
  height?: number;
}

export default function PriceChart({ history, color, height = 350 }: PriceChartProps) {
  if (history.length < 2) {
    return (
      <div className="flex items-center justify-center bg-surface rounded-xl border border-border" style={{ height }}>
        <p className="text-text-muted">Waiting for price data...</p>
      </div>
    );
  }

  const firstPrice = history[0]?.price ?? 0;
  const lastPrice = history[history.length - 1]?.price ?? 0;
  const isPositive = lastPrice >= firstPrice;
  const chartColor = color || (isPositive ? '#10b981' : '#ef4444');

  const data = history.map((h, i) => ({
    index: i,
    price: h.price,
    time: new Date(h.timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }));

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="time"
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 11 }}
            interval="preserveStartEnd"
            tickCount={6}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 11 }}
            domain={['auto', 'auto']}
            tickFormatter={(val) => `$${val.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              color: '#f1f5f9',
              fontSize: '13px',
            }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Price']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={chartColor}
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: chartColor, stroke: '#0a0f1e', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
