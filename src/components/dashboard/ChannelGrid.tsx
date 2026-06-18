'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Channel, StreamSource } from '@/types/stream';
import { Search, Star, Tv, Award, Radio, Film, Globe } from 'lucide-react';
import ChannelLogo from './ChannelLogo';

interface ChannelGridProps {
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
}

export default function ChannelGrid({
  channels,
  selectedChannelId,
  onSelectChannel
}: ChannelGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Safe localStorage reading on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cholostream_favorites');
      if (stored) {
        queueMicrotask(() => setFavorites(JSON.parse(stored)));
      }
    } catch (e) {
      console.warn('Could not load favorites from localStorage', e);
    }
  }, []);

  const toggleFavorite = (channelId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection click
    const nextFavorites = favorites.includes(channelId)
      ? favorites.filter(id => id !== channelId)
      : [...favorites, channelId];
    
    setFavorites(nextFavorites);
    try {
      localStorage.setItem('cholostream_favorites', JSON.stringify(nextFavorites));
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['All', 'Sports', 'News', 'Entertainment', 'International'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sports':
        return <Award className="h-4 w-4 text-violet-400" />;
      case 'News':
        return <Radio className="h-4 w-4 text-blue-450" />;
      case 'Entertainment':
        return <Film className="h-4 w-4 text-emerald-450" />;
      case 'International':
        return <Globe className="h-4 w-4 text-cyan-400" />;
      default:
        return <Tv className="h-4 w-4 text-slate-400" />;
    }
  };

  // Filter channels based on query & category
  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [channels, searchQuery, activeCategory]);

  // Separate starred channels that match the current filters
  const { starred, unstarred } = useMemo(() => {
    const starredList: Channel[] = [];
    const unstarredList: Channel[] = [];

    filteredChannels.forEach(channel => {
      if (favorites.includes(channel.id)) {
        starredList.push(channel);
      } else {
        unstarredList.push(channel);
      }
    });

    return {
      starred: starredList,
      unstarred: unstarredList
    };
  }, [filteredChannels, favorites]);

  return (
    <div className="space-y-6 flex flex-col h-full bg-[#0a0c10] p-4 rounded-2xl border border-slate-850">
      
      {/* Controls: Search and Categories */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-550" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121620] border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-550/40"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                flex items-center space-x-1 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap transition-all duration-200
                ${activeCategory === category 
                  ? 'bg-violet-650 text-white shadow-md border border-violet-550/30' 
                  : 'bg-[#121620] text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700/50'
                }
              `}
            >
              {category !== 'All' && getCategoryIcon(category)}
              <span>{category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Starred Bubbled Section */}
      {starred.length > 0 && (
        <div className="space-y-2.5 animate-fade-in">
          <div className="flex items-center space-x-1 text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Favorites / Starred</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            {starred.map((channel) => {
              const isSelected = channel.id === selectedChannelId;
              
              return (
                <div
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={`
                    flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all duration-250 select-none relative overflow-hidden group
                    ${isSelected 
                      ? 'bg-violet-600/10 border-violet-550/45 text-white shadow-lg shadow-violet-650/5' 
                      : 'bg-[#121620]/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <ChannelLogo channel={channel} size={32} className="rounded-lg" />
                    <div className="min-w-0">
                      <h5 className="text-[11px] font-bold truncate pr-3">{channel.name}</h5>
                      <span className="text-[9px] text-slate-500 font-semibold">{channel.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(channel.id, e)}
                    className="p-1 hover:bg-slate-850 rounded text-amber-400 hover:text-amber-500 transition-colors z-10"
                    aria-label="Remove from favorites"
                  >
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </button>
                  
                  {isSelected && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-tl-lg" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Channels list grid */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Channels List</h4>
        {unstarred.length === 0 && starred.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Tv className="h-8 w-8 text-slate-700 mb-2" />
            <p className="text-xs text-slate-500">No channels found</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {unstarred.map((channel) => {
              const isSelected = channel.id === selectedChannelId;
              const hasHEVC = channel.sources.some((s: StreamSource) => s.codec === 'HEVC');
              const hasMPEGTS = channel.sources.some((s: StreamSource) => s.codec === 'MPEGTS');
              
              return (
                <div
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 group text-left select-none relative overflow-hidden
                    ${isSelected 
                      ? 'bg-violet-600/10 border-violet-550/30 text-white shadow-lg shadow-violet-650/5' 
                      : 'bg-[#121620]/30 border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <ChannelLogo channel={channel} size={36} className="rounded-xl" />
                      {isSelected && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a0c10] rounded-full" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-slate-100 font-bold' : 'text-slate-350'}`}>
                        {channel.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        {channel.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Technical badges */}
                    <div className="flex flex-col items-end space-y-0.5">
                      {hasHEVC && (
                        <span className="text-[8px] font-black text-amber-400/90 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/10">
                          HEVC
                        </span>
                      )}
                      {hasMPEGTS && (
                        <span className="text-[8px] font-black text-cyan-400/90 bg-cyan-500/10 px-1 py-0.5 rounded border border-cyan-500/10">
                          TS
                        </span>
                      )}
                    </div>

                    {/* Star favorite toggle */}
                    <button
                      onClick={(e) => toggleFavorite(channel.id, e)}
                      className="p-1 hover:bg-slate-850 rounded text-slate-650 hover:text-amber-400 transition-colors"
                      aria-label="Add to favorites"
                    >
                      <Star className="h-3.5 w-3.5 hover:scale-105 transition-transform" />
                    </button>
                  </div>
                  
                  {isSelected && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-tl-lg" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
