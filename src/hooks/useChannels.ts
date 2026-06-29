'use client';

import { useQuery } from '@tanstack/react-query';
import type { Channel } from '@/types/stream';

interface ChannelsResponse {
  channels: Channel[];
  source?: string;
  error?: string;
}

export async function fetchChannels(): Promise<Channel[]> {
  const response = await fetch('/api/channels');
  const data = (await response.json()) as ChannelsResponse;

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load channels from iptv-org');
  }

  if (!data.channels || data.channels.length === 0) {
    throw new Error('No channels returned from iptv-org');
  }

  return data.channels;
}

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
    staleTime: 10 * 1000,
    gcTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
