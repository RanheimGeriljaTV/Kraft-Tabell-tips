/**
 * OBOS-ligaen Data, Offisielle Klubber & Logoer
 * 16 lag med offisielle klubbmerker og gjeldende tabell
 */

const TEAMS = [
  {
    id: 'ranheim',
    name: 'Ranheim TF',
    shortName: 'RAN',
    city: 'Trondheim',
    primaryColor: '#003366',
    secondaryColor: '#38bdf8',
    textColor: '#ffffff',
    arena: 'EXTRA Arena',
    founded: 1901,
    isRanheim: true,
    fotmobId: 6563,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/6563.png'
  },
  {
    id: 'lillestrom',
    name: 'Lillestrøm SK',
    shortName: 'LSK',
    city: 'Lillestrøm',
    primaryColor: '#eab308',
    secondaryColor: '#171717',
    textColor: '#000000',
    arena: 'Åråsen Stadion',
    founded: 1917,
    fotmobId: 8476,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/8476.png'
  },
  {
    id: 'odd',
    name: 'Odds BK',
    shortName: 'ODD',
    city: 'Skien',
    primaryColor: '#f8fafc',
    secondaryColor: '#0f172a',
    textColor: '#000000',
    arena: 'Skagerak Arena',
    founded: 1894,
    fotmobId: 7988,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/7988.png'
  },
  {
    id: 'moss',
    name: 'Moss FK',
    shortName: 'MFK',
    city: 'Moss',
    primaryColor: '#eab308',
    secondaryColor: '#000000',
    textColor: '#000000',
    arena: 'Melløs Stadion',
    founded: 1906,
    fotmobId: 8405,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/8405.png'
  },
  {
    id: 'egersund',
    name: 'Egersunds IK',
    shortName: 'EIK',
    city: 'Egersund',
    primaryColor: '#facc15',
    secondaryColor: '#000000',
    textColor: '#000000',
    arena: 'B&G Parken',
    founded: 1919,
    fotmobId: 4722,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/4722.png'
  },
  {
    id: 'lyn',
    name: 'Lyn 1896 FK',
    shortName: 'LYN',
    city: 'Oslo',
    primaryColor: '#b91c1c',
    secondaryColor: '#1d4ed8',
    textColor: '#ffffff',
    arena: 'Bislett Stadion',
    founded: 1896,
    fotmobId: 10224,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/10224.png'
  },
  {
    id: 'kongsvinger',
    name: 'Kongsvinger IL',
    shortName: 'KIL',
    city: 'Kongsvinger',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    textColor: '#ffffff',
    arena: 'Gjemselund Stadion',
    founded: 1892,
    fotmobId: 8179,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/8179.png'
  },
  {
    id: 'stabaek',
    name: 'Stabæk Fotball',
    shortName: 'STB',
    city: 'Bærum',
    primaryColor: '#1d4ed8',
    secondaryColor: '#0284c7',
    textColor: '#ffffff',
    arena: 'Nadderud Stadion',
    founded: 1898,
    fotmobId: 9918,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/9918.png'
  },
  {
    id: 'raufoss',
    name: 'Raufoss Fotball',
    shortName: 'RAU',
    city: 'Raufoss',
    primaryColor: '#eab308',
    secondaryColor: '#000000',
    textColor: '#000000',
    arena: 'NAMMO Stadion',
    founded: 1918,
    fotmobId: 9812,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/9812.png'
  },
  {
    id: 'aalesund',
    name: 'Aalesunds FK',
    shortName: 'AaFK',
    city: 'Ålesund',
    primaryColor: '#ea580c',
    secondaryColor: '#1e3a8a',
    textColor: '#ffffff',
    arena: 'Color Line Stadion',
    founded: 1914,
    fotmobId: 8404,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/8404.png'
  },
  {
    id: 'aasane',
    name: 'Åsane Fotball',
    shortName: 'ÅSA',
    city: 'Bergen',
    primaryColor: '#f97316',
    secondaryColor: '#000000',
    textColor: '#ffffff',
    arena: 'Åsane Arena',
    founded: 1971,
    fotmobId: 10021,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/10021.png'
  },
  {
    id: 'start',
    name: 'IK Start',
    shortName: 'STA',
    city: 'Kristiansand',
    primaryColor: '#f59e0b',
    secondaryColor: '#171717',
    textColor: '#000000',
    arena: 'Sparebanken Sør Arena',
    founded: 1905,
    fotmobId: 9919,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/9919.png'
  },
  {
    id: 'sogndal',
    name: 'Sogndal Fotball',
    shortName: 'SOG',
    city: 'Sogndal',
    primaryColor: '#ffffff',
    secondaryColor: '#000000',
    textColor: '#000000',
    arena: 'Fosshaugane Campus',
    founded: 1926,
    fotmobId: 8616,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/8616.png'
  },
  {
    id: 'mjondalen',
    name: 'Mjøndalen IF',
    shortName: 'MIF',
    city: 'Mjøndalen',
    primaryColor: '#78350f',
    secondaryColor: '#ffffff',
    textColor: '#ffffff',
    arena: 'Consto Arena',
    founded: 1910,
    fotmobId: 6541,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/6541.png'
  },
  {
    id: 'hodd',
    name: 'IL Hødd',
    shortName: 'HØD',
    city: 'Ulsteinvik',
    primaryColor: '#2563eb',
    secondaryColor: '#ffffff',
    textColor: '#ffffff',
    arena: 'Høddvoll Stadion',
    founded: 1919,
    fotmobId: 7937,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/7937.png'
  },
  {
    id: 'skeid',
    name: 'Skeid Fotball',
    shortName: 'SKE',
    city: 'Oslo',
    primaryColor: '#dc2626',
    secondaryColor: '#1e40af',
    textColor: '#ffffff',
    arena: 'Nordre Åsen',
    founded: 1915,
    fotmobId: 8421,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/8421.png'
  }
];

