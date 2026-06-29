import type { Metadata } from "next";
import { Anton, Archivo_Narrow } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-archivo-narrow",
});

export const metadata: Metadata = {
  title: "CholoStream · Live World Cup 2026",
  description: "Stream live FIFA World Cup 2026 — every match, every goal, in ultra-high definition on CholoStream.",
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
      className={`h-full antialiased dark ${anton.variable} ${archivoNarrow.variable}`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-background selection:bg-secondary-fixed selection:text-on-secondary-fixed">
        <ErrorBoundary>
          <QueryProvider>{children}</QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
