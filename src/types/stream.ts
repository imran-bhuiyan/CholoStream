export type StreamCodec = 'AVC' | 'HEVC' | 'MPEGTS';

export interface StreamSource {
  url: string;
  codec: StreamCodec;
  isBackup: boolean;
}

export interface Channel {
  id: string;
  name: string;
  logoUrl: string;
  category: 'Sports' | 'News' | 'Entertainment' | 'International';
  sources: StreamSource[];
}

export interface MatchSchedule {
  id: string;
  homeTeam: string;
  awayTeam: string;
  time: string; // Clean display timestamp
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  channelId?: string; // Links match to an active streaming channel
  score?: { home: number; away: number };
  group?: string;
  venue?: string;
  date?: string;
}
