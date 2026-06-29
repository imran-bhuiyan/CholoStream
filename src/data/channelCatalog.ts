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
    iptvIds: ['FIFAPlus.uk', 'FIFAPlusWomen.uk'],
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
    iptvIds: ['TSN1.ca', 'TSN1.mt'],
    titleFallbacks: ['TSN1'],
  },
  {
    id: 'tsn-2',
    name: 'TSN Sports 2',
    category: 'Sports',
    iptvIds: ['TSN2.ca', 'TSN2.mt'],
    titleFallbacks: ['TSN2'],
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
    id: 'itv-1',
    name: 'ITV 1',
    category: 'Sports',
    iptvIds: ['ITV1.uk', 'ITV1London.uk'],
  },
  {
    id: 'tf1',
    name: 'TF1',
    category: 'Sports',
    iptvIds: ['TF1.fr', 'TF1Suisse.ch'],
  },
  {
    id: 'ard',
    name: 'Das Erste (ARD)',
    category: 'Sports',
    iptvIds: ['DasErste.de'],
  },
  {
    id: 'zdf',
    name: 'ZDF',
    category: 'Sports',
    iptvIds: ['ZDF.de'],
  },
  {
    id: 'rai-1',
    name: 'Rai 1',
    category: 'Sports',
    iptvIds: ['Rai1.it'],
  },
  {
    id: 'npo-1',
    name: 'NPO 1',
    category: 'Sports',
    iptvIds: ['NPO1.nl'],
  },
  {
    id: 'rtve-1',
    name: 'La 1 (RTVE)',
    category: 'Sports',
    iptvIds: ['La1.es'],
  },
  {
    id: 'bbc-one',
    name: 'BBC One',
    category: 'Sports',
    iptvIds: ['BBCOne.uk'],
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
    id: 't-sports',
    name: 'T Sports',
    category: 'Sports',
    iptvIds: ['TSports.bd'],
    titleFallbacks: ['T Sports'],
  },
  {
    id: 'btv-national',
    name: 'BTV National',
    category: 'Sports',
    iptvIds: ['BTVNational.bd', 'BTVWorld.bd'],
    titleFallbacks: ['BTV', 'BTV National', 'BTV World'],
  },
  {
    id: 'rtb-go',
    name: 'RTB Go',
    category: 'Sports',
    iptvIds: ['RTBGo.bn', 'RTBAneka.bn', 'RTBSukmaindera.bn'],
    titleFallbacks: ['RTB Go', 'RTB Aneka', 'RTB Sukmaindera'],
  },

  {
    id: 'caracol-tv',
    name: 'Caracol TV',
    category: 'Sports',
    iptvIds: ['CaracolTV.co', 'CaracolTV2.co', 'CaracolTV.us', 'CaracolInternacional.co'],
    titleFallbacks: ['Caracol TV', 'Caracol Television', 'caracoltv', 'caracol'],
  },
  {
    id: 'telemundo',
    name: 'Telemundo',
    category: 'Sports',
    iptvIds: ['TelemundoInternacional.us', 'TelemundoAlDia.us'],
    titleFallbacks: ['Telemundo'],
  },
  {
    id: 'tv-publica',
    name: 'TV Pública Argentina',
    category: 'Sports',
    iptvIds: ['TVPublica.ar'],
    titleFallbacks: ['TV Publica', 'Television Publica'],
  },
];

export const WORLD_CUP_CHANNEL_IDS = CHANNEL_CATALOG.filter((c) => c.category === 'Sports').map(
  (c) => c.id
);
