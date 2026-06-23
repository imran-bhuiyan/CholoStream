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
import { Info, Radio, RefreshCw, SkipForward } from 'lucide-react';
import { PlayerSkeleton, ChannelSkeleton, ScoresSkeleton, ScheduleSkeleton } from '@/components/ui/Skeleton';

export default function Home() {
  const { data: channels = [], isLoading, isError, error, refetch, isFetching } = useChannels();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [skipToast, setSkipToast] = useState<string | null>(null);

  // Auto-select first channel that has working sources
  useEffect(() => {
    if (!channels.length) return;
    const hasCurrent = selectedChannelId && channels.some((c) => c.id === selectedChannelId);
    if (!hasCurrent) {
      const firstLive = channels.find((c) => c.sources.length > 0);
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

    const currentIndex = channels.findIndex((c) => c.id === activeChannel.id);
    // Find the next channel with sources, wrapping around
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
    // No channels with sources found
    setSkipToast('All channels are currently offline.');
    setTimeout(() => setSkipToast(null), 5000);
  }, [channels, activeChannel]);

  const sidebarSlot = isLoading ? (
    <ChannelSkeleton />
  ) : isError ? (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 space-y-3">
      <p className="text-xs text-rose-400 font-semibold">
        {error instanceof Error ? error.message : 'Failed to load channels'}
      </p>
      <button
        onClick={() => refetch()}
        className="flex items-center space-x-2 text-xs font-bold text-violet-400 hover:text-violet-300"
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
      <div className="w-16 h-16 rounded-full bg-slate-800/60 flex items-center justify-center border border-slate-700">
        <Radio className="h-7 w-7 text-slate-500" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-300">{activeChannel.name}</h3>
        <p className="text-sm text-slate-500">This channel is currently offline. No working streams found.</p>
      </div>
      <button
        onClick={handleSourcesExhausted}
        className="flex items-center space-x-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-violet-600/30"
      >
        <SkipForward className="h-4 w-4" />
        <span>Skip to Next Channel</span>
      </button>
    </div>
  ) : isFetching ? (
    <PlayerSkeleton />
  ) : (
    <div className="flex items-center justify-center h-full min-h-[300px] text-slate-500 text-sm">
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
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-slate-100">
      <header className="h-16 border-b border-white/5 bg-[#090a0f]/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-violet-600/10 p-2 rounded-xl border border-violet-500/25 flex items-center justify-center">
            <Radio className="h-5 w-5 text-violet-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-extrabold text-slate-100 tracking-wide flex items-center space-x-2">
              <span className="font-extrabold text-lg text-slate-100 tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                CholoStream
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
              Live IPTV · iptv-org
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-3 text-xs text-slate-400 font-semibold bg-[#11131a] px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
          <Info className="h-4 w-4 text-violet-400" />
          <span>H.264 Fallback & Audio Repair Enabled</span>
        </div>
      </header>

      <div className="flex-1">
        <DashboardLayout
          sidebar={sidebarSlot}
          player={playerSlot}
          scores={scoresSlot}
          schedule={scheduleSlot}
        />
      </div>
      {/* Auto-skip toast notification */}
      {skipToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md border border-violet-500/30 text-slate-200 px-5 py-3 rounded-xl flex items-center space-x-3 shadow-2xl animate-fade-in max-w-md">
          <SkipForward className="h-5 w-5 text-violet-400 flex-shrink-0" />
          <span className="text-sm font-semibold">{skipToast}</span>
        </div>
      )}
    </div>
  );
}
