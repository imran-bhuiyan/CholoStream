import { NextResponse } from 'next/server';
import { buildChannelsFromIptvOrg } from '@/lib/iptvOrg';

// force-dynamic: run only on request (never at build time).
// The CDN caches the response for 2 minutes via Cache-Control s-maxage,
// so repeated page loads are served instantly from the edge.
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const channels = await buildChannelsFromIptvOrg();

    return NextResponse.json(
      { channels, source: 'iptv-org' },
      {
        headers: {
          'Cache-Control': 's-maxage=120, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message, channels: [] }, { status: 502 });
  }
}
