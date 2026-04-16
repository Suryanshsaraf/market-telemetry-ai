'use client';

export default function TechnicalGauge({ percentChange }: { percentChange: number }) {
  // Normalize percent change to a signal value between -1 and 1
  // -2% and below = -1 (Strong Sell), +2% and above = 1 (Strong Buy)
  const signal = Math.max(-1, Math.min(1, percentChange / 2));
  
  // Angle for rotation relative to the center top (-90 is left, 90 is right)
  const angle = signal * 90;

  let status = "Neutral";
  let color = "#a1a1aa";
  
  if (signal < -0.6) { status = "Strong Sell"; color = "#ef4444"; }
  else if (signal < -0.1) { status = "Sell"; color = "#f87171"; }
  else if (signal > 0.6) { status = "Strong Buy"; color = "#22c55e"; }
  else if (signal > 0.1) { status = "Buy"; color = "#3b82f6"; }

  return (
    <div className="bg-[#131722] rounded-xl border border-border p-5 flex flex-col items-center justify-center">
      <h3 className="text-sm font-medium text-text-primary mb-6 w-full text-left">Technical Analysis</h3>
      
      <div className="relative w-64 h-32 mb-4 mt-2">
        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
          {/* Base Track */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="#2A2E39"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Colored Segments */}
          <path d="M 5 50 A 45 45 0 0 1 18.1 18.1" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
          <path d="M 18.1 18.1 A 45 45 0 0 1 50 5" fill="none" stroke="#f87171" strokeWidth="4" />
          <path d="M 50 5 A 45 45 0 0 1 81.9 18.1" fill="none" stroke="#3b82f6" strokeWidth="4" />
          <path d="M 81.9 18.1 A 45 45 0 0 1 95 50" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />

          {/* Labels */}
          <text x="-5" y="52" fontSize="5" fill="#a1a1aa" textAnchor="end">Strong Sell</text>
          <text x="12" y="14" fontSize="5" fill="#a1a1aa" textAnchor="end">Sell</text>
          <text x="50" y="-2" fontSize="5" fill="#a1a1aa" textAnchor="middle">Neutral</text>
          <text x="88" y="14" fontSize="5" fill="#a1a1aa" textAnchor="start">Buy</text>
          <text x="105" y="52" fontSize="5" fill="#a1a1aa" textAnchor="start">Strong Buy</text>
          
          {/* Needle */}
          <g transform={`rotate(${angle}, 50, 50)`}>
            <polygon points="49.5,50 50,5 50.5,50" fill="#ffffff" />
            <circle cx="50" cy="50" r="3" fill="#ffffff" />
          </g>
        </svg>
      </div>

      <div className="text-2xl font-bold mt-2" style={{ color }}>{status}</div>
      <div className="flex gap-6 mt-4 opacity-80 text-xs">
        <div className="flex flex-col items-center">
            <span className="text-text-muted">Sell</span>
            <span className="text-[#f87171] font-bold text-sm text-center w-full mt-1">4</span>
        </div>
        <div className="flex flex-col items-center">
            <span className="text-text-muted">Neutral</span>
            <span className="text-text-primary font-bold text-sm text-center w-full mt-1">9</span>
        </div>
        <div className="flex flex-col items-center">
            <span className="text-text-muted">Buy</span>
            <span className="text-[#3b82f6] font-bold text-sm text-center w-full mt-1">13</span>
        </div>
      </div>
    </div>
  );
}
