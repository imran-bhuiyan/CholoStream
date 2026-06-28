'use client';

import React from 'react';
import type { Channel } from '@/types/stream';
import { Search, Star, Tv, Award, Radio, Film, Globe } from 'lucide-react';
import { useChannelFilters } from '@/hooks/useChannelFilters';
import ChannelCard from './ChannelCard';

interface ChannelGridProps {
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
}

const CATEGORIES = ['All', 'Sports', 'News', 'Entertainment', 'International'];

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

  return (
    <div className="space-y-6 flex flex-col h-full w-full">
      
      {/* Controls: Search and Categories */}
      <div className="space-y-4 sticky top-0 z-20 bg-black/95 backdrop-blur-md pt-2 pb-3 -mx-2 px-2 rounded-xl">
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
          {CATEGORIES.map((category) => (
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
            {starred.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isSelected={channel.id === selectedChannelId}
                onSelect={onSelectChannel}
                onToggleFavorite={toggleFavorite}
                variant="compact"
              />
            ))}
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
        )}
      </div>
    </div>
  );
}
