import { NextRequest, NextResponse } from 'next/server';

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

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^\[?::1\]?$/i,
  /^0\.0\.0\.0$/,
];

function isSafeTargetUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    const isPrivateHost = PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname));

    if (!isHttp || isPrivateHost) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

const STREAM_FETCH_TIMEOUT_MS = 15000;

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Next.js 16 changed the request object, 'ip' is removed from NextRequest directly.
  // We'll rely on standard headers, but securely fetch the *last* IP in the chain (closest to the proxy) instead of the first (which is easily spoofed by the client).
  const forwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  // In a chain like "client-spoofed-ip, intermediate-proxy, edge-proxy", the rightmost is appended by the edge proxy we trust.
  const clientIp = xRealIp || (forwardedFor ? forwardedFor.split(',').pop()?.trim() || 'unknown' : 'unknown');

  if (!checkRateLimit(clientIp)) {
    return new NextResponse('Rate limit exceeded. Try again later.', {
      status: 429,
      headers: { ...CORS_HEADERS, 'Retry-After': '60' },
    });
  }

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  const safeTargetUrl = isSafeTargetUrl(targetUrl);

  if (!safeTargetUrl) {
    return new NextResponse('Unsupported or disallowed stream URL', {
      status: 400,
      headers: CORS_HEADERS,
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
      redirect: 'follow',
      signal: AbortSignal.timeout(STREAM_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return new NextResponse(`Proxy fetch failed: ${response.statusText}`, {
        status: response.status,
        headers: CORS_HEADERS,
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
              if (isSafeTargetUrl(absoluteUrl)) {
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
          return isSafeTargetUrl(absoluteUrl)
            ? `${origin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`
            : line;
        } catch {
          return line;
        }
      });

      return new NextResponse(rewrittenLines.join('\n'), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
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
        ...CORS_HEADERS,
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
      headers: CORS_HEADERS,
    });
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      'Access-Control-Max-Age': '86400',
    },
  });
}
