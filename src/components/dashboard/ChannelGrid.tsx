'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Channel } from '@/types/stream';
import { Search, Star, Tv, Award, Radio, Film, Globe } from 'lucide-react';
import ChannelCard from './ChannelCard';
import ChannelCarousel from './ChannelCarousel';
import { useDragScroll } from '@/hooks/useDragScroll';

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
  const favoritesDragScroll = useDragScroll();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Safe localStorage reading on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cholostream_favorites');
      if (stored) {
        queueMicrotask(() => setFavorites(JSON.parse(stored)));
      }
    } catch {
      // Silently ignore localStorage errors (e.g., in incognito mode or if disabled)
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
      console.warn('Could not save favorites to localStorage', err);
    }
  };

  // Filter channels based on query
  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      return channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [channels, searchQuery]);

  // Separate starred channels that match the current filters
  const { starred, unstarred } = useMemo(() => {
    const starredList: Channel[] = [];
    const unstarredList: Channel[] = [];

    const favoritesSet = new Set(favorites);
    filteredChannels.forEach(channel => {
      if (favoritesSet.has(channel.id)) {
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

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (e.deltaY === 0) return;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const canScrollRight = e.deltaY > 0 && container.scrollLeft < maxScrollLeft - 1;
    const canScrollLeft = e.deltaY < 0 && container.scrollLeft > 1;

    if (canScrollRight || canScrollLeft) {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full w-full">
      
      {/* Controls: Search */}
      <div className="space-y-4 sticky top-0 z-20 bg-background/95 backdrop-blur-md pt-2 pb-3 -mx-2 px-2 rounded-xl border-b lg:border-none border-white/5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-550" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant rounded-xl py-2 pl-10 pr-4 text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-secondary-fixed/50 transition-colors"
          />
        </div>
      </div>

      {/* Main Channels Section */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pb-20 scrollbar-none">
        
        {/* Starred Bubbled Section (Always top if exists) */}
        {starred.length > 0 && (
          <div className="space-y-2.5 animate-fade-in mb-4">
            <div className="flex items-center space-x-1 text-amber-400 px-1">
              <Star className="h-3.5 w-3.5 fill-current" />
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Favorites</h4>
            </div>
            
            <div
              ref={favoritesDragScroll.ref}
              onMouseDown={favoritesDragScroll.onMouseDown}
              onMouseMove={favoritesDragScroll.onMouseMove}
              onMouseUp={favoritesDragScroll.onMouseUp}
              onMouseLeave={favoritesDragScroll.onMouseLeave}
              onWheel={handleWheel}
              className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 scrollbar-none -mx-2 px-2 md:mx-0 md:px-0 active:cursor-grabbing cursor-grab"
            >
              {starred.map((channel) => (
                <div key={channel.id} className="w-[180px] md:w-[200px] shrink-0 snap-start">
                  <ChannelCard
                    channel={channel}
                    isSelected={channel.id === selectedChannelId}
                    onSelect={onSelectChannel}
                    onToggleFavorite={toggleFavorite}
                    variant="compact"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {unstarred.length === 0 && starred.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Tv className="h-8 w-8 text-slate-700 mb-2" />
            <p className="text-xs text-slate-500">No channels found</p>
          </div>
        ) : (
          /* Render simple list of channels */
          <div className="space-y-2.5 animate-fade-in">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-1">
              {searchQuery ? 'Search Results' : 'All Channels'}
            </h4>
            <div className="space-y-1.5">
              {unstarred.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  isSelected={channel.id === selectedChannelId}
                  onSelect={onSelectChannel}
                  onToggleFavorite={toggleFavorite}
                  variant="default"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
