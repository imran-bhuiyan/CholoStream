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

  const neededIptvIds = new Set<string>();
  const neededTitleFallbacks = new Set<string>();

  for (const entry of CHANNEL_CATALOG) {
    entry.iptvIds.forEach(id => neededIptvIds.add(id));
    entry.titleFallbacks?.forEach(t => neededTitleFallbacks.add(t.toLowerCase()));
  }

  const streams: IptvStream[] = [];
  const logos = new Map<string, string>();

  const streamReq = fetch(IPTV_STREAMS_URL, { cache: 'no-store' }).then(r => r.json() as Promise<IptvStream[]>);
  const logosReq = fetch(IPTV_LOGOS_URL, { cache: 'no-store' }).then(r => r.json() as Promise<IptvLogo[]>);

  const [allStreams, allLogos] = await Promise.all([streamReq, logosReq]);

  for (const stream of allStreams) {
    if (stream.channel && neededIptvIds.has(stream.channel)) {
      streams.push(stream);
      continue;
    }
    if (neededTitleFallbacks.size > 0 && stream.title) {
       const lowerTitle = stream.title.toLowerCase();
       let matchFound = false;
       for (const fallback of Array.from(neededTitleFallbacks)) {
          if (lowerTitle.includes(fallback)) {
            matchFound = true;
            break;
          }
       }
       if (matchFound) {
          streams.push(stream);
          continue;
       }
    }
    if (neededTitleFallbacks.size > 0 && stream.channel) {
       const lowerChan = stream.channel.toLowerCase();
       for (const fallback of Array.from(neededTitleFallbacks)) {
          if (lowerChan.includes(fallback)) {
             streams.push(stream);
             break;
          }
       }
    }
  }

  for (const logo of allLogos) {
    if (logo.channel && neededIptvIds.has(logo.channel)) {
      if (!logos.has(logo.channel)) {
        logos.set(logo.channel, logo.url);
      }
    }
  }

  cache = { streams, logos, fetchedAt: Date.now() };
  return cache;
}

function inferCodec(url: string, stream?: IptvStream): StreamCodec {
  const lower = url.toLowerCase();
  if (lower.includes('.ts') && !lower.includes('.m3u8')) return 'MPEGTS';
  // Check if we can identify HEVC
  if (lower.includes('hevc') || lower.includes('h265') || (stream && stream.quality && stream.quality.toLowerCase().includes('hevc'))) {
    return 'HEVC';
  }
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
    lower.endsWith('.css') ||
    lower.includes('jmp2.uk') ||
    lower.includes('pages.dev')
  );
}

function scoreStream(stream: IptvStream): number {
  let score = 0;
  if (stream.url.startsWith('https://')) score += 2;
  if (stream.url.includes('.m3u8')) score += 3;
  if (stream.quality === '1080p') score += 2;
  if (stream.quality === '720p') score += 1;
  if (stream.url.includes('cors-proxy')) score -= 1;

  // Penalize HEVC
  if (stream.url.toLowerCase().includes('hevc') || stream.url.toLowerCase().includes('h265') || (stream.quality && stream.quality.toLowerCase().includes('hevc'))) {
    score -= 5;
  }
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
        codec: inferCodec(candidate.url, candidate),
        isBackup: resolved.length > 0,
      });
      if (resolved.length >= 3) return resolved;
    }
  }

  for (const title of titleFallbacks) {
    const lowerTitle = title.toLowerCase();
    const candidates = streams
      .filter(
        (s) =>
          isUsableStreamUrl(s.url) &&
          (s.title?.toLowerCase().includes(lowerTitle) ||
            s.channel?.toLowerCase().includes(lowerTitle))
      )
      .sort((a, b) => scoreStream(b) - scoreStream(a));

    for (const candidate of candidates) {
      if (seen.has(candidate.url)) continue;
      seen.add(candidate.url);
      resolved.push({
        url: candidate.url,
        codec: inferCodec(candidate.url, candidate),
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
