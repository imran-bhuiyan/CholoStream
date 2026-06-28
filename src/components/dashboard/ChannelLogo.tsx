'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Award, Film, Globe, Radio, Tv } from 'lucide-react';
import type { Channel } from '@/types/stream';

interface ChannelLogoProps {
  channel: Pick<Channel, 'name' | 'category' | 'logoUrl'>;
  size?: number;
  className?: string;
}

function CategoryFallbackIcon({
  category,
  size,
}: {
  category: Channel['category'];
  size: number;
}) {
  const iconClass = 'text-slate-400';
  const dim = Math.round(size * 0.45);

  switch (category) {
    case 'Sports':
      return <Award width={dim} height={dim} className={`${iconClass} text-violet-400`} />;
    case 'News':
      return <Radio width={dim} height={dim} className={`${iconClass} text-blue-400`} />;
    case 'Entertainment':
      return <Film width={dim} height={dim} className={`${iconClass} text-emerald-400`} />;
    case 'International':
      return <Globe width={dim} height={dim} className={`${iconClass} text-cyan-400`} />;
    default:
      return <Tv width={dim} height={dim} className={iconClass} />;
  }
}

export default function ChannelLogo({ channel, size = 36, className = '' }: ChannelLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = channel.logoUrl && !failed;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-[#1a1f2b] border border-slate-800 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          unoptimized={true}
          src={channel.logoUrl}
          alt={`${channel.name} logo`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain p-0.5"
          onError={() => setFailed(true)}
        />
      ) : (
        <CategoryFallbackIcon category={channel.category} size={size} />
      )}
    </div>
  );
}
