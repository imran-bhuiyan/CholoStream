'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { MatchSchedule, Channel } from '@/types/stream';
import { CalendarDays, Clock, PlayCircle } from 'lucide-react';
import { formatTournamentDate, getTournamentToday } from '@/data/worldCup2026Schedule';

interface LiveScoresProps {
  matches: MatchSchedule[];
  channels: Channel[];
  onSelectChannel: (channelId: string) => void;
}

// Dynamically resolve team flags
export const getTeamFlag = (teamName: string) => {
  const countryCodes: Record<string, string> = {
    'Argentina': 'ar',
    'Algeria': 'dz',
    'Australia': 'au',
    'Austria': 'at',
    'Belgium': 'be',
    'Bosnia and Herzegovina': 'ba',
    'Brazil': 'br',
    'Cabo Verde': 'cv',
    'Canada': 'ca',
    'Colombia': 'co',
    'DR Congo': 'cd',
    'Congo DR': 'cd',
    "Côte d'Ivoire": 'ci',
    "Cote d'Ivoire": 'ci',
    'Croatia': 'hr',
    'Curaçao': 'cw',
    'Curacao': 'cw',
    'Czechia': 'cz',
    'Ecuador': 'ec',
    'Egypt': 'eg',
    'England': 'gb-eng',
    'France': 'fr',
    'Germany': 'de',
    'Ghana': 'gh',
    'Haiti': 'ht',
    'IR Iran': 'ir',
    'Iraq': 'iq',
    'Japan': 'jp',
    'Jordan': 'jo',
    'Korea Republic': 'kr',
    'Mexico': 'mx',
    'Morocco': 'ma',
    'Netherlands': 'nl',
    'New Zealand': 'nz',
    'Norway': 'no',
    'Panama': 'pa',
    'Paraguay': 'py',
    'Portugal': 'pt',
    'Qatar': 'qa',
    'Saudi Arabia': 'sa',
    'Scotland': 'gb-sct',
    'Senegal': 'sn',
    'South Africa': 'za',
    'Spain': 'es',
    'Sweden': 'se',
    'Switzerland': 'ch',
    'Tunisia': 'tn',
    'Türkiye': 'tr',
    'Uruguay': 'uy',
    'Uzbekistan': 'uz',
    'USA': 'us',
  };
  const code = countryCodes[teamName] || 'un';
  return `https://flagcdn.com/w80/${code}.png`;
};

export default function LiveScores({ matches, channels, onSelectChannel }: LiveScoresProps) {
  const today = getTournamentToday();
  const todayLabel = formatTournamentDate(today);

  const { liveMatches, todayResults, todayUpcoming } = useMemo(() => {
    const todays = matches.filter((match) => match.date === today);
    return {
      liveMatches: matches.filter((match) => match.status === 'LIVE'),
      todayResults: todays.filter((match) => match.status === 'FINISHED'),
      todayUpcoming: todays.filter((match) => match.status === 'UPCOMING'),
    };
  }, [matches, today]);

  const scoreboardMatches =
    liveMatches.length > 0 ? liveMatches : todayResults;

  const channelMap = useMemo(() => {
    const map = new Map<string, string>();
    channels.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [channels]);

  if (scoreboardMatches.length === 0 && todayUpcoming.length === 0) return null;

  const getChannelName = (channelId?: string) => {
    if (!channelId) return 'N/A';
    return channelMap.get(channelId) || 'Sport TV';
  };

  const headerTitle =
    liveMatches.length > 0
      ? 'Live World Cup Scoreboards'
      : todayResults.length > 0
        ? `${todayLabel} World Cup Results`
        : `${todayLabel} World Cup Fixtures`;

  const headerCount = scoreboardMatches.length || todayUpcoming.length;

  const renderMatchCard = (match: MatchSchedule, showScore: boolean) => (
    <div
      key={match.id}
      onClick={() => match.channelId && onSelectChannel(match.channelId)}
      className={`group relative glass-panel rounded-xl p-4 transition-all duration-300 overflow-hidden shimmer-hover animate-fade-in-up border border-white/5 ${
        match.channelId
          ? 'cursor-pointer hover:border-secondary-fixed/40 hover:shadow-[0_0_20px_rgba(195,244,0,0.12)] hover:-translate-y-0.5'
          : 'cursor-default'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`font-label-caps text-[10px] px-2.5 py-0.5 rounded border ${
            match.status === 'LIVE'
              ? 'bg-error-container text-error border-error/20 animate-pulse'
              : match.status === 'FINISHED'
                ? 'bg-surface-container text-on-surface border-outline'
                : 'bg-secondary-fixed/10 text-secondary-fixed border-secondary-fixed/20'
          }`}
        >
          {match.status === 'LIVE' ? 'LIVE' : match.status === 'FINISHED' ? 'FT' : match.time}
        </span>
        <span className="text-xs text-slate-400 font-medium font-mono">{match.group}</span>
      </div>

      <div className="flex items-center justify-between space-x-2 my-2">
        <div className="flex flex-col items-center flex-1 text-center min-w-0">
          <Image
            src={getTeamFlag(match.homeTeam)}
            alt={match.homeTeam}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 object-contain drop-shadow-md mb-1.5 transition-transform duration-200 group-hover:scale-110"
          />
          <span className="text-xs font-semibold text-slate-300 truncate w-full">
            {match.homeTeam}
          </span>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/60 min-w-[72px] justify-center">
          {showScore && match.score ? (
            <>
              <span className="font-stats-number text-stats-number text-on-surface">
                {match.score.home}
              </span>
              <span className="text-xs text-slate-650 font-bold">-</span>
              <span className="font-stats-number text-stats-number text-on-surface">
                {match.score.away}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold font-mono text-slate-400">vs</span>
          )}
        </div>

        <div className="flex flex-col items-center flex-1 text-center min-w-0">
          <Image
            src={getTeamFlag(match.awayTeam)}
            alt={match.awayTeam}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 object-contain drop-shadow-md mb-1.5 transition-transform duration-200 group-hover:scale-110"
          />
          <span className="text-xs font-semibold text-slate-300 truncate w-full">
            {match.awayTeam}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-850 text-xs text-slate-500">
        <div className="flex items-center space-x-1.5 truncate">
          {showScore ? (
            <CalendarDays className="h-3.5 w-3.5 text-secondary-fixed/80 flex-shrink-0" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-amber-400/80 flex-shrink-0" />
          )}
          <span className="truncate font-semibold text-slate-400">
            {match.venue || getChannelName(match.channelId)}
          </span>
        </div>

        {match.channelId && (
          <div className="flex items-center space-x-1 text-secondary-fixed font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Watch</span>
            <PlayCircle className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2.5">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </span>
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-250">
          {headerTitle} ({headerCount})
        </h2>
      </div>

      {scoreboardMatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {scoreboardMatches.map((match) => renderMatchCard(match, true))}
        </div>
      )}

      {todayUpcoming.length > 0 && (
        <div className="space-y-3">
          {scoreboardMatches.length > 0 && (
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Up next today
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {todayUpcoming.map((match) => renderMatchCard(match, false))}
          </div>
        </div>
      )}
    </div>
  );
}
