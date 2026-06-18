'use client';

import { useQuery } from '@tanstack/react-query';
import type { Channel } from '@/types/stream';

interface ChannelsResponse {
  channels: Channel[];
  source?: string;
  error?: string;
}

async function fetchChannels(): Promise<Channel[]> {
  const response = await fetch('/api/channels');
  const data = (await response.json()) as ChannelsResponse;

  if (!response.ok || !data.channels?.length) {
    throw new Error(data.error || 'No live channels available from iptv-org');
  }

  return data.channels;
}

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
}
