'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MATCH_SCHEDULE } from '@/data/mockChannels';
import type { Channel } from '@/types/stream';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChannelGrid from '@/components/dashboard/ChannelGrid';
import UnifiedPlayer from '@/components/video/UnifiedPlayer';
import LiveScores from '@/components/LiveScores';
import MatchScheduleList from '@/components/schedule/MatchScheduleList';
import { useChannels } from '@/hooks/useChannels';
import { Info, Loader2, Radio, RefreshCw } from 'lucide-react';

export default function Home() {
  const { data: channels = [], isLoading, isError, error, refetch, isFetching } = useChannels();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  useEffect(() => {
    if (!channels.length) return;
    const hasCurrent = selectedChannelId && channels.some((c) => c.id === selectedChannelId);
    if (!hasCurrent) {
      const timeoutId = setTimeout(() => {
        setSelectedChannelId(channels[0]?.id ?? null);
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

  const sidebarSlot = isLoading ? (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500 space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      <p className="text-xs font-semibold">Loading channels from iptv-org…</p>
    </div>
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

  const playerSlot = activeChannel ? (
    <UnifiedPlayer
      key={activeChannel.id}
      sources={activeChannel.sources}
      channelName={activeChannel.name}
    />
  ) : (
    <div className="flex items-center justify-center h-full min-h-[300px] text-slate-500 text-sm">
      {isFetching ? 'Refreshing channel list…' : 'Select a channel to start streaming'}
    </div>
  );

  const scoresSlot = channels.length > 0 ? (
    <LiveScores
      matches={MATCH_SCHEDULE}
      channels={channels}
      onSelectChannel={handleSelectChannel}
    />
  ) : null;

  const scheduleSlot = channels.length > 0 ? (
    <MatchScheduleList
      matches={MATCH_SCHEDULE}
      channels={channels}
      onSelectChannel={handleSelectChannel}
    />
  ) : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#06070a] text-slate-100">
      <header className="h-16 border-b border-slate-800/60 bg-[#08090d]/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
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

        <div className="hidden md:flex items-center space-x-3 text-xs text-slate-400 font-semibold bg-[#121620]/60 px-3 py-1.5 rounded-xl border border-slate-800/60">
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
    </div>
  );
}