// OBOS-soner
const ZONES = {
  DIRECT_PROMOTION: {
    id: 'direct_promotion',
    name: 'Direkte opprykk',
    badgeText: 'ELITESERIEN',
    colorClass: 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300',
    dotClass: 'bg-emerald-400',
    range: [1, 2]
  },
  PLAYOFF_PROMOTION: {
    id: 'playoff_promotion',
    name: 'Opprykkskvalik',
    badgeText: 'KVALIFISERING',
    colorClass: 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300',
    dotClass: 'bg-cyan-400',
    range: [3, 6]
  },
  SAFE: {
    id: 'safe',
    name: 'Sikker plass',
    badgeText: 'MIDTBANE',
    colorClass: 'border-slate-700/80 bg-slate-900/40 text-slate-400',
    dotClass: 'bg-slate-500',
    range: [7, 13]
  },
  PLAYOFF_RELEGATION: {
    id: 'playoff_relegation',
    name: 'Nedrykkskvalik',
    badgeText: 'FARE',
    colorClass: 'border-amber-500/80 bg-amber-950/40 text-amber-300',
    dotClass: 'bg-amber-400',
    range: [14, 14]
  },
  DIRECT_RELEGATION: {
    id: 'direct_relegation',
    name: 'Direkte nedrykk',
    badgeText: 'POSTNORD',
    colorClass: 'border-rose-500/80 bg-rose-950/40 text-rose-300',
    dotClass: 'bg-rose-500',
    range: [15, 16]
  }
};

function getZoneForPosition(position) {
  if (position <= 2) return ZONES.DIRECT_PROMOTION;
  if (position <= 6) return ZONES.PLAYOFF_PROMOTION;
  if (position <= 13) return ZONES.SAFE;
  if (position === 14) return ZONES.PLAYOFF_RELEGATION;
  return ZONES.DIRECT_RELEGATION;
}

function getTeamById(teamId) {
  return TEAMS.find(t => t.id === teamId) || null;
}

// Årets offisielle tabell (Utgangspunkt for sesongen)
const DEFAULT_FASIT = [
  'lillestrom',
  'odd',
  'moss',
  'egersund',
  'lyn',
  'kongsvinger',
  'stabaek',
  'raufoss',
  'aalesund',
  'ranheim',
  'aasane',
  'start',
  'sogndal',
  'mjondalen',
  'hodd',
  'skeid'
];

