export interface TeamStanding {
  team: string;
  group: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number; // Goals For
  ga: number; // Goals Against
  gd: number; // Goal Difference
  points: number;
}

export interface GroupStandings {
  group: string; // e.g. "Group A"
  teams: TeamStanding[];
}
