'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MATCH_SCHEDULE } from '@/data/worldCup2026Schedule';
import type { Channel } from '@/types/stream';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChannelGrid from '@/components/dashboard/ChannelGrid';
import UnifiedPlayer from '@/components/video/UnifiedPlayer';
import LiveScores from '@/components/LiveScores';
import MatchScheduleList from '@/components/schedule/MatchScheduleList';
import { useChannels } from '@/hooks/useChannels';
import { Radio, RefreshCw, SkipForward } from 'lucide-react';
import { PlayerSkeleton, ChannelSkeleton, ScoresSkeleton, ScheduleSkeleton } from '@/components/ui/Skeleton';

export default function Home() {
  const { data: channels = [], isLoading, isError, error, refetch, isFetching } = useChannels();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [skipToast, setSkipToast] = useState<string | null>(null);

  // Auto-select first channel that has working sources
  useEffect(() => {
    if (!channels.length) return;
    const hasCurrent = selectedChannelId && channels.some((c: Channel) => c.id === selectedChannelId);
    if (!hasCurrent) {
      const firstLive = channels.find((c: Channel) => c.sources.length > 0);
      const timeoutId = setTimeout(() => {
        setSelectedChannelId(firstLive?.id ?? channels[0]?.id ?? null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [channels, selectedChannelId]);

  const activeChannel = useMemo(() => {
    if (!channels.length) return null;
    return channels.find((c: Channel) => c.id === selectedChannelId) || channels[0];
  }, [channels, selectedChannelId]);

  const handleSelectChannel = (channelId: string) => {
    if (channels.some((c: Channel) => c.id === channelId)) {
      setSelectedChannelId(channelId);
    }
  };

  // Auto-skip to next channel with working sources when current channel fails
  const handleSourcesExhausted = useCallback(() => {
    if (!channels.length || !activeChannel) return;

    const currentIndex = channels.findIndex((c: Channel) => c.id === activeChannel.id);
    for (let i = 1; i < channels.length; i++) {
      const nextIndex = (currentIndex + i) % channels.length;
      const next = channels[nextIndex];
      if (next.sources.length > 0) {
        setSkipToast(`"${activeChannel.name}" is offline. Switching to "${next.name}"...`);
        setSelectedChannelId(next.id);
        setTimeout(() => setSkipToast(null), 4000);
        return;
      }
    }
    setSkipToast('All channels are currently offline.');
    setTimeout(() => setSkipToast(null), 5000);
  }, [channels, activeChannel]);

  const sidebarSlot = isLoading ? (
    <ChannelSkeleton />
  ) : isError ? (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 space-y-3">
      <p className="font-body-md text-body-md text-error">
        {error instanceof Error ? error.message : 'Failed to load channels'}
      </p>
      <button
        onClick={() => refetch()}
        className="flex items-center space-x-2 text-sm font-bold text-secondary-fixed hover:text-secondary-fixed-dim transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Retry</span>
      </button>
    </div>
  ) : (
    <ChannelGrid
      channels={channels}
      selectedChannelId={selectedChannelId ?? channels[0]?.id ?? ''}
      onSelectChannel={handleSelectChannel}
    />
  );

  const isActiveChannelOnline = activeChannel && activeChannel.sources.length > 0;

  const playerSlot = activeChannel && isActiveChannelOnline ? (
    <UnifiedPlayer
      key={activeChannel.id}
      sources={activeChannel.sources}
      channelName={activeChannel.name}
      onAllSourcesExhausted={handleSourcesExhausted}
    />
  ) : activeChannel && !isActiveChannelOnline ? (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-outline">
        <Radio className="h-7 w-7 text-on-surface-variant" />
      </div>
      <div className="space-y-1">
        <h3 className="font-headline-lg text-headline-lg text-on-surface uppercase">{activeChannel.name}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">This channel is currently offline.</p>
      </div>
      <button
        onClick={handleSourcesExhausted}
        className="flex items-center space-x-2 px-4 py-2 bg-secondary-fixed hover:bg-secondary-fixed-dim text-on-secondary-fixed rounded-lg transition-colors font-medium text-sm"
      >
        <SkipForward className="h-4 w-4" />
        <span>Skip to Next Channel</span>
      </button>
    </div>
  ) : isFetching ? (
    <PlayerSkeleton />
  ) : (
    <div className="flex items-center justify-center h-full min-h-[300px] text-on-surface-variant font-body-md text-body-md">
      Select a channel to start streaming
    </div>
  );

  const scoresSlot = isLoading ? (
    <ScoresSkeleton />
  ) : channels.length > 0 ? (
    <LiveScores
      matches={MATCH_SCHEDULE}
      channels={channels}
      onSelectChannel={handleSelectChannel}
    />
  ) : null;

  const scheduleSlot = isLoading ? (
    <ScheduleSkeleton />
  ) : channels.length > 0 ? (
    <MatchScheduleList
      matches={MATCH_SCHEDULE}
      channels={channels}
      onSelectChannel={handleSelectChannel}
    />
  ) : null;

  return (
    <div className="min-h-screen bg-background text-on-background">
      <DashboardLayout
        sidebar={sidebarSlot}
        player={playerSlot}
        scores={scoresSlot}
        schedule={scheduleSlot}
      />

      {/* Auto-skip toast notification */}
      {skipToast && (
        <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-surface-container-high/95 backdrop-blur-md border border-secondary-fixed/30 text-on-surface px-5 py-3 rounded-xl flex items-center space-x-3 shadow-2xl animate-fade-in max-w-md">
          <SkipForward className="h-5 w-5 text-secondary-fixed flex-shrink-0" />
          <span className="font-body-md text-body-md">{skipToast}</span>
        </div>
      )}
    </div>
  );
}
