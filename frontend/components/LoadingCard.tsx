'use client';

export default function LoadingCard() {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-light" />
          <div>
            <div className="w-20 h-4 rounded bg-surface-light mb-1.5" />
            <div className="w-32 h-3 rounded bg-surface-light" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-surface-light" />
      </div>
      <div className="w-24 h-7 rounded bg-surface-light mb-2" />
      <div className="w-16 h-4 rounded bg-surface-light" />
    </div>
  );
}
