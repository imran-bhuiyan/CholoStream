import type { MatchSchedule } from '@/types/stream';
import type { TeamStanding, GroupStandings } from '@/types/standings';

/**
 * Derives live group-stage standings from the match schedule.
 * Only FINISHED group-stage matches are counted.
 */
export function computeStandings(matches: MatchSchedule[]): GroupStandings[] {
  const teamMap = new Map<string, TeamStanding>();

  const getOrCreate = (team: string, group: string): TeamStanding => {
    const key = `${group}::${team}`;
    if (!teamMap.has(key)) {
      teamMap.set(key, {
        team,
        group,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      });
    }
    return teamMap.get(key)!;
  };

  for (const match of matches) {
    // Only count group-stage matches (not Round of 32, 16, QF, SF, Final)
    const isGroupStage = match.group?.startsWith('Group');
    if (!isGroupStage || match.status !== 'FINISHED' || !match.score) continue;

    const home = getOrCreate(match.homeTeam, match.group!);
    const away = getOrCreate(match.awayTeam, match.group!);

    const hg = match.score.home;
    const ag = match.score.away;

    home.played++;
    away.played++;
    home.gf += hg;
    home.ga += ag;
    away.gf += ag;
    away.ga += hg;

    if (hg > ag) {
      home.wins++;
      home.points += 3;
      away.losses++;
    } else if (hg === ag) {
      home.draws++;
      home.points++;
      away.draws++;
      away.points++;
    } else {
      away.wins++;
      away.points += 3;
      home.losses++;
    }

    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;
  }

  // Also seed teams that haven't played yet (from upcoming matches)
  for (const match of matches) {
    if (!match.group?.startsWith('Group')) continue;
    getOrCreate(match.homeTeam, match.group!);
    getOrCreate(match.awayTeam, match.group!);
  }

  // Group and sort
  const groupMap = new Map<string, TeamStanding[]>();
  for (const standing of teamMap.values()) {
    if (!groupMap.has(standing.group)) groupMap.set(standing.group, []);
    groupMap.get(standing.group)!.push(standing);
  }

  const sortTeams = (a: TeamStanding, b: TeamStanding) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team);
  };

  const sorted = Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, teams]) => ({
      group,
      teams: teams.sort(sortTeams),
    }));

  return sorted;
}

/** Extract all 48 unique teams with their group from the group stage */
export interface TeamInfo {
  name: string;
  group: string;
}

export function extractTeams(matches: MatchSchedule[]): TeamInfo[] {
  const seen = new Map<string, TeamInfo>();
  for (const match of matches) {
    if (!match.group?.startsWith('Group')) continue;
    if (!seen.has(match.homeTeam)) seen.set(match.homeTeam, { name: match.homeTeam, group: match.group });
    if (!seen.has(match.awayTeam)) seen.set(match.awayTeam, { name: match.awayTeam, group: match.group });
  }
  return Array.from(seen.values()).sort((a, b) => {
    if (a.group !== b.group) return a.group.localeCompare(b.group);
    return a.name.localeCompare(b.name);
  });
}
