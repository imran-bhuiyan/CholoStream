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
    'Argentina': 'AR',
    'Algeria': 'DZ',
    'Australia': 'AU',
    'Austria': 'AT',
    'Belgium': 'BE',
    'Bosnia and Herzegovina': 'BA',
    'Brazil': 'BR',
    'Cabo Verde': 'CV',
    'Canada': 'CA',
    'Colombia': 'CO',
    'DR Congo': 'CD',
    'Congo DR': 'CD',
    "Côte d'Ivoire": 'CI',
    "Cote d'Ivoire": 'CI',
    'Croatia': 'HR',
    'Curaçao': 'CW',
    'Curacao': 'CW',
    'Czechia': 'CZ',
    'Ecuador': 'EC',
    'Egypt': 'EG',
    'England': 'GB-ENG',
    'France': 'FR',
    'Germany': 'DE',
    'Ghana': 'GH',
    'Haiti': 'HT',
    'IR Iran': 'IR',
    'Iraq': 'IQ',
    'Japan': 'JP',
    'Jordan': 'JO',
    'Korea Republic': 'KR',
    'Mexico': 'MX',
    'Morocco': 'MA',
    'Netherlands': 'NL',
    'New Zealand': 'NZ',
    'Norway': 'NO',
    'Panama': 'PA',
    'Paraguay': 'PY',
    'Portugal': 'PT',
    'Qatar': 'QA',
    'Saudi Arabia': 'SA',
    'Scotland': 'GB-SCT',
    'Senegal': 'SN',
    'South Africa': 'ZA',
    'Spain': 'ES',
    'Sweden': 'SE',
    'Switzerland': 'CH',
    'Tunisia': 'TN',
    'Türkiye': 'TR',
    'Uruguay': 'UY',
    'Uzbekistan': 'UZ',
    'USA': 'US',
  };
  const code = countryCodes[teamName] || 'UN';
  return `https://flagsapi.com/${code}/flat/64.png`;
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

  if (scoreboardMatches.length === 0 && todayUpcoming.length === 0) return null;

  const getChannelName = (channelId?: string) => {
    if (!channelId) return 'N/A';
    return channels.find((c) => c.id === channelId)?.name || 'Sport TV';
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
      className={`group relative bg-[#151821] border border-white/5 rounded-2xl p-4 transition-all duration-300 overflow-hidden ${
        match.channelId
          ? 'cursor-pointer hover:border-white/10 hover:shadow-2xl hover:-translate-y-1'
          : 'cursor-default'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${
            match.status === 'LIVE'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
              : match.status === 'FINISHED'
                ? 'bg-slate-800/40 text-slate-300 border-slate-700'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
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
            className="w-10 h-10 object-contain drop-shadow-md mb-1.5 transition-transform duration-200 group-hover:scale-110"
          />
          <span className="text-xs font-semibold text-slate-300 truncate w-full">
            {match.homeTeam}
          </span>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/60 min-w-[72px] justify-center">
          {showScore && match.score ? (
            <>
              <span className="text-lg font-extrabold font-mono text-slate-100">
                {match.score.home}
              </span>
              <span className="text-xs text-slate-650 font-bold">-</span>
              <span className="text-lg font-extrabold font-mono text-slate-100">
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
            <CalendarDays className="h-3.5 w-3.5 text-violet-400/80 flex-shrink-0" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-amber-400/80 flex-shrink-0" />
          )}
          <span className="truncate font-semibold text-slate-400">
            {match.venue || getChannelName(match.channelId)}
          </span>
        </div>

        {match.channelId && (
          <div className="flex items-center space-x-1 text-violet-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
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
