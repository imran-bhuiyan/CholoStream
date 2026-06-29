import React from 'react';
import type { Channel } from '@/types/stream';
import ChannelCard from './ChannelCard';
import { Award, Radio, Film, Globe, Tv } from 'lucide-react';
import { useDragScroll } from '@/hooks/useDragScroll';

interface ChannelCarouselProps {
  category: string;
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
  onToggleFavorite: (channelId: string, e: React.MouseEvent) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Sports':
      return <Award className="h-4 w-4 text-secondary-fixed" />;
    case 'News':
      return <Radio className="h-4 w-4 text-sky-400" />;
    case 'Entertainment':
      return <Film className="h-4 w-4 text-emerald-400" />;
    case 'International':
      return <Globe className="h-4 w-4 text-cyan-400" />;
    default:
      return <Tv className="h-4 w-4 text-on-surface-variant" />;
  }
};

export default function ChannelCarousel({
  category,
  channels,
  selectedChannelId,
  onSelectChannel,
  onToggleFavorite
}: ChannelCarouselProps) {
  const dragScroll = useDragScroll();

  if (!channels || channels.length === 0) return null;

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
    <div className="space-y-2.5 animate-fade-in relative select-none">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-1.5 font-display-lg">
          {getCategoryIcon(category)}
          <h4 className="font-label-caps text-on-surface tracking-widest">{category}</h4>
        </div>
      </div>
      
      {/* Gradient fades for edge indication */}
      <div className="absolute right-0 top-8 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 hidden md:block" />
      
      <div
        ref={dragScroll.ref}
        onMouseDown={dragScroll.onMouseDown}
        onMouseMove={dragScroll.onMouseMove}
        onMouseUp={dragScroll.onMouseUp}
        onMouseLeave={dragScroll.onMouseLeave}
        onWheel={handleWheel}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 scrollbar-none -mx-2 px-2 md:mx-0 md:px-0 active:cursor-grabbing cursor-grab"
      >
        {channels.map((channel) => (
          <div key={channel.id} className="w-[180px] md:w-[200px] shrink-0 snap-start">
            <ChannelCard
              channel={channel}
              isSelected={channel.id === selectedChannelId}
              onSelect={onSelectChannel}
              onToggleFavorite={onToggleFavorite}
              variant="compact"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

