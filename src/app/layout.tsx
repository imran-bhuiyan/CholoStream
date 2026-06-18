import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CholoStream | Live Sports & TV Streaming Dashboard",
  description: "Stream high-definition live channels, watch football leagues, track scores, and stay updated with real-time match schedules.",
};

import QueryProvider from "@/providers/QueryProvider";

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
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
