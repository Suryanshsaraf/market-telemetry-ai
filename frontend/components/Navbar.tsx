'use client';

import Link from 'next/link';
import { Activity, Bell, BarChart3, Star } from 'lucide-react';

interface NavbarProps {
  connected: boolean;
  alertCount?: number;
}

export default function Navbar({ connected, alertCount = 0 }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                Market Telemetry
              </h1>
              <p className="text-[10px] text-text-muted -mt-0.5 uppercase tracking-widest">
                AI-Powered Analytics
              </p>
            </div>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-light border border-border">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-danger'}`} />
              <span className="text-xs text-text-secondary">
                {connected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Alert Bell */}
            <div className="relative">
              <button 
                className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-secondary hover:text-text-primary"
                onClick={() => alert(`You have ${alertCount} alerts recently triggered.`)}
                title="View Alerts"
              >
                <Bell className="w-5 h-5" />
              </button>
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[10px] flex items-center justify-center font-bold">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </div>

            {/* Activity (Grafana Dashboard) */}
            <a 
              href="http://localhost:3005" 
              target="_blank"
              rel="noopener noreferrer"
              title="System Monitoring (Grafana)"
              className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-secondary hover:text-text-primary"
            >
              <Activity className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
