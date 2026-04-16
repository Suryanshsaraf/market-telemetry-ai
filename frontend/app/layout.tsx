import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Market Telemetry AI | Real-Time Stock Dashboard',
  description: 'AI-powered real-time stock monitoring, anomaly detection, and intelligent alerting platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background bg-mesh antialiased">
        {children}
      </body>
    </html>
  );
}
