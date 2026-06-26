# CholoStream

Live IPTV streaming dashboard for the FIFA World Cup 2026. Built with Next.js 16, React 19, and Tailwind CSS v4.

## Features

- **Live Video Player** — HLS.js and mpegts.js dual-engine player with automatic fallback, CORS proxy toggle, and real-time telemetry
- **Channel Grid** — 27 curated IPTV channels from iptv-org with search, category filters, and favorites
- **Live Scores** — World Cup scoreboard with team flags, live match tracking, and today's fixtures
- **Match Schedule** — Virtualized list of all 108 World Cup 2026 matches with search and status filters

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- TanStack React Query v5
- hls.js + mpegts.js
- TanStack React Virtual

## Deploy

Deploy to [Vercel](https://vercel.com/new) with zero configuration.
