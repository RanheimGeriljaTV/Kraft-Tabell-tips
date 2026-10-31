/**
 * OBOS-ligaen 2026 Data, Offisielle Klubber, Logoer & Live Tabell
 * 16 lag med offisielle klubbmerker og live tabell (Runde 28)
 */

const TEAMS = [
  {
    id: 'ranheim',
    name: 'Ranheim',
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
    id: 'haugesund',
    name: 'FK Haugesund',
    shortName: 'FKH',
    city: 'Haugesund',
    primaryColor: '#002d62',
    secondaryColor: '#ffffff',
    textColor: '#ffffff',
    arena: 'Haugesund Sparebank Arena',
    founded: 1993,
    fotmobId: 8512,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/8512.png'
  },
  {
    id: 'stromsgodset',
    name: 'Strømsgodset IF',
    shortName: 'SIF',
    city: 'Drammen',
    primaryColor: '#002244',
    secondaryColor: '#38bdf8',
    textColor: '#ffffff',
    arena: 'Marienlyst Stadion',
    founded: 1907,
    fotmobId: 8180,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/8180.png'
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
    id: 'bryne',
    name: 'Bryne FK',
    shortName: 'BRY',
    city: 'Bryne',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    textColor: '#ffffff',
    arena: 'Bryne Stadion',
    founded: 1926,
    fotmobId: 8531,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/8531.png'
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
    id: 'strommen',
    name: 'Strømmen IF',
    shortName: 'STR',
    city: 'Strømmen',
    primaryColor: '#808080',
    secondaryColor: '#dc2626',
    textColor: '#ffffff',
    arena: 'Strømmen Stadion',
    founded: 1911,
    fotmobId: 4249,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/4249.png'
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
    id: 'sandnesulf',
    name: 'Sandnes Ulf',
    shortName: 'ULF',
    city: 'Sandnes',
    primaryColor: '#38bdf8',
    secondaryColor: '#ffffff',
    textColor: '#000000',
    arena: 'Øster Hus Arena',
    founded: 1911,
    fotmobId: 8133,
    logoUrl: 'https://images.fotmob.com/image_resources/logo/teamlogo/8133.png'
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

// ÅRETS EKT LIVE-TABELL 2026 (Etter 28 runder spilt)
const LIVE_TABLE_DETAILS_2026 = [
  { id: 'haugesund', rank: 1, played: 28, won: 20, draw: 2, lost: 6, goals: '81–47', points: 62 },
  { id: 'stromsgodset', rank: 2, played: 28, won: 18, draw: 6, lost: 4, goals: '76–34', points: 60 },
  { id: 'kongsvinger', rank: 3, played: 28, won: 18, draw: 5, lost: 5, goals: '82–45', points: 59 },
  { id: 'stabaek', rank: 4, played: 28, won: 17, draw: 4, lost: 7, goals: '66–34', points: 55 },
  { id: 'odd', rank: 5, played: 28, won: 13, draw: 6, lost: 9, goals: '54–43', points: 45 },
  { id: 'bryne', rank: 6, played: 28, won: 12, draw: 4, lost: 12, goals: '40–41', points: 40 },
  { id: 'ranheim', rank: 7, played: 28, won: 11, draw: 5, lost: 12, goals: '71–68', points: 38 },
  { id: 'hodd', rank: 8, played: 28, won: 11, draw: 5, lost: 12, goals: '49–56', points: 38 },
  { id: 'strommen', rank: 9, played: 28, won: 10, draw: 6, lost: 12, goals: '49–59', points: 36 },
  { id: 'egersund', rank: 10, played: 28, won: 9, draw: 8, lost: 11, goals: '45–56', points: 35 },
  { id: 'lyn', rank: 11, played: 28, won: 9, draw: 4, lost: 15, goals: '42–59', points: 31 },
  { id: 'sogndal', rank: 12, played: 28, won: 8, draw: 6, lost: 14, goals: '47–61', points: 30 },
  { id: 'sandnesulf', rank: 13, played: 28, won: 8, draw: 5, lost: 15, goals: '39–55', points: 29 },
  { id: 'moss', rank: 14, played: 28, won: 8, draw: 5, lost: 15, goals: '41–59', points: 29 },
  { id: 'aasane', rank: 15, played: 28, won: 7, draw: 5, lost: 16, goals: '40–62', points: 25 },
  { id: 'raufoss', rank: 16, played: 28, won: 6, draw: 2, lost: 20, goals: '31–74', points: 20 }
];

// Standard fasittabell for appen (nøyaktig gjeldende reell tabell)
const DEFAULT_FASIT = LIVE_TABLE_DETAILS_2026.map(item => item.id);

// Realistiske mockup-tips for 2026-sesongen
const DEMO_PREDICTIONS = [
  {
    id: 'demo-1',
    author: 'Ola Tipsekonge',
    timestamp: '2026-03-25T14:30:00.000Z',
    table: [
      'haugesund',
      'stromsgodset',
      'kongsvinger',
      'stabaek',
      'odd',
      'ranheim',
      'bryne',
      'hodd',
      'strommen',
      'egersund',
      'lyn',
      'sogndal',
      'moss',
      'sandnesulf',
      'aasane',
      'raufoss'
    ]
  },
  {
    id: 'demo-2',
    author: 'Ranheim-Svein 💙',
    timestamp: '2026-03-25T15:10:00.000Z',
    table: [
      'ranheim',     // Svein tippet Ranheim på 1. plass!
      'haugesund',
      'stromsgodset',
      'kongsvinger',
      'stabaek',
      'odd',
      'bryne',
      'hodd',
      'egersund',
      'lyn',
      'strommen',
      'sogndal',
      'sandnesulf',
      'moss',
      'aasane',
      'raufoss'
    ]
  },
  {
    id: 'demo-3',
    author: 'Kari Taktikk',
    timestamp: '2026-03-25T16:05:00.000Z',
    table: [
      'kongsvinger',
      'haugesund',
      'stromsgodset',
      'stabaek',
      'ranheim',
      'odd',
      'bryne',
      'egersund',
      'hodd',
      'lyn',
      'strommen',
      'sogndal',
      'moss',
      'sandnesulf',
      'aasane',
      'raufoss'
    ]
  },
  {
    id: 'demo-4',
    author: 'Trønder-Bård',
    timestamp: '2026-03-25T17:20:00.000Z',
    table: [
      'stromsgodset',
      'ranheim',     // Direkte opprykk for Ranheim!
      'haugesund',
      'kongsvinger',
      'stabaek',
      'odd',
      'bryne',
      'hodd',
      'egersund',
      'lyn',
      'strommen',
      'sogndal',
      'sandnesulf',
      'moss',
      'aasane',
      'raufoss'
    ]
  },
  {
    id: 'demo-5',
    author: 'Jonas T',
    timestamp: '2026-03-25T18:45:00.000Z',
    table: [
      'stabaek',
      'haugesund',
      'stromsgodset',
      'kongsvinger',
      'odd',
      'bryne',
      'ranheim',
      'egersund',
      'hodd',
      'lyn',
      'sogndal',
      'strommen',
      'sandnesulf',
      'moss',
      'raufoss',
      'aasane'
    ]
  },
  {
    id: 'demo-6',
    author: 'Petter Outlier',
    timestamp: '2026-03-25T19:00:00.000Z',
    table: [
      'raufoss',
      'aasane',
      'moss',
      'sandnesulf',
      'sogndal',
      'lyn',
      'egersund',
      'strommen',
      'hodd',
      'ranheim',
      'bryne',
      'odd',
      'stabaek',
      'kongsvinger',
      'stromsgodset',
      'haugesund'
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
    LIVE_TABLE_DETAILS_2026,
    DEMO_PREDICTIONS
  };
} else if (typeof window !== 'undefined') {
  window.TEAMS = TEAMS;
  window.DEFAULT_FASIT = DEFAULT_FASIT;
  window.ZONES = ZONES;
  window.getZoneForPosition = getZoneForPosition;
  window.getTeamById = getTeamById;
  window.LIVE_TABLE_DETAILS_2026 = LIVE_TABLE_DETAILS_2026;
  window.DEMO_PREDICTIONS = DEMO_PREDICTIONS;
}
