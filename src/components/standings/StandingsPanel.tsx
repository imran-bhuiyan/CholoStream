'use client';

import React, { useMemo, useState } from 'react';
import { MATCH_SCHEDULE } from '@/data/worldCup2026Schedule';
import { computeStandings } from '@/data/standings';
import { getTeamFlag } from '@/components/LiveScores';
import Image from 'next/image';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

export default function StandingsPanel() {
  const standings = useMemo(() => computeStandings(MATCH_SCHEDULE), []);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(standings.map(g => g.group)));

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="h-5 w-5 text-secondary-fixed" />
        <h2 className="font-headline-lg text-headline-lg text-secondary-fixed uppercase tracking-tight">
          Group Standings
        </h2>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-secondary-fixed/20 border border-secondary-fixed/40 inline-block" />
          <span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wide">Qualify</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-500/15 border border-amber-500/30 inline-block" />
          <span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wide">Best 3rd</span>
        </div>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-4">
        {standings.map(({ group, teams }) => {
          const isOpen = openGroups.has(group);
          return (
            <div key={group} className="glass-panel rounded-xl overflow-hidden">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">{group}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-on-surface-variant font-semibold">
                    {teams.filter(t => t.played > 0).length}/{teams.length} played
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-on-surface-variant" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-on-surface-variant" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-white/5">
                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto_auto] gap-x-2 px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-white/5">
                    <span>Team</span>
                    <span className="w-5 text-center">P</span>
                    <span className="w-5 text-center">W</span>
                    <span className="w-5 text-center">D</span>
                    <span className="w-5 text-center">L</span>
                    <span className="w-7 text-center">GD</span>
                    <span className="w-6 text-center">GF</span>
                    <span className="w-7 text-center font-extrabold text-on-surface">Pts</span>
                  </div>

                  {teams.map((team, idx) => {
                    const rowBg =
                      idx < 2
                        ? 'bg-secondary-fixed/8 hover:bg-secondary-fixed/15'
                        : idx === 2
                        ? 'bg-amber-500/5 hover:bg-amber-500/10'
                        : 'hover:bg-white/5';
                    const rankColor =
                      idx < 2 ? 'text-secondary-fixed' : idx === 2 ? 'text-amber-400' : 'text-on-surface-variant';

                    return (
                      <div
                        key={team.team}
                        className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto_auto] gap-x-2 px-4 py-2 items-center transition-colors ${rowBg} ${
                          idx > 0 ? 'border-t border-white/5' : ''
                        }`}
                      >
                        {/* Pos + Flag + Name */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[11px] font-black w-4 flex-shrink-0 ${rankColor}`}>
                            {idx + 1}
                          </span>
                          <Image
                            src={getTeamFlag(team.team)}
                            alt={team.team}
                            width={20}
                            height={20}
                            className="w-5 h-5 object-contain flex-shrink-0"
                            unoptimized
                          />
                          <span className="font-body-md text-body-md text-on-surface truncate">{team.team}</span>
                        </div>

                        <span className="w-5 text-center font-mono text-xs text-on-surface-variant">{team.played}</span>
                        <span className="w-5 text-center font-mono text-xs text-on-surface">{team.wins}</span>
                        <span className="w-5 text-center font-mono text-xs text-on-surface-variant">{team.draws}</span>
                        <span className="w-5 text-center font-mono text-xs text-on-surface-variant">{team.losses}</span>
                        <span className={`w-7 text-center font-mono text-xs ${team.gd > 0 ? 'text-secondary-fixed' : team.gd < 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                          {team.gd > 0 ? `+${team.gd}` : team.gd}
                        </span>
                        <span className="w-6 text-center font-mono text-xs text-on-surface-variant">{team.gf}</span>
                        <span className="w-7 text-center font-black text-sm text-on-surface">{team.points}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
