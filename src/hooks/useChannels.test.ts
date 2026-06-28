import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchChannels } from './useChannels';

// Mock the global fetch
const globalFetchMock = vi.fn();

describe('fetchChannels', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', globalFetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and return channels on success', async () => {
    const mockChannels = [
      { id: '1', name: 'Channel 1', url: 'http://test.com/stream1' },
      { id: '2', name: 'Channel 2', url: 'http://test.com/stream2' }
    ];

    globalFetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ channels: mockChannels })
    });

    const result = await fetchChannels();

    expect(globalFetchMock).toHaveBeenCalledWith('/api/channels');
    expect(result).toEqual(mockChannels);
  });

  it('should throw an error if the response is not ok', async () => {
    globalFetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Custom API Error' })
    });

    await expect(fetchChannels()).rejects.toThrow('Custom API Error');
  });

  it('should throw a default error if response is not ok and no custom error is provided', async () => {
    globalFetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    await expect(fetchChannels()).rejects.toThrow('Failed to load channels from iptv-org');
  });

  it('should throw an error if the channels array is missing', async () => {
    globalFetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    await expect(fetchChannels()).rejects.toThrow('No channels returned from iptv-org');
  });

  it('should throw an error if the channels array is empty', async () => {
    globalFetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ channels: [] })
    });

    await expect(fetchChannels()).rejects.toThrow('No channels returned from iptv-org');
  });
});
