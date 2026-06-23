import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CholoStream | Live Sports & TV Streaming Dashboard",
  description: "CholoStream — Stream live IPTV channels, watch the FIFA World Cup 2026, track scores, and view match schedules.",
};

import QueryProvider from "@/providers/QueryProvider";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#06070a] text-slate-100">
        <ErrorBoundary>
          <QueryProvider>{children}</QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
