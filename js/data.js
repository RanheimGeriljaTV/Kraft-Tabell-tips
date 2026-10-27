/**
 * OBOS-ligaen Data Definisjoner
 * 16 lag, farger, soner og realistiske demo-tips
 */

const TEAMS = [
  {
    id: 'ranheim',
    name: 'Ranheim TF',
    shortName: 'RAN',
    city: 'Trondheim',
    primaryColor: '#003366',
    secondaryColor: '#3b82f6',
    textColor: '#ffffff',
    arena: 'EXTRA Arena',
    isRanheim: true,
    logoText: '💙 RAN'
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
    logoText: '💛 LSK'
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
    logoText: '🧡 AaFK'
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
    logoText: '🟡 STA'
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
    logoText: '🔴 KIL'
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
    logoText: '💛 EIK'
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
    logoText: '🔴 LYN'
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
    logoText: '⚪ SOG'
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
    logoText: '⚪ ODD'
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
    logoText: '🔵 STB'
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
    logoText: '🔵 HØD'
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
    logoText: '🟠 ÅSA'
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
    logoText: '🟡 RAU'
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
    logoText: '🟡 MFK'
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
    logoText: '🟤 MIF'
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
    logoText: '🔴 SKE'
  }
];

// Standard fasit-tabell (reell tabell / startposisjon)
const DEFAULT_FASIT = [
  'lillestrom',
  'kongsvinger',
  'aalesund',
  'start',
  'ranheim',
  'egersund',
  'lyn',
  'sogndal',
  'odd',
  'stabaek',
  'hodd',
  'aasane',
  'raufoss',
  'moss',
  'mjondalen',
  'skeid'
];

// OBOS-soner
const ZONES = {
  DIRECT_PROMOTION: {
    name: 'Direkte opprykk',
    badgeText: 'ELITESERIEN',
    colorClass: 'border-emerald-500 bg-emerald-950/30 text-emerald-300',
    dotClass: 'bg-emerald-500',
    range: [1, 2]
  },
  PLAYOFF_PROMOTION: {
    name: 'Opprykkskvalik',
    badgeText: 'KVALIK',
    colorClass: 'border-blue-500 bg-blue-950/30 text-blue-300',
    dotClass: 'bg-blue-500',
    range: [3, 6]
  },
  SAFE: {
    name: 'Sikker plass',
    badgeText: 'MIDTBANE',
    colorClass: 'border-slate-700 bg-slate-900/30 text-slate-400',
    dotClass: 'bg-slate-500',
    range: [7, 13]
  },
  PLAYOFF_RELEGATION: {
    name: 'Nedrykkskvalik',
    badgeText: 'FARE',
    colorClass: 'border-amber-500 bg-amber-950/30 text-amber-300',
    dotClass: 'bg-amber-500',
    range: [14, 14]
  },
  DIRECT_RELEGATION: {
    name: 'Direkte nedrykk',
    badgeText: 'POSTNORD',
    colorClass: 'border-rose-600 bg-rose-950/30 text-rose-300',
    dotClass: 'bg-rose-500',
    range: [15, 16]
  }
};

/**
 * Hent sone basert på plassering (1-16)
 */
function getZoneForPosition(position) {
  if (position <= 2) return ZONES.DIRECT_PROMOTION;
  if (position <= 6) return ZONES.PLAYOFF_PROMOTION;
  if (position <= 13) return ZONES.SAFE;
  if (position === 14) return ZONES.PLAYOFF_RELEGATION;
  return ZONES.DIRECT_RELEGATION;
}

/**
 * Slå opp lagobjekt etter ID
 */
function getTeamById(teamId) {
  return TEAMS.find(t => t.id === teamId) || null;
}

// 6 Realistiske og morsomme demo-tips for gjengen ved oppstart
const DEMO_PREDICTIONS = [
  {
    id: 'demo-1',
    author: 'Ola Tipsekonge',
    timestamp: '2025-03-25T14:30:00.000Z',
    table: [
      'lillestrom',
      'kongsvinger',
      'aalesund',
      'ranheim',
      'start',
      'egersund',
      'lyn',
      'sogndal',
      'odd',
      'stabaek',
      'hodd',
      'aasane',
      'moss',
      'raufoss',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'demo-2',
    author: 'Ranheim-Svein 💙',
    timestamp: '2025-03-25T15:10:00.000Z',
    table: [
      'ranheim', // Svein tror Ranheim vinner OBOS!
      'lillestrom',
      'kongsvinger',
      'aalesund',
      'start',
      'egersund',
      'lyn',
      'sogndal',
      'stabaek',
      'odd',
      'hodd',
      'raufoss',
      'aasane',
      'moss',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'demo-3',
    author: 'Kari Taktikk',
    timestamp: '2025-03-25T16:05:00.000Z',
    table: [
      'lillestrom',
      'aalesund',
      'kongsvinger',
      'start',
      'ranheim',
      'egersund',
      'lyn',
      'odd',
      'sogndal',
      'stabaek',
      'hodd',
      'aasane',
      'raufoss',
      'moss',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'demo-4',
    author: 'Trønder-Bård',
    timestamp: '2025-03-25T17:20:00.000Z',
    table: [
      'lillestrom',
      'ranheim', // Direkte opprykk for Ranheim!
      'kongsvinger',
      'aalesund',
      'start',
      'egersund',
      'sogndal',
      'lyn',
      'odd',
      'stabaek',
      'hodd',
      'moss',
      'raufoss',
      'aasane',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'demo-5',
    author: 'Jonas Joker',
    timestamp: '2025-03-25T18:45:00.000Z',
    table: [
      'kongsvinger',
      'lillestrom',
      'start',
      'aalesund',
      'lyn',
      'ranheim',
      'egersund',
      'odd',
      'sogndal',
      'hodd',
      'stabaek',
      'aasane',
      'raufoss',
      'moss',
      'skeid',
      'mjondalen'
    ]
  },
  {
    id: 'demo-6',
    author: 'Mister Skivebom 💀',
    timestamp: '2025-03-25T19:00:00.000Z',
    table: [
      'skeid', // Skeid tippet øverst!
      'start',
      'hodd',
      'mjondalen',
      'aasane',
      'raufoss',
      'moss',
      'sogndal',
      'lyn',
      'odd',
      'stabaek',
      'ranheim', // Ranheim på 12.
      'egersund',
      'aalesund',
      'kongsvinger',
      'lillestrom' // Lillestrøm tippet sist!
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
    DEMO_PREDICTIONS
  };
} else if (typeof window !== 'undefined') {
  window.TEAMS = TEAMS;
  window.DEFAULT_FASIT = DEFAULT_FASIT;
  window.ZONES = ZONES;
  window.getZoneForPosition = getZoneForPosition;
  window.getTeamById = getTeamById;
  window.DEMO_PREDICTIONS = DEMO_PREDICTIONS;
}
