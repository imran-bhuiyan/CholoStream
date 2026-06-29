'use client';

import React, { useMemo, useState } from 'react';
import { MATCH_SCHEDULE } from '@/data/worldCup2026Schedule';
import { computeStandings, extractTeams } from '@/data/standings';
import { getTeamFlag } from '@/components/LiveScores';
import Image from 'next/image';
import { Users, Search, Trophy } from 'lucide-react';

const GROUP_COLORS: Record<string, string> = {
  'Group A': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'Group B': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Group C': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Group D': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'Group E': 'bg-lime-500/15 text-lime-400 border-lime-500/30',
  'Group F': 'bg-green-500/15 text-green-400 border-green-500/30',
  'Group G': 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  'Group H': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'Group I': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  'Group J': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Group K': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'Group L': 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
};

export default function TeamsPanel() {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');

  const allTeams = useMemo(() => extractTeams(MATCH_SCHEDULE), []);
  const standings = useMemo(() => computeStandings(MATCH_SCHEDULE), []);
  const groups = useMemo(() => ['All', ...Array.from(new Set(allTeams.map(t => t.group)))], [allTeams]);

  // Build a quick lookup: team → { position, points, played }
  const standingLookup = useMemo(() => {
    const map = new Map<string, { pos: number; pts: number; played: number }>();
    for (const gs of standings) {
      gs.teams.forEach((t, i) => {
        map.set(t.team, { pos: i + 1, pts: t.points, played: t.played });
      });
    }
    return map;
  }, [standings]);

  const filtered = useMemo(() => {
    return allTeams.filter(t => {
      const matchesGroup = selectedGroup === 'All' || t.group === selectedGroup;
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [allTeams, search, selectedGroup]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Users className="h-5 w-5 text-secondary-fixed" />
        <h2 className="font-headline-lg text-headline-lg text-secondary-fixed uppercase tracking-tight">
          All Teams
        </h2>
        <span className="ml-auto font-label-caps text-label-caps text-on-surface-variant">
          48 Nations
        </span>
      </div>

      {/* Search + Group Filter */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant rounded-xl py-2 pl-9 pr-4 text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-secondary-fixed/50 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ${
                selectedGroup === g
                  ? 'bg-secondary-fixed text-on-secondary-fixed border-secondary-fixed'
                  : `${g !== 'All' ? GROUP_COLORS[g] ?? '' : 'bg-surface-container text-on-surface-variant border-outline-variant'} hover:border-white/20`
              }`}
            >
              {g === 'All' ? 'All Groups' : g.replace('Group ', 'Grp ')}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
          {filtered.map(team => {
            const info = standingLookup.get(team.name);
            const colorClass = GROUP_COLORS[team.group] ?? 'bg-surface-container text-on-surface-variant border-outline-variant';
            return (
              <div
                key={team.name}
                className="glass-panel rounded-xl p-3 flex flex-col items-center text-center gap-2 shimmer-hover group cursor-default"
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={getTeamFlag(team.name)}
                    alt={team.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-200"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 w-full">
                  <p className="font-body-lg text-body-lg text-on-surface truncate w-full">{team.name}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${colorClass}`}>
                    {team.group.replace('Group ', 'Grp ')}
                  </span>
                </div>
                {info && info.played > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {info.pos <= 2 && (
                      <Trophy className="h-3 w-3 text-secondary-fixed" />
                    )}
                    <span className="font-label-caps text-[9px] text-on-surface-variant uppercase">
                      {info.pos === 1 ? '1st' : info.pos === 2 ? '2nd' : info.pos === 3 ? '3rd' : `${info.pos}th`} · {info.pts} pts
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-10 w-10 text-on-surface-variant mb-3 opacity-30" />
            <p className="font-body-md text-body-md text-on-surface-variant">No teams found</p>
          </div>
        )}
      </div>
    </div>
  );
}
