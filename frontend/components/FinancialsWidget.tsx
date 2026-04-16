'use client';

export default function FinancialsWidget({ ticker }: { ticker: string }) {
  // Mock data as the backend doesn't provide real fundamental data yet
  return (
    <div className="bg-[#131722] rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">{ticker} Financials</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div className="flex justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted">Market Cap</span>
            <span className="text-text-primary">3.12T</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted">P/E Ratio</span>
            <span className="text-text-primary">33.45</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted">Div Yield</span>
            <span className="text-text-primary">0.52%</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted">EPS</span>
            <span className="text-text-primary">6.42</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted">Next Earnings</span>
            <span className="text-text-primary">Oct 31</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-1">
            <span className="text-text-muted">Beta (1Y)</span>
            <span className="text-text-primary">1.25</span>
          </div>
        </div>

        <div className="pt-2">
            <h4 className="text-xs font-semibold text-text-secondary mb-2">Cash Flow</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between bg-surface-light p-2 rounded">
                    <span className="text-text-muted">Operating Cash Flow (TTM)</span>
                    <span className="text-text-primary font-medium">108.56 B</span>
                </div>
                <div className="flex justify-between bg-surface-light p-2 rounded">
                    <span className="text-text-muted">Investing Cash Flow (TTM)</span>
                    <span className="text-text-primary font-medium">-10.33 B</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
