import type { MatchSchedule } from '@/types/stream';
import { WORLD_CUP_CHANNEL_IDS } from './channelCatalog';

const channelForMatch = (index: number) =>
  WORLD_CUP_CHANNEL_IDS[index % WORLD_CUP_CHANNEL_IDS.length];

type FixtureInput = [
  date: string,
  time: string,
  group: string,
  homeTeam: string,
  awayTeam: string,
  venue: string,
  status?: MatchSchedule['status'],
  score?: MatchSchedule['score'],
];

const fixture = (id: number, input: FixtureInput): MatchSchedule => {
  const [date, time, group, homeTeam, awayTeam, venue, status = 'UPCOMING', score] = input;
  return {
    id: `wc-2026-${id.toString().padStart(3, '0')}`,
    date,
    time,
    group,
    homeTeam,
    awayTeam,
    venue,
    status,
    score,
    channelId: channelForMatch(id),
  };
};

/** Official FIFA World Cup 2026™ group-stage results through 18 June 2026. */
const GROUP_STAGE: FixtureInput[] = [
  ['2026-06-11', '19:00', 'Group A', 'Mexico', 'South Africa', 'Mexico City Stadium', 'FINISHED', { home: 2, away: 0 }],
  ['2026-06-12', '02:00', 'Group A', 'Korea Republic', 'Czechia', 'Guadalajara Stadium', 'FINISHED', { home: 2, away: 1 }],
  ['2026-06-12', '19:00', 'Group B', 'Canada', 'Bosnia and Herzegovina', 'Toronto Stadium', 'FINISHED', { home: 1, away: 1 }],
  ['2026-06-13', '01:00', 'Group D', 'USA', 'Paraguay', 'Los Angeles Stadium', 'FINISHED', { home: 4, away: 1 }],
  ['2026-06-13', '19:00', 'Group B', 'Qatar', 'Switzerland', 'San Francisco Bay Area Stadium', 'FINISHED', { home: 1, away: 1 }],
  ['2026-06-13', '22:00', 'Group C', 'Brazil', 'Morocco', 'New York/New Jersey Stadium', 'FINISHED', { home: 1, away: 1 }],
  ['2026-06-14', '01:00', 'Group C', 'Haiti', 'Scotland', 'Boston Stadium', 'FINISHED', { home: 0, away: 1 }],
  ['2026-06-14', '04:00', 'Group D', 'Australia', 'Türkiye', 'BC Place Vancouver', 'FINISHED', { home: 2, away: 0 }],
  ['2026-06-14', '17:00', 'Group E', 'Germany', 'Curaçao', 'Houston Stadium', 'FINISHED', { home: 7, away: 1 }],
  ['2026-06-14', '20:00', 'Group F', 'Netherlands', 'Japan', 'Dallas Stadium', 'FINISHED', { home: 2, away: 2 }],
  ['2026-06-14', '23:00', 'Group E', "Côte d'Ivoire", 'Ecuador', 'Philadelphia Stadium', 'FINISHED', { home: 1, away: 0 }],
  ['2026-06-15', '02:00', 'Group F', 'Sweden', 'Tunisia', 'Monterrey Stadium', 'FINISHED', { home: 5, away: 1 }],
  ['2026-06-15', '16:00', 'Group H', 'Spain', 'Cabo Verde', 'Atlanta Stadium', 'FINISHED', { home: 0, away: 0 }],
  ['2026-06-15', '19:00', 'Group G', 'Belgium', 'Egypt', 'Seattle Stadium', 'FINISHED', { home: 1, away: 1 }],
  ['2026-06-15', '22:00', 'Group H', 'Saudi Arabia', 'Uruguay', 'Miami Stadium', 'FINISHED', { home: 1, away: 1 }],
  ['2026-06-16', '01:00', 'Group G', 'IR Iran', 'New Zealand', 'Los Angeles Stadium', 'FINISHED', { home: 2, away: 2 }],
  ['2026-06-16', '19:00', 'Group I', 'France', 'Senegal', 'New York/New Jersey Stadium', 'FINISHED', { home: 3, away: 1 }],
  ['2026-06-16', '22:00', 'Group I', 'Iraq', 'Norway', 'Boston Stadium', 'FINISHED', { home: 1, away: 4 }],
  ['2026-06-17', '01:00', 'Group J', 'Argentina', 'Algeria', 'Kansas City Stadium', 'FINISHED', { home: 3, away: 0 }],
  ['2026-06-17', '04:00', 'Group J', 'Austria', 'Jordan', 'San Francisco Bay Area Stadium', 'FINISHED', { home: 3, away: 1 }],
  ['2026-06-17', '17:00', 'Group K', 'Portugal', 'DR Congo', 'Houston Stadium', 'FINISHED', { home: 1, away: 1 }],
  ['2026-06-17', '20:00', 'Group L', 'England', 'Croatia', 'Dallas Stadium', 'FINISHED', { home: 4, away: 2 }],
  ['2026-06-17', '23:00', 'Group L', 'Ghana', 'Panama', 'Toronto Stadium', 'FINISHED', { home: 1, away: 0 }],
  ['2026-06-18', '02:00', 'Group K', 'Uzbekistan', 'Colombia', 'Mexico City Stadium', 'FINISHED', { home: 1, away: 3 }],
  ['2026-06-18', '16:00', 'Group A', 'Czechia', 'South Africa', 'Atlanta Stadium'],
  ['2026-06-18', '19:00', 'Group B', 'Switzerland', 'Bosnia and Herzegovina', 'Los Angeles Stadium'],
  ['2026-06-18', '22:00', 'Group B', 'Canada', 'Qatar', 'BC Place Vancouver'],
  ['2026-06-19', '01:00', 'Group A', 'Mexico', 'Korea Republic', 'Guadalajara Stadium'],
  ['2026-06-19', '19:00', 'Group D', 'USA', 'Australia', 'Seattle Stadium'],
  ['2026-06-19', '22:00', 'Group C', 'Scotland', 'Morocco', 'Boston Stadium'],
  ['2026-06-20', '00:30', 'Group C', 'Brazil', 'Haiti', 'Philadelphia Stadium'],
  ['2026-06-20', '03:00', 'Group D', 'Türkiye', 'Paraguay', 'San Francisco Bay Area Stadium'],
  ['2026-06-20', '17:00', 'Group F', 'Netherlands', 'Sweden', 'Houston Stadium'],
  ['2026-06-20', '20:00', 'Group E', 'Germany', "Côte d'Ivoire", 'Toronto Stadium'],
  ['2026-06-21', '00:00', 'Group E', 'Ecuador', 'Curaçao', 'Kansas City Stadium'],
  ['2026-06-21', '04:00', 'Group F', 'Tunisia', 'Japan', 'Monterrey Stadium'],
  ['2026-06-21', '16:00', 'Group H', 'Spain', 'Saudi Arabia', 'Atlanta Stadium'],
  ['2026-06-21', '19:00', 'Group G', 'Belgium', 'IR Iran', 'Los Angeles Stadium'],
  ['2026-06-21', '22:00', 'Group H', 'Uruguay', 'Cabo Verde', 'Miami Stadium'],
  ['2026-06-22', '01:00', 'Group G', 'New Zealand', 'Egypt', 'BC Place Vancouver'],
  ['2026-06-22', '17:00', 'Group J', 'Argentina', 'Austria', 'Dallas Stadium'],
  ['2026-06-22', '21:00', 'Group I', 'France', 'Iraq', 'Philadelphia Stadium'],
  ['2026-06-23', '00:00', 'Group I', 'Norway', 'Senegal', 'New York/New Jersey Stadium'],
  ['2026-06-23', '03:00', 'Group J', 'Jordan', 'Algeria', 'San Francisco Bay Area Stadium'],
  ['2026-06-23', '17:00', 'Group K', 'Portugal', 'Uzbekistan', 'Houston Stadium'],
  ['2026-06-23', '20:00', 'Group L', 'England', 'Ghana', 'Boston Stadium'],
  ['2026-06-23', '23:00', 'Group L', 'Panama', 'Croatia', 'Toronto Stadium'],
  ['2026-06-24', '02:00', 'Group K', 'Colombia', 'DR Congo', 'Guadalajara Stadium'],
  ['2026-06-24', '19:00', 'Group B', 'Switzerland', 'Canada', 'BC Place Vancouver'],
  ['2026-06-24', '19:00', 'Group B', 'Bosnia and Herzegovina', 'Qatar', 'Seattle Stadium'],
  ['2026-06-24', '22:00', 'Group C', 'Scotland', 'Brazil', 'Miami Stadium'],
  ['2026-06-24', '22:00', 'Group C', 'Morocco', 'Haiti', 'Atlanta Stadium'],
  ['2026-06-25', '01:00', 'Group A', 'Czechia', 'Mexico', 'Mexico City Stadium'],
  ['2026-06-25', '01:00', 'Group A', 'South Africa', 'Korea Republic', 'Monterrey Stadium'],
  ['2026-06-25', '20:00', 'Group E', 'Curaçao', "Côte d'Ivoire", 'Philadelphia Stadium'],
  ['2026-06-25', '20:00', 'Group E', 'Ecuador', 'Germany', 'New York/New Jersey Stadium'],
  ['2026-06-25', '23:00', 'Group F', 'Japan', 'Sweden', 'Dallas Stadium'],
  ['2026-06-25', '23:00', 'Group F', 'Tunisia', 'Netherlands', 'Kansas City Stadium'],
  ['2026-06-26', '02:00', 'Group D', 'Türkiye', 'USA', 'Los Angeles Stadium'],
  ['2026-06-26', '02:00', 'Group D', 'Paraguay', 'Australia', 'San Francisco Bay Area Stadium'],
  ['2026-06-26', '19:00', 'Group I', 'Norway', 'France', 'Boston Stadium'],
  ['2026-06-26', '19:00', 'Group I', 'Senegal', 'Iraq', 'Toronto Stadium'],
  ['2026-06-27', '00:00', 'Group H', 'Cabo Verde', 'Saudi Arabia', 'Houston Stadium'],
  ['2026-06-27', '00:00', 'Group H', 'Uruguay', 'Spain', 'Guadalajara Stadium'],
  ['2026-06-27', '03:00', 'Group G', 'Egypt', 'IR Iran', 'Seattle Stadium'],
  ['2026-06-27', '03:00', 'Group G', 'New Zealand', 'Belgium', 'BC Place Vancouver'],
  ['2026-06-27', '21:00', 'Group L', 'Panama', 'England', 'New York/New Jersey Stadium'],
  ['2026-06-27', '21:00', 'Group L', 'Croatia', 'Ghana', 'Philadelphia Stadium'],
  ['2026-06-27', '23:30', 'Group K', 'Colombia', 'Portugal', 'Miami Stadium'],
  ['2026-06-27', '23:30', 'Group K', 'DR Congo', 'Uzbekistan', 'Atlanta Stadium'],
  ['2026-06-28', '02:00', 'Group J', 'Algeria', 'Austria', 'Kansas City Stadium'],
  ['2026-06-28', '02:00', 'Group J', 'Jordan', 'Argentina', 'Dallas Stadium'],
];

