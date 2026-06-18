import type { Channel, StreamCodec, StreamSource } from '@/types/stream';
import { CHANNEL_CATALOG } from '@/data/channelCatalog';

const IPTV_STREAMS_URL = 'https://iptv-org.github.io/api/streams.json';
const IPTV_LOGOS_URL = 'https://iptv-org.github.io/api/logos.json';

interface IptvStream {
  channel: string | null;
  url: string;
  quality?: string | null;
  title?: string | null;
}

interface IptvLogo {
  channel: string;
  url: string;
}

type IptvCache = {
  streams: IptvStream[];
  logos: Map<string, string>;
  fetchedAt: number;
};

let cache: IptvCache | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

async function loadIptvData(): Promise<IptvCache> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache;
  }

  const [streamsRes, logosRes] = await Promise.all([
    fetch(IPTV_STREAMS_URL, { cache: 'no-store' }),
    fetch(IPTV_LOGOS_URL, { cache: 'no-store' }),
  ]);

  if (!streamsRes.ok || !logosRes.ok) {
    throw new Error('Failed to load iptv-org channel data');
  }

  const streams = (await streamsRes.json()) as IptvStream[];
  const logosJson = (await logosRes.json()) as IptvLogo[];
  const logos = new Map<string, string>();

  for (const logo of logosJson) {
    if (!logos.has(logo.channel)) {
      logos.set(logo.channel, logo.url);
    }
  }

  cache = { streams, logos, fetchedAt: Date.now() };
  return cache;
}

function inferCodec(url: string): StreamCodec {
  const lower = url.toLowerCase();
  if (lower.includes('.ts') && !lower.includes('.m3u8')) return 'MPEGTS';
  return 'AVC';
}

function isUsableStreamUrl(url: string): boolean {
  const lower = url.toLowerCase().trim();
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) return false;
  return !(
    lower.endsWith('.woff2') ||
    lower.endsWith('.woff') ||
    lower.endsWith('.ttf') ||
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.css')
  );
}

function scoreStream(stream: IptvStream): number {
  let score = 0;
  if (stream.url.startsWith('https://')) score += 2;
  if (stream.url.includes('.m3u8')) score += 3;
  if (stream.quality === '1080p') score += 2;
  if (stream.quality === '720p') score += 1;
  if (stream.url.includes('cors-proxy')) score -= 1;
  return score;
}

function resolveStreamsForIds(
  streams: IptvStream[],
  iptvIds: string[],
  titleFallbacks: string[] = []
): StreamSource[] {
  const seen = new Set<string>();
  const resolved: StreamSource[] = [];

  for (const iptvId of iptvIds) {
    const candidates = streams
      .filter((s) => s.channel === iptvId && isUsableStreamUrl(s.url))
      .sort((a, b) => scoreStream(b) - scoreStream(a));

    for (const candidate of candidates) {
      if (seen.has(candidate.url)) continue;
      seen.add(candidate.url);
      resolved.push({
        url: candidate.url,
        codec: inferCodec(candidate.url),
        isBackup: resolved.length > 0,
      });
      if (resolved.length >= 3) return resolved;
    }
  }

  for (const title of titleFallbacks) {
    const titleRegex = new RegExp(`\\b${title}\\b`, 'i');
    const candidates = streams
      .filter(
        (s) =>
          isUsableStreamUrl(s.url) &&
          (titleRegex.test(s.title || '') ||
            titleRegex.test(s.channel || ''))
      )
      .sort((a, b) => scoreStream(b) - scoreStream(a));

    for (const candidate of candidates) {
      if (seen.has(candidate.url)) continue;
      seen.add(candidate.url);
      resolved.push({
        url: candidate.url,
        codec: inferCodec(candidate.url),
        isBackup: resolved.length > 0,
      });
      if (resolved.length >= 3) return resolved;
    }
  }

  return resolved;
}

function resolveLogo(logos: Map<string, string>, iptvIds: string[]): string | undefined {
  for (const iptvId of iptvIds) {
    const logo = logos.get(iptvId);
    if (logo) return logo;
  }
  return undefined;
}

export async function buildChannelsFromIptvOrg(): Promise<Channel[]> {
  const { streams, logos } = await loadIptvData();

  return CHANNEL_CATALOG.map((entry) => {
    const sources = resolveStreamsForIds(streams, entry.iptvIds, entry.titleFallbacks);
    const logoUrl = resolveLogo(logos, entry.iptvIds);

    return {
      id: entry.id,
      name: entry.name,
      category: entry.category,
      logoUrl: logoUrl ?? '',
      sources,
    };
  }).filter((channel) => channel.sources.length > 0);
}
