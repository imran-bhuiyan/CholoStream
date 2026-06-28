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
        w-full flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-300 group text-left select-none relative overflow-hidden
        ${
          isOffline
            ? 'opacity-40 grayscale bg-white/[0.01] border-white/5 cursor-default'
            : isSelected
            ? 'bg-violet-600/20 border-violet-500/50 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] scale-[1.02] z-10'
            : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:scale-[1.01]'
        }
      `}
    >
      <div className={`flex items-center ${isCompact ? 'space-x-2.5' : 'space-x-3'} min-w-0`}>
        <div className="relative flex-shrink-0">
          <ChannelLogo channel={channel} size={isCompact ? 32 : 36} className={isCompact ? 'rounded-lg' : 'rounded-xl'} />
          {isSelected && !isOffline && !isCompact && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a0c10] rounded-full" />
          )}
        </div>

        <div className="min-w-0">
          <h4
            className={`truncate ${
              isCompact ? 'text-[11px] font-bold pr-3' : 'text-xs font-bold'
            } ${isSelected && !isOffline && !isCompact ? 'text-slate-100' : 'text-slate-350'}`}
          >
            {channel.name}
          </h4>
          <p className={`${isCompact ? 'text-[9px]' : 'text-[10px]'} text-slate-500 font-semibold mt-0.5`}>
            {isOffline ? (
              <span className="flex items-center space-x-1 text-rose-400/80">
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
              <span className="text-[8px] font-black text-rose-400/90 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/10">
                OFFLINE
              </span>
            )}
            {!isOffline && hasHEVC && (
              <span className="text-[8px] font-black text-amber-400/90 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/10">
                HEVC
              </span>
            )}
            {!isOffline && hasMPEGTS && (
              <span className="text-[8px] font-black text-cyan-400/90 bg-cyan-500/10 px-1 py-0.5 rounded border border-cyan-500/10">
                TS
              </span>
            )}
          </div>
        )}

        {/* Star favorite toggle */}
        <button
          onClick={(e) => onToggleFavorite(channel.id, e)}
          className={`p-1 hover:bg-slate-850 rounded transition-colors ${
            isCompact ? 'text-amber-400 hover:text-amber-500' : 'text-slate-650 hover:text-amber-400'
          }`}
          aria-label="Toggle favorite"
        >
          <Star className={`h-3.5 w-3.5 ${isCompact ? 'fill-current' : 'hover:scale-105 transition-transform'}`} />
        </button>
      </div>

      {isSelected && !isOffline && (
        <span className={`absolute bottom-0 right-0 bg-emerald-500 rounded-tl-lg ${isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5'}`} />
      )}
    </div>
  );
}
