import { NextRequest, NextResponse } from 'next/server';

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

    const origin = new URL(request.url).origin;

    if (isManifest) {
      const text = await response.text();
      const lines = text.split('\n');
      const baseUrl = response.url || safeTargetUrl.href;

      const rewrittenLines = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          return line;
        }
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
