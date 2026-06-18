'use client';

import React, { useState, useMemo } from 'react';
import { getValidatedChannels, MATCH_SCHEDULE } from '@/data/mockChannels';
import type { Channel } from '@/types/stream';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChannelGrid from '@/components/dashboard/ChannelGrid';
import UnifiedPlayer from '@/components/video/UnifiedPlayer';
import LiveScores from '@/components/LiveScores';
import MatchScheduleList from '@/components/schedule/MatchScheduleList';
import { Info, Radio } from 'lucide-react';

export default function Home() {
  const [selectedChannelId, setSelectedChannelId] = useState('fifa-wc');

  // Load validated channels data
  const channels = useMemo(() => getValidatedChannels(), []);

  // Find currently selected channel object
  const activeChannel = useMemo(() => {
    return channels.find((c: Channel) => c.id === selectedChannelId) || channels[0];
  }, [channels, selectedChannelId]);

  const handleSelectChannel = (channelId: string) => {
    const channelExists = channels.some((c: Channel) => c.id === channelId);
    if (channelExists) {
      setSelectedChannelId(channelId);
    }
  };

  // 1. Sidebar slot
  const sidebarSlot = (
    <ChannelGrid
      channels={channels}
      selectedChannelId={selectedChannelId}
      onSelectChannel={handleSelectChannel}
    />
  );

  // 2. Player slot
  const playerSlot = (
    <UnifiedPlayer
      key={activeChannel.id}
      sources={activeChannel.sources}
      channelName={activeChannel.name}
    />
  );

  // 3. Scores slot
  const scoresSlot = (
    <LiveScores
      matches={MATCH_SCHEDULE}
      channels={channels}
      onSelectChannel={handleSelectChannel}
    />
  );

  // 4. Schedule slot
  const scheduleSlot = (
    <MatchScheduleList
      matches={MATCH_SCHEDULE}
      channels={channels}
      onSelectChannel={handleSelectChannel}
    />
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#06070a] text-slate-100">
      
      {/* Dashboard Top Navigation bar */}
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
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">High Performance Media Engine</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-3 text-xs text-slate-400 font-semibold bg-[#121620]/60 px-3 py-1.5 rounded-xl border border-slate-800/60">
          <Info className="h-4 w-4 text-violet-400" />
          <span>H.264 Fallback & Audio Repair Enabled</span>
        </div>
      </header>

      {/* Main shell layout layout */}
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
