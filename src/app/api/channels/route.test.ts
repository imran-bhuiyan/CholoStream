import { Channel } from '@/types/stream';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { buildChannelsFromIptvOrg } from '@/lib/iptvOrg';

vi.mock('@/lib/iptvOrg', () => ({
  buildChannelsFromIptvOrg: vi.fn(),
}));

describe('GET /api/channels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return channels and appropriate cache headers successfully', async () => {
    const mockChannels = [
      { id: 'channel-1', name: 'Channel 1' },
      { id: 'channel-2', name: 'Channel 2' },
    ];
    vi.mocked(buildChannelsFromIptvOrg).mockResolvedValue(mockChannels as unknown as Channel[]);

    const response = await GET();

    // Assert status
    expect(response.status).toBe(200);

    // Assert cache headers
    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toBe('s-maxage=120, stale-while-revalidate=300');

    // Assert JSON body
    const json = await response.json();
    expect(json).toEqual({
      channels: mockChannels,
      source: 'iptv-org',
    });
  });

  it('should handle errors thrown by buildChannelsFromIptvOrg and return 502 status', async () => {
    vi.mocked(buildChannelsFromIptvOrg).mockRejectedValue(new Error('Failed to fetch from iptv-org'));

    const response = await GET();

    // Assert status
    expect(response.status).toBe(502);

    // Assert JSON body matches expected error structure
    const json = await response.json();
    expect(json).toEqual({
      error: 'Failed to fetch from iptv-org',
      channels: [],
    });
  });

  it('should handle unknown errors thrown by buildChannelsFromIptvOrg', async () => {
    vi.mocked(buildChannelsFromIptvOrg).mockRejectedValue('String error, not an Error instance');

    const response = await GET();

    // Assert status
    expect(response.status).toBe(502);

    // Assert JSON body matches expected error structure with fallback message
    const json = await response.json();
    expect(json).toEqual({
      error: 'Unknown error',
      channels: [],
    });
  });
});
