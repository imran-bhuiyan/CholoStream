import { Channel, StreamSource } from '@/types/stream';

// 18 Channels featuring Sports, News, Entertainment, and International
export const CHANNELS: Channel[] = [
  {
    id: 'fifa-wc',
    name: 'FIFA World Cup TV',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: false },
      { url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', codec: 'HEVC', isBackup: true }
    ]
  },
  {
    id: 'bein-sports-1',
    name: 'Bein Sports 1',
    logoUrl: 'https://images.unsplash.com/photo-1540747737956-37872f747d7c?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', codec: 'HEVC', isBackup: false },
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: true }
    ]
  },
  {
    id: 'bein-sports-2',
    name: 'Bein Sports 2',
    logoUrl: 'https://images.unsplash.com/photo-1540747737956-37872f747d7c?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'tsn-1',
    name: 'TSN Sports 1',
    logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      // TSN starts with a brittle placeholder font URL to test URL validation and H.264 fallback
      { url: 'https://example.com/fonts/corrupt-stream.woff2', codec: 'AVC', isBackup: false },
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: true }
    ]
  },
  {
    id: 'tsn-2',
    name: 'TSN Sports 2',
    logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'win-sports',
    name: 'Win Sports',
    logoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      // MPEG-TS feed to test the mpegts.js audio decoder fallback recovery
      { url: 'https://d2zihajmogu5jn.cloudfront.net/bipbop/bipbopall.m3u8', codec: 'MPEGTS', isBackup: false },
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: true }
    ]
  },
  {
    id: 'fussball-tv',
    name: 'Fussball TV',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'caze-tv',
    name: 'Caze TV',
    logoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'tyc-sports',
    name: 'TyC Sports',
    logoUrl: 'https://images.unsplash.com/photo-1540747737956-37872f747d7c?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'd-sports',
    name: 'D Sports',
    logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'somoy-tv',
    name: 'Somoy TV',
    logoUrl: 'https://images.unsplash.com/photo-1495020689067-958852a6565d?w=100&h=100&fit=crop&q=80',
    category: 'News',
    sources: [
      { url: 'https://bozztv.com/rongo/rongo-somoy/index.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'zee-bangla',
    name: 'Zee Bangla',
    logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop&q=80',
    category: 'Entertainment',
    sources: [
      { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1715/output/index.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'eurosport',
    name: 'Eurosport',
    logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'sky-sports-football',
    name: 'Sky Sports Football',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'espn',
    name: 'ESPN',
    logoUrl: 'https://images.unsplash.com/photo-1540747737956-37872f747d7c?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://d3b6q2ou5kp8ke.cloudfront.net/ESPNTheOcho.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'fox-sports',
    name: 'Fox Sports',
    logoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=100&h=100&fit=crop&q=80',
    category: 'Sports',
    sources: [
      { url: 'https://tvsen7.aynaott.com/foxsports2/index.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'bbc-world-news',
    name: 'BBC World News',
    logoUrl: 'https://images.unsplash.com/photo-1495020689067-958852a6565d?w=100&h=100&fit=crop&q=80',
    category: 'International',
    sources: [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: false }
    ]
  },
  {
    id: 'hbo',
    name: 'HBO Movies',
    logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop&q=80',
    category: 'Entertainment',
    sources: [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC', isBackup: false }
    ]
  }
];

// Helper to filter out corrupted placeholder URLs
export function isValidStreamSource(source: StreamSource): boolean {
  if (!source || !source.url) return false;
  const lowerUrl = source.url.toLowerCase().trim();
  return !(
    lowerUrl.endsWith('.woff2') ||
    lowerUrl.endsWith('.woff') ||
    lowerUrl.endsWith('.ttf') ||
    lowerUrl.endsWith('.png') ||
    lowerUrl.endsWith('.jpg') ||
    lowerUrl.endsWith('.css')
  );
}

// Validation mapping utility
export function getValidatedChannels(): Channel[] {
  return CHANNELS.map(channel => {
    const validSources = channel.sources.filter(isValidStreamSource);
    const activeSources = validSources.length > 0 ? validSources : [
      { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', codec: 'AVC' as const, isBackup: false }
    ];
    return { ...channel, sources: activeSources };
  });
}

export { MATCH_SCHEDULE } from './worldCup2026Schedule';
