'use client';

import React, { useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import type { MatchSchedule as MatchScheduleType, Channel } from '@/types/stream';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Calendar, Search, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { getTeamFlag } from '../LiveScores';

interface MatchScheduleListProps {
  matches: MatchScheduleType[];
  channels: Channel[];
  onSelectChannel: (channelId: string) => void;
}

export default function MatchScheduleList({
  matches,
  channels,
  onSelectChannel
}: MatchScheduleListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'FINISHED' | 'UPCOMING'>('ALL');

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const homeTeam = match.homeTeam ?? '';
      const awayTeam = match.awayTeam ?? '';
      const matchesSearch = 
        homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        awayTeam.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        statusFilter === 'ALL' || 
        match.status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [matches, searchQuery, statusFilter]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredMatches.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 10,
  });

  const channelMap = useMemo(() => {
    const map = new Map<string, string>();
    channels.forEach(c => map.set(c.id, c.name));
    return map;
  }, [channels]);

  const getChannelName = (channelId?: string) => {
    if (!channelId) return 'N/A';
    return channelMap.get(channelId) || 'Sport TV';
  };

  const getStatusBadge = (status: MatchScheduleType['status']) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="flex items-center space-x-1.5 text-[10px] font-extrabold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/25 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>LIVE</span>
          </span>
        );
      case 'FINISHED':
        return (
          <span className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 bg-slate-800/30 px-2 py-0.5 rounded border border-slate-700">
            <CheckCircle2 className="h-3 w-3 text-slate-500" />
            <span>FINISHED</span>
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Calendar className="h-3 w-3 text-amber-400" />
            <span>UPCOMING</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      
      {/* Header and Filter Tabs */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2 text-slate-200">
          <Calendar className="h-4.5 w-4.5 text-secondary-fixed" />
          <h3 className="text-xs font-bold uppercase tracking-wider">World Cup 2026 Schedule</h3>
        </div>

        {/* Filters */}
        <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant overflow-x-auto scrollbar-none">
          {(['ALL', 'LIVE', 'UPCOMING', 'FINISHED'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`
                flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-150 whitespace-nowrap
                ${statusFilter === filter 
                  ? 'bg-secondary-fixed text-on-secondary-fixed shadow-md' 
                  : 'text-on-surface-variant hover:text-on-surface'
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Row Search */}
      <div className="relative my-3">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-650" />
        <input
          type="text"
          placeholder="Filter matches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container/60 border border-outline-variant rounded-xl py-2 pl-9 pr-4 text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-secondary-fixed/50 transition-colors"
        />
      </div>

      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto no-scrollbar rounded-xl min-h-0 mt-2"
        style={{ height: '400px' }}
      >
        {filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <AlertCircle className="h-8 w-8 text-on-surface-variant mb-2 opacity-40" />
            <p className="text-sm text-on-surface-variant font-semibold">No scheduled items matching filter</p>
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const match = filteredMatches[virtualRow.index];
              if (!match) return null;

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="px-4 flex items-center hover:bg-white/5 border-b border-white/5 transition-colors duration-150"
                >
                  <div className="w-full flex items-center justify-between animate-fade-in-up py-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {/* Status Badge */}
                      <div className="w-20 flex-shrink-0">
                        {getStatusBadge(match.status)}
                      </div>

                      {/* Match detail matchup */}
                      <div className="flex flex-col truncate min-w-0">
                        <div className="flex items-center space-x-1.5 truncate">
                          <Image src={getTeamFlag(match.homeTeam)} alt={match.homeTeam} width={16} height={16} unoptimized className="w-4 h-4 object-contain" />
                          <span className="text-sm font-semibold text-on-surface truncate">{match.homeTeam}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 truncate mt-1">
                          <Image src={getTeamFlag(match.awayTeam)} alt={match.awayTeam} width={16} height={16} unoptimized className="w-4 h-4 object-contain" />
                          <span className="text-sm font-semibold text-on-surface truncate">{match.awayTeam}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-on-surface-variant truncate mt-1.5">
                          {match.group} · {match.venue}
                        </span>
                      </div>
                    </div>

                    {/* Actions / Scores details */}
                    <div className="flex items-center space-x-4">
                      <div className="text-right min-w-[65px]">
                        {match.status === 'LIVE' || match.status === 'FINISHED' ? (
                          <span className="font-stats-number text-xs font-bold text-on-surface bg-surface-container border border-outline-variant px-2.5 py-1 rounded">
                            {match.score?.home ?? 0} - {match.score?.away ?? 0}
                          </span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-on-surface-variant font-mono">
                              {match.date?.slice(5).replace('-', '/')}
                            </span>
                            <span className="text-[10px] font-bold text-on-surface-variant font-mono">
                              {match.time}
                            </span>
                          </div>
                        )}
                      </div>

                      {match.channelId ? (
                        <button
                          onClick={() => onSelectChannel(match.channelId!)}
                          className="p-2 bg-secondary-fixed/5 hover:bg-secondary-fixed/20 border border-secondary-fixed/20 hover:border-secondary-fixed/40 rounded-lg text-secondary-fixed transition-all flex-shrink-0"
                          title={`Tune into ${getChannelName(match.channelId)}`}
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                        </button>
                      ) : (
                        <div className="w-8 h-8 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
