import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { probeStreamUrl, clearProbeCache } from './iptvOrg';

describe('probeStreamUrl', () => {
  const mockUrl = 'https://example.com/stream.m3u8';

  beforeEach(() => {
    // Clear cache before each test
    clearProbeCache();
    // Reset fetch mock
    global.fetch = vi.fn();
    // Mock Date.now to have predictable cache TTL testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 12, 0, 0)); // Arbitrary starting time
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return true when HEAD request is successful', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    const result = await probeStreamUrl(mockUrl);

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(mockUrl, expect.objectContaining({
      method: 'HEAD',
    }));
  });

  it('should fall back to GET range request if HEAD returns 405', async () => {
    // Mock HEAD failing with 405
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 405,
    } as Response);

    // Mock GET succeeding
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 206, // Partial Content
    } as Response);

    const result = await probeStreamUrl(mockUrl);

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    // Second call should be GET
    expect(vi.mocked(global.fetch).mock.calls[1][1]?.method).toBe('GET');
    expect(vi.mocked(global.fetch).mock.calls[1][1]?.headers).toHaveProperty('Range', 'bytes=0-512');
  });

  it('should fall back to GET range request if HEAD returns 403', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response);

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    const result = await probeStreamUrl(mockUrl);

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should return false if HEAD and fallback GET both fail', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 405,
    } as Response);

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const result = await probeStreamUrl(mockUrl);

    expect(result).toBe(false);
  });

  it('should return false if HEAD returns an error other than 405/403', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const result = await probeStreamUrl(mockUrl);

    expect(result).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Should not try GET fallback
  });

  it('should return false if fetch throws an exception (e.g. timeout or network error)', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    const result = await probeStreamUrl(mockUrl);

    expect(result).toBe(false);
  });

  it('should use cached result if probed recently', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    // First call, should make a fetch
    const result1 = await probeStreamUrl(mockUrl);
    expect(result1).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Advance time by 5 minutes (within the 10 min TTL)
    vi.advanceTimersByTime(5 * 60 * 1000);

    // Second call, should use cache
    const result2 = await probeStreamUrl(mockUrl);
    expect(result2).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, so no new fetch
  });

  it('should refetch if cache TTL has expired', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    // First call
    await probeStreamUrl(mockUrl);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Advance time by 11 minutes (exceeds 10 min TTL)
    vi.advanceTimersByTime(11 * 60 * 1000);

    // Second call
    await probeStreamUrl(mockUrl);
    expect(global.fetch).toHaveBeenCalledTimes(2); // Should have fetched again
  });
});
