import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns';
import net from 'node:net';
import ipaddr from 'ipaddr.js';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetAt) rateLimitMap.delete(key);
  }
}, 60_000);

function isSafeIP(ipStr: string): boolean {
  try {
    const addr = ipaddr.process(ipStr);
    const range = addr.range();
    if (range === 'unicast') return true;
    if (range === 'ipv4Mapped') {
      const ipv4 = (addr as ipaddr.IPv6).toIPv4Address();
      return ipv4.range() === 'unicast';
    }
    return false;
  } catch {
    return false;
  }
}

function isSafeTargetUrlSync(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    if (url.hostname === 'localhost' || url.hostname === 'host.docker.internal') {
      return null;
    }

    if (net.isIP(url.hostname) && !isSafeIP(url.hostname)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

async function getSafeTargetUrlAsync(value: string): Promise<URL | null> {
  const url = isSafeTargetUrlSync(value);
  if (!url) return null;

  try {
    const hostnameToLookup = url.hostname.startsWith('[') && url.hostname.endsWith(']')
      ? url.hostname.slice(1, -1)
      : url.hostname;

    const lookup = await dns.promises.lookup(hostnameToLookup);
    if (!isSafeIP(lookup.address)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Range',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };

  const origin = request.headers.get('origin');

  // Allow same-origin, localhost, and vercel deployments
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const isLocalhost = originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
      const isVercel = originUrl.hostname.endsWith('.vercel.app');

      // Also allow if it matches the current host
      const host = request.headers.get('host');
      const isSameHost = host && originUrl.host === host;

      if (isLocalhost || isVercel || isSameHost) {
        headers['Access-Control-Allow-Origin'] = origin;
      }
    } catch {
      // Ignore invalid origins
    }
  }

  return headers;
}

const STREAM_FETCH_TIMEOUT_MS = 15000;

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Next.js 16 changed the request object, 'ip' is removed from NextRequest directly.
  // We'll rely on standard headers, but securely fetch the *last* IP in the chain (closest to the proxy) instead of the first (which is easily spoofed by the client).
  const forwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  // In a chain like "client-spoofed-ip, intermediate-proxy, edge-proxy", the rightmost is appended by the edge proxy we trust.
  const clientIp = xRealIp || (forwardedFor ? forwardedFor.split(',').pop()?.trim() || 'unknown' : 'unknown');
  const corsHeaders = getCorsHeaders(request);
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (!checkRateLimit(clientIp)) {
    return new NextResponse('Rate limit exceeded. Try again later.', {
      status: 429,
      headers: { ...corsHeaders, 'Retry-After': '60' },
    });
  }

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  const safeTargetUrl = await getSafeTargetUrlAsync(targetUrl);

  if (!safeTargetUrl) {
    return new NextResponse('Unsupported or disallowed stream URL', {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const requestHeaders = new Headers({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const range = request.headers.get('range');

    if (range) {
      requestHeaders.set('Range', range);
    }

    const response = await fetch(safeTargetUrl, {
      headers: {
        ...Object.fromEntries(requestHeaders),
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(STREAM_FETCH_TIMEOUT_MS),
    });

    // Handle redirects manually to prevent SSRF via redirect
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
         return new NextResponse('Redirect missing location', { status: 502 });
      }

      const absoluteLocation = new URL(location, safeTargetUrl.href).href;
      if (!(await getSafeTargetUrlAsync(absoluteLocation))) {
         return new NextResponse('Redirect to unsafe target', { status: 403 });
      }

      // Instead of recursively fetching, return 302 to the client to let them handle the redirect via proxy
      return NextResponse.redirect(`${new URL(request.url).origin}/api/proxy?url=${encodeURIComponent(absoluteLocation)}`, {
         status: 302,
         headers: CORS_HEADERS
      });
    }

    if (!response.ok) {
      return new NextResponse(`Proxy fetch failed: ${response.statusText}`, {
        status: response.status,
        headers: corsHeaders,
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const isManifest =
      safeTargetUrl.pathname.includes('.m3u8') ||
      contentType.includes('mpegurl') ||
      contentType.includes('application/x-mpegURL') ||
      contentType.includes('audio/mpegurl');

    const isBinaryChunk =
      safeTargetUrl.pathname.endsWith('.ts') ||
      safeTargetUrl.pathname.endsWith('.m4s') ||
      safeTargetUrl.pathname.endsWith('.mp4') ||
      contentType.includes('video/mp2t');

    // Bypass proxy for binary video chunks to prevent execution timeouts
    if (!isManifest && isBinaryChunk) {
      return NextResponse.redirect(safeTargetUrl.href, { status: 302 });
    }

    const origin = new URL(request.url).origin;

    if (isManifest) {
      const text = await response.text();
      const lines = text.split('\n');
      const baseUrl = response.url || safeTargetUrl.href;

      const rewrittenLines = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return line;
        }

        // Rewrite inline URI values in tags like #EXT-X-KEY or #EXT-X-MEDIA
        if (trimmed.startsWith('#EXT-X-')) {
          return trimmed.replace(/(URI=")([^"]+)(")/gi, (match, p1, p2, p3) => {
            try {
              const absoluteUrl = new URL(p2, baseUrl).href;
              if (isSafeTargetUrlSync(absoluteUrl)) {
                return `${p1}${origin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}${p3}`;
              }
            } catch {
              // ignore invalid url
            }
            return match;
          });
        }

        if (trimmed.startsWith('#')) {
          return line;
        }

        // Rewrite segment/track URLs
        try {
          const absoluteUrl = new URL(trimmed, baseUrl).href;
          return isSafeTargetUrlSync(absoluteUrl)
            ? `${origin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`
            : line;
        } catch {
          return line;
        }
      });

      return new NextResponse(rewrittenLines.join('\n'), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType || 'application/vnd.apple.mpegurl',
        },
      });
    }

    if (!response.body) {
      return new NextResponse('Empty stream body from source', { status: 502 });
    }

    return new NextResponse(response.body as unknown as ReadableStream, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType || 'application/octet-stream',
        ...(response.headers.get('content-length')
          ? { 'Content-Length': response.headers.get('content-length') as string }
          : {}),
        ...(response.headers.get('content-range')
          ? { 'Content-Range': response.headers.get('content-range') as string }
          : {}),
        ...(response.headers.get('accept-ranges')
          ? { 'Accept-Ranges': response.headers.get('accept-ranges') as string }
          : {}),
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError';

    return new NextResponse(timedOut ? 'Proxy fetch timed out' : `Proxy error: ${err.message}`, {
      status: timedOut ? 504 : 500,
      headers: corsHeaders,
    });
  }
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400',
    },
  });
}
