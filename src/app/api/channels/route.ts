import { NextResponse } from 'next/server';
import { buildChannelsFromIptvOrg } from '@/lib/iptvOrg';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const channels = await buildChannelsFromIptvOrg();

    return NextResponse.json(
      { channels, source: 'iptv-org' },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message, channels: [] }, { status: 502 });
  }
}
