import React from 'react';
import type { Channel, StreamSource } from '@/types/stream';
import { Star, WifiOff } from 'lucide-react';
import ChannelLogo from './ChannelLogo';

interface ChannelCardProps {
  channel: Channel;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  variant?: 'default' | 'compact';
}

export default function ChannelCard({
  channel,
  isSelected,
  onSelect,
  onToggleFavorite,
  variant = 'default',
}: ChannelCardProps) {
  const isOffline = channel.sources.length === 0;
  const isCompact = variant === 'compact';

  const hasHEVC = channel.sources.some((s: StreamSource) => s.codec === 'HEVC');
  const hasMPEGTS = channel.sources.some((s: StreamSource) => s.codec === 'MPEGTS');

  return (
    <div
      onClick={() => onSelect(channel.id)}
      className={`
        w-full flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 group text-left select-none relative overflow-hidden animate-fade-in-up
        ${
          isOffline
            ? 'opacity-40 grayscale bg-surface-container-lowest border border-white/5 cursor-default'
            : isSelected
            ? 'bg-secondary-fixed/10 border border-secondary-fixed selected-glow text-secondary scale-[1.02] z-10 shadow-[0_0_25px_rgba(195,244,0,0.25)]'
            : 'glass-panel glass-panel-hover text-on-surface-variant hover:text-on-surface hover:scale-[1.01] border border-white/5'
        }
      `}
    >
      <div className={`flex items-center ${isCompact ? 'space-x-2.5' : 'space-x-3'} min-w-0`}>
        <div className="relative flex-shrink-0">
          <ChannelLogo channel={channel} size={isCompact ? 32 : 36} className="rounded-md border border-white/10" />
          {isSelected && !isOffline && !isCompact && (
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary-fixed border-2 border-background rounded-full shadow-[0_0_10px_rgba(195,244,0,0.8)]" />
          )}
        </div>

        <div className="min-w-0">
          <h4
            className={`truncate font-headline-lg uppercase ${
              isCompact ? 'text-[16px] leading-[18px] pr-3' : 'text-[20px] leading-[22px]'
            } ${isSelected && !isOffline && !isCompact ? 'text-secondary' : 'text-on-surface'}`}
          >
            {channel.name}
          </h4>
          <p className={`font-body-md uppercase tracking-wider ${isCompact ? 'text-[9px]' : 'text-[11px]'} text-on-surface-variant font-semibold mt-0.5`}>
            {isOffline ? (
              <span className="flex items-center space-x-1 text-error">
                <WifiOff className="h-2.5 w-2.5" />
                <span>Offline</span>
              </span>
            ) : (
              channel.category
            )}
          </p>
        </div>
      </div>

      <div className={`flex items-center ${isCompact ? '' : 'space-x-2'} z-10`}>
        {/* Technical badges (only in default variant) */}
        {!isCompact && (
          <div className="flex flex-col items-end space-y-0.5">
            {isOffline && (
              <span className="font-label-caps text-[8px] bg-error-container text-on-error-container px-1.5 py-0.5 rounded-sm border border-error/20">
                OFFLINE
              </span>
            )}
            {!isOffline && hasHEVC && (
              <span className="font-label-caps text-[8px] bg-secondary-container/20 text-secondary-fixed px-1.5 py-0.5 rounded-sm border border-secondary-fixed/20">
                HEVC
              </span>
            )}
            {!isOffline && hasMPEGTS && (
              <span className="font-label-caps text-[8px] bg-primary-container/20 text-primary px-1.5 py-0.5 rounded-sm border border-primary/20">
                TS
              </span>
            )}
          </div>
        )}

        {/* Star favorite toggle */}
        <button
          onClick={(e) => onToggleFavorite(channel.id, e)}
          className={`p-1 hover:bg-surface-container-high rounded transition-colors ${
            isCompact ? 'text-secondary-fixed hover:text-secondary-fixed' : 'text-outline hover:text-secondary-fixed'
          }`}
          aria-label="Toggle favorite"
        >
          <Star className={`h-3.5 w-3.5 ${isCompact ? 'fill-current' : 'hover:scale-105 transition-transform'}`} />
        </button>
      </div>

      {isSelected && !isOffline && (
        <span className={`absolute top-0 right-0 live-pulse bg-secondary-fixed rounded-bl-lg ${isCompact ? 'w-2 h-2' : 'w-3 h-3'}`} />
      )}
    </div>
  );
}
