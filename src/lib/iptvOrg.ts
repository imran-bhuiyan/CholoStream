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

// ---------------------------------------------------------------------------
// Stream health probe cache — avoids re-probing the same URL within 10 min
// ---------------------------------------------------------------------------
const probeCache = new Map<string, { alive: boolean; probedAt: number }>();
const PROBE_CACHE_TTL_MS = 10 * 60 * 1000;
const PROBE_TIMEOUT_MS = 4000;

/**
 * Lightweight HEAD probe to check if a stream URL is reachable (HTTP 200).
 * Results are cached for 10 minutes.
 */
async function probeStreamUrl(url: string): Promise<boolean> {
  const cached = probeCache.get(url);
  if (cached && Date.now() - cached.probedAt < PROBE_CACHE_TTL_MS) {
    return cached.alive;
  }

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });

    // Some servers don't support HEAD; fall back to a range GET
    if (response.status === 405 || response.status === 403) {
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Range: 'bytes=0-512',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      });
      const alive = getResponse.ok || getResponse.status === 206;
      probeCache.set(url, { alive, probedAt: Date.now() });
      return alive;
    }

    const alive = response.ok;
    probeCache.set(url, { alive, probedAt: Date.now() });
    return alive;
  } catch {
    probeCache.set(url, { alive: false, probedAt: Date.now() });
    return false;
  }
}

// Clean probe cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of probeCache) {
    if (now - value.probedAt > PROBE_CACHE_TTL_MS) probeCache.delete(key);
  }
}, 5 * 60 * 1000);

// ---------------------------------------------------------------------------

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

const MAX_CANDIDATES_PER_CHANNEL = 6;

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
      if (resolved.length >= MAX_CANDIDATES_PER_CHANNEL) return resolved;
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
      if (resolved.length >= MAX_CANDIDATES_PER_CHANNEL) return resolved;
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

/**
 * Probe an array of stream sources concurrently and return only the live ones.
 * Probes run in parallel with a concurrency of 4 for speed.
 */
async function filterLiveSources(sources: StreamSource[]): Promise<StreamSource[]> {
  if (sources.length === 0) return [];

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const alive = await probeStreamUrl(source.url);
      return { source, alive };
    })
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<{ source: StreamSource; alive: boolean }> =>
        r.status === 'fulfilled' && r.value.alive
    )
    .map((r) => r.value.source)
    .map((source, index) => ({
      ...source,
      isBackup: index > 0,
    }));
}

export async function buildChannelsFromIptvOrg(): Promise<Channel[]> {
  const { streams, logos } = await loadIptvData();

  const channelPromises = CHANNEL_CATALOG.map(async (entry) => {
    const rawSources = resolveStreamsForIds(streams, entry.iptvIds, entry.titleFallbacks);
    const logoUrl = resolveLogo(logos, entry.iptvIds);

    // Probe each candidate and keep only reachable ones
    const liveSources = await filterLiveSources(rawSources);

    return {
      id: entry.id,
      name: entry.name,
      category: entry.category,
      logoUrl: logoUrl ?? '',
      sources: liveSources,
    };
  });

  // Resolve all channel probes concurrently
  return Promise.all(channelPromises);
}
