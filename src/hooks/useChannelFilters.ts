import { useState, useEffect, useMemo } from 'react';
import type { Channel } from '@/types/stream';

export function useChannelFilters(channels: Channel[]) {
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
      ? favorites.filter((id) => id !== channelId)
      : [...favorites, channelId];

    setFavorites(nextFavorites);
    try {
      localStorage.setItem('cholostream_favorites', JSON.stringify(nextFavorites));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter channels based on query & category
  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [channels, searchQuery, activeCategory]);

  // Separate starred channels that match the current filters
  const { starred, unstarred } = useMemo(() => {
    const starredList: Channel[] = [];
    const unstarredList: Channel[] = [];

    filteredChannels.forEach((channel) => {
      if (favorites.includes(channel.id)) {
        starredList.push(channel);
      } else {
        unstarredList.push(channel);
      }
    });

    return {
      starred: starredList,
      unstarred: unstarredList,
    };
  }, [filteredChannels, favorites]);

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    favorites,
    toggleFavorite,
    starred,
    unstarred,
  };
}
