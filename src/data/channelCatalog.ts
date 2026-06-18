import type { Channel } from '@/types/stream';

export interface ChannelCatalogEntry {
  id: string;
  name: string;
  category: Channel['category'];
  /** iptv-org channel IDs, highest priority first. */
  iptvIds: string[];
  /** Fallback stream title matches from iptv-org when channel IDs have no feeds. */
  titleFallbacks?: string[];
}

/** Curated channels resolved against the iptv-org database at runtime. */
export const CHANNEL_CATALOG: ChannelCatalogEntry[] = [
  {
    id: 'fifa-wc',
    name: 'FIFA World Cup TV',
    category: 'Sports',
    iptvIds: ['FIFAPlus.uk', 'FIFAPlusWomen.uk', 'FIFA.tv'],
    titleFallbacks: ['FIFA', 'World Cup'],
  },
  {
    id: 'bein-sports-1',
    name: 'Bein Sports 1',
    category: 'Sports',
    iptvIds: ['beINSportsUSA.us', 'beINSPORTSXTRA.us'],
  },
  {
    id: 'bein-sports-2',
    name: 'Bein Sports 2',
    category: 'Sports',
    iptvIds: ['beINSPORTSXTRAenEspanol.us', 'beINSPORTSXTRA.us'],
  },
  {
    id: 'tsn-1',
    name: 'TSN Sports 1',
    category: 'Sports',
    iptvIds: ['TSNTheOcho.ca', 'TSNTeleSondrioNews.it'],
  },
  {
    id: 'tsn-2',
    name: 'TSN Sports 2',
    category: 'Sports',
    iptvIds: ['TSNTheOcho.ca'],
  },
  {
    id: 'win-sports',
    name: 'Win Sports',
    category: 'Sports',
    iptvIds: ['WinSports.co'],
  },
  {
    id: 'fussball-tv',
    name: 'Fussball TV',
    category: 'Sports',
    iptvIds: ['MoreThanSportsTV.de', 'DAZNHeldinnenxPlutoTV.de'],
  },
  {
    id: 'caze-tv',
    name: 'Caze TV',
    category: 'Sports',
    iptvIds: ['CazeTV.br'],
  },
  {
    id: 'tyc-sports',
    name: 'TyC Sports',
    category: 'Sports',
    iptvIds: ['TyCSports.ar', 'TyCSports2.ar'],
  },
  {
    id: 'd-sports',
    name: 'D Sports',
    category: 'Sports',
    iptvIds: ['DSportsUruguay.uy'],
  },
  {
    id: 'somoy-tv',
    name: 'Somoy TV',
    category: 'News',
    iptvIds: ['SomoyNewsTV.bd'],
  },
  {
    id: 'zee-bangla',
    name: 'Zee Bangla',
    category: 'Entertainment',
    iptvIds: ['AamarBangla.in', 'AnmolTV.in'],
  },
  {
    id: 'eurosport',
    name: 'Eurosport',
    category: 'Sports',
    iptvIds: ['TraceSportStars.fr', 'Africa24Sport.fr'],
  },
  {
    id: 'sky-sports-football',
    name: 'Sky Sports Football',
    category: 'Sports',
    iptvIds: ['talkSPORT.uk', 'MUTV.uk'],
  },
  {
    id: 'espn',
    name: 'ESPN',
    category: 'Sports',
    iptvIds: ['ESPN8TheOcho.us', 'ESPNDeportes.us'],
  },
  {
    id: 'fox-sports',
    name: 'Fox Sports',
    category: 'Sports',
    iptvIds: ['FoxSports2.us', 'FoxSports1.us', 'FoxSports.ar'],
  },
  {
    id: 'bbc-world-news',
    name: 'BBC World News',
    category: 'International',
    iptvIds: ['BBCNews.uk'],
  },
  {
    id: 'hbo',
    name: 'HBO Movies',
    category: 'Entertainment',
    iptvIds: ['HBO.us'],
    titleFallbacks: ['HBO Movies', 'HBO'],
  },
];

export const WORLD_CUP_CHANNEL_IDS = CHANNEL_CATALOG.filter((c) => c.category === 'Sports').map(
  (c) => c.id
);
