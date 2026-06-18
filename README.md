# CholoStream

CholoStream is a modern, responsive web-based IPTV player built with Next.js 16. It dynamically resolves and streams live TV channels from the public [iptv-org](https://github.com/iptv-org/iptv) database, offering a robust playback experience with built-in fallbacks and stream diagnostics.

## Features

- **Dynamic Catalog Integration:** Fetches real-time channel streams and logos from the iptv-org API.
- **Unified Video Player:** A custom-built player supporting multiple stream formats using `hls.js` (for HLS/m3u8 streams) and `mpegts.js` (for MPEG-TS streams).
- **Smart Stream Fallbacks:** If a primary stream is offline, CholoStream automatically falls back to alternative streams using precise title matching.
- **Advanced Diagnostics HUD:** Real-time stream telemetry, codec information, and error logs visible directly over the player.
- **CORS Proxy Support:** Built-in ability to route external streams through a Serverless CORS Proxy to bypass browser restrictions.
- **Modern UI:** A sleek, dark-themed dashboard built with React 19 and Tailwind CSS v4.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Video Engines:** [hls.js](https://github.com/video-dev/hls.js/) & [mpegts.js](https://github.com/xqq/mpegts.js)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query)
- **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Building for Production

Because CholoStream relies on optimized Next.js routing and caching for fetching the large iptv-org catalogs, ensure you build the project before running it in production. If you make changes to the stream resolving logic, you must rebuild:

```bash
npm run build
npm start
```

## Contributing

You can add or modify curated channels in `src/data/channelCatalog.ts`. The resolver will automatically map them against the iptv-org database streams using their IDs or title fallbacks.