const KNOCKOUT_STAGE: FixtureInput[] = [
  ['2026-06-28', '19:00', 'Round of 32', '2nd Group A', '2nd Group B', 'Los Angeles Stadium'],
  ['2026-06-29', '17:00', 'Round of 32', '1st Group C', '2nd Group F', 'Houston Stadium'],
  ['2026-06-29', '20:30', 'Round of 32', '1st Group E', '3rd Place', 'Boston Stadium'],
  ['2026-06-30', '01:00', 'Round of 32', '1st Group F', '2nd Group C', 'Monterrey Stadium'],
  ['2026-06-30', '17:00', 'Round of 32', '2nd Group E', '2nd Group I', 'Dallas Stadium'],
  ['2026-06-30', '21:00', 'Round of 32', '1st Group I', '3rd Place', 'New York/New Jersey Stadium'],
  ['2026-07-01', '01:00', 'Round of 32', '1st Group A', '3rd Place', 'Mexico City Stadium'],
  ['2026-07-01', '16:00', 'Round of 32', '1st Group L', '3rd Place', 'Atlanta Stadium'],
  ['2026-07-01', '20:00', 'Round of 32', '1st Group G', '3rd Place', 'Seattle Stadium'],
  ['2026-07-02', '00:00', 'Round of 32', '1st Group D', '3rd Place', 'San Francisco Bay Area Stadium'],
  ['2026-07-02', '19:00', 'Round of 32', '1st Group H', '2nd Group J', 'Los Angeles Stadium'],
  ['2026-07-02', '23:00', 'Round of 32', '2nd Group K', '2nd Group L', 'Toronto Stadium'],
  ['2026-07-03', '03:00', 'Round of 32', '1st Group B', '3rd Place', 'BC Place Vancouver'],
  ['2026-07-03', '18:00', 'Round of 32', '2nd Group D', '2nd Group G', 'Dallas Stadium'],
  ['2026-07-03', '22:00', 'Round of 32', '1st Group J', '2nd Group H', 'Miami Stadium'],
  ['2026-07-04', '01:30', 'Round of 32', '1st Group K', '3rd Place', 'Kansas City Stadium'],
  ['2026-07-04', '17:00', 'Round of 16', 'Winner M73', 'Winner M75', 'Houston Stadium'],
  ['2026-07-04', '21:00', 'Round of 16', 'Winner M74', 'Winner M77', 'Philadelphia Stadium'],
  ['2026-07-05', '20:00', 'Round of 16', 'Winner M76', 'Winner M78', 'New York/New Jersey Stadium'],
  ['2026-07-06', '00:00', 'Round of 16', 'Winner M79', 'Winner M80', 'Mexico City Stadium'],
  ['2026-07-06', '19:00', 'Round of 16', 'Winner M83', 'Winner M84', 'Dallas Stadium'],
  ['2026-07-07', '00:00', 'Round of 16', 'Winner M81', 'Winner M82', 'Seattle Stadium'],
  ['2026-07-07', '16:00', 'Round of 16', 'Winner M86', 'Winner M88', 'Atlanta Stadium'],
  ['2026-07-07', '20:00', 'Round of 16', 'Winner M85', 'Winner M87', 'BC Place Vancouver'],
  ['2026-07-09', '20:00', 'Quarter-final', 'Winner M89', 'Winner M90', 'Boston Stadium'],
  ['2026-07-10', '19:00', 'Quarter-final', 'Winner M93', 'Winner M94', 'Los Angeles Stadium'],
  ['2026-07-11', '21:00', 'Quarter-final', 'Winner M91', 'Winner M92', 'Miami Stadium'],
  ['2026-07-12', '01:00', 'Quarter-final', 'Winner M95', 'Winner M96', 'Kansas City Stadium'],
  ['2026-07-14', '19:00', 'Semi-final', 'Winner M97', 'Winner M98', 'Dallas Stadium'],
  ['2026-07-15', '19:00', 'Semi-final', 'Winner M99', 'Winner M100', 'Atlanta Stadium'],
  ['2026-07-18', '21:00', '3rd Place', 'RU Semi 1', 'RU Semi 2', 'Miami Stadium'],
  ['2026-07-19', '19:00', 'Final', 'Winner SF1', 'Winner SF2', 'New York/New Jersey Stadium'],
];

const ALL_FIXTURES = [...GROUP_STAGE, ...KNOCKOUT_STAGE];

export const MATCH_SCHEDULE: MatchSchedule[] = ALL_FIXTURES.map((input, index) =>
  fixture(index + 1, input)
);

/** Tournament calendar date in YYYY-MM-DD (local). */
export function getTournamentToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTournamentDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}