// Sesong-tidslinje for testing av runder
const SEASON_ROUNDS = [
  {
    id: 'round-0',
    roundNumber: 0,
    title: 'Offisiell Starttabell',
    dateLabel: 'Sesongstart',
    description: 'Offisiell tabell ved sesongstart. Alle 16 lag er klare.',
    standings: [...DEFAULT_FASIT]
  },
  {
    id: 'round-8',
    roundNumber: 8,
    title: 'Runde 8',
    dateLabel: 'Vårrunder',
    description: 'Ranheim har åpnet sterkt på EXTRA Arena og klatrer!',
    standings: [
      'lillestrom',
      'ranheim',
      'kongsvinger',
      'moss',
      'lyn',
      'egersund',
      'odd',
      'stabaek',
      'aalesund',
      'sogndal',
      'raufoss',
      'start',
      'hodd',
      'aasane',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'round-16',
    roundNumber: 16,
    title: 'Runde 16',
    dateLabel: 'Halvspilt',
    description: 'Sommerpause og jevn opprykksstrid.',
    standings: [
      'lillestrom',
      'kongsvinger',
      'ranheim',
      'odd',
      'moss',
      'lyn',
      'aalesund',
      'egersund',
      'stabaek',
      'sogndal',
      'raufoss',
      'start',
      'hodd',
      'aasane',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'round-24',
    roundNumber: 24,
    title: 'Runde 24',
    dateLabel: 'Høstinnspurt',
    description: 'Høstdrama om direkte opprykk og kvalifisering.',
    standings: [
      'lillestrom',
      'ranheim',
      'kongsvinger',
      'odd',
      'moss',
      'aalesund',
      'lyn',
      'egersund',
      'stabaek',
      'sogndal',
      'start',
      'raufoss',
      'hodd',
      'aasane',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'round-30',
    roundNumber: 30,
    title: 'Runde 30',
    dateLabel: 'Sluttabell',
    description: 'Sesongavslutning. Ranheim rykker opp til Eliteserien!',
    standings: [
      'ranheim',
      'lillestrom',
      'kongsvinger',
      'odd',
      'moss',
      'aalesund',
      'lyn',
      'egersund',
      'stabaek',
      'sogndal',
      'start',
      'raufoss',
      'hodd',
      'aasane',
      'mjondalen',
      'skeid'
    ]
  }
];

// Realistiske forhåndstips fra venner / kollegaer
const DEMO_PREDICTIONS = [
  {
    id: 'demo-1',
    author: 'Ola Tipsekonge',
    timestamp: '2026-03-25T14:30:00.000Z',
    table: [
      'lillestrom',
      'odd',
      'moss',
      'ranheim',
      'kongsvinger',
      'egersund',
      'lyn',
      'stabaek',
      'aalesund',
      'sogndal',
      'raufoss',
      'start',
      'aasane',
      'hodd',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'demo-2',
    author: 'Ranheim-Svein 💙',
    timestamp: '2026-03-25T15:10:00.000Z',
    table: [
      'ranheim',
      'lillestrom',
      'odd',
      'kongsvinger',
      'moss',
      'egersund',
      'lyn',
      'stabaek',
      'aalesund',
      'sogndal',
      'raufoss',
      'start',
      'hodd',
      'aasane',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'demo-3',
    author: 'Kari Taktikk',
    timestamp: '2026-03-25T16:05:00.000Z',
    table: [
      'lillestrom',
      'kongsvinger',
      'odd',
      'moss',
      'ranheim',
      'lyn',
      'egersund',
      'stabaek',
      'aalesund',
      'sogndal',
      'raufoss',
      'start',
      'hodd',
      'aasane',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'demo-4',
    author: 'Trønder-Bård',
    timestamp: '2026-03-25T17:20:00.000Z',
    table: [
      'lillestrom',
      'ranheim',
      'odd',
      'kongsvinger',
      'moss',
      'lyn',
      'egersund',
      'stabaek',
      'aalesund',
      'sogndal',
      'start',
      'raufoss',
      'hodd',
      'aasane',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'demo-5',
    author: 'Jonas T',
    timestamp: '2026-03-25T18:45:00.000Z',
    table: [
      'odd',
      'lillestrom',
      'kongsvinger',
      'moss',
      'ranheim',
      'lyn',
      'egersund',
      'stabaek',
      'aalesund',
      'start',
      'sogndal',
      'raufoss',
      'hodd',
      'aasane',
      'skeid',
      'mjondalen'
    ]
  },
  {
    id: 'demo-6',
    author: 'Petter Outlier',
    timestamp: '2026-03-25T19:00:00.000Z',
    table: [
      'skeid',
      'hodd',
      'start',
      'mjondalen',
      'aasane',
      'raufoss',
      'moss',
      'sogndal',
      'lyn',
      'odd',
      'stabaek',
      'ranheim',
      'egersund',
      'aalesund',
      'kongsvinger',
      'lillestrom'
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEAMS,
    DEFAULT_FASIT,
    ZONES,
    getZoneForPosition,
    getTeamById,
    SEASON_ROUNDS,
    DEMO_PREDICTIONS
  };
} else if (typeof window !== 'undefined') {
  window.TEAMS = TEAMS;
  window.DEFAULT_FASIT = DEFAULT_FASIT;
  window.ZONES = ZONES;
  window.getZoneForPosition = getZoneForPosition;
  window.getTeamById = getTeamById;
  window.SEASON_ROUNDS = SEASON_ROUNDS;
  window.DEMO_PREDICTIONS = DEMO_PREDICTIONS;
}
