/**
 * OBOS-ligaen Data & Sesong-Historikk
 * 16 lag, farger, soner, mockup-runder og demotips
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
    badgeEmoji: '💙',
    pattern: 'from-[#003366] to-[#0284c7]'
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
    badgeEmoji: '💛',
    pattern: 'from-yellow-400 to-amber-600'
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
    badgeEmoji: '🧡',
    pattern: 'from-orange-500 to-blue-900'
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
    badgeEmoji: '🟡',
    pattern: 'from-amber-400 to-yellow-600'
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
    badgeEmoji: '🔴',
    pattern: 'from-red-600 to-rose-800'
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
    badgeEmoji: '🐯',
    pattern: 'from-yellow-400 to-yellow-600'
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
    badgeEmoji: '⚡',
    pattern: 'from-red-600 to-blue-700'
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
    badgeEmoji: '⚪',
    pattern: 'from-slate-100 to-slate-400'
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
    badgeEmoji: '🏹',
    pattern: 'from-slate-200 to-slate-500'
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
    badgeEmoji: '🔵',
    pattern: 'from-blue-600 to-sky-700'
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
    badgeEmoji: '🌊',
    pattern: 'from-blue-500 to-indigo-700'
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
    badgeEmoji: '🟠',
    pattern: 'from-orange-500 to-amber-700'
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
    badgeEmoji: '🟡',
    pattern: 'from-yellow-500 to-amber-700'
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
    badgeEmoji: '🦅',
    pattern: 'from-amber-400 to-stone-800'
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
    badgeEmoji: '🟤',
    pattern: 'from-amber-800 to-stone-900'
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
    badgeEmoji: '🔴',
    pattern: 'from-red-600 to-blue-800'
  }
];

// OBOS-soner
const ZONES = {
  DIRECT_PROMOTION: {
    id: 'direct_promotion',
    name: 'Direkte opprykk',
    badgeText: 'ELITESERIEN',
    colorClass: 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300 shadow-emerald-950/50',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    dotClass: 'bg-emerald-400',
    range: [1, 2]
  },
  PLAYOFF_PROMOTION: {
    id: 'playoff_promotion',
    name: 'Opprykkskvalik',
    badgeText: 'KVALIK',
    colorClass: 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300 shadow-cyan-950/50',
    glowClass: 'shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    dotClass: 'bg-cyan-400',
    range: [3, 6]
  },
  SAFE: {
    id: 'safe',
    name: 'Sikker plass',
    badgeText: 'MIDTBANE',
    colorClass: 'border-slate-700/80 bg-slate-900/40 text-slate-400 shadow-none',
    glowClass: '',
    dotClass: 'bg-slate-500',
    range: [7, 13]
  },
  PLAYOFF_RELEGATION: {
    id: 'playoff_relegation',
    name: 'Nedrykkskvalik',
    badgeText: 'FAREKVALIK',
    colorClass: 'border-amber-500/80 bg-amber-950/40 text-amber-300 shadow-amber-950/50',
    glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    dotClass: 'bg-amber-400',
    range: [14, 14]
  },
  DIRECT_RELEGATION: {
    id: 'direct_relegation',
    name: 'Direkte nedrykk',
    badgeText: 'POSTNORD',
    colorClass: 'border-rose-500/80 bg-rose-950/40 text-rose-300 shadow-rose-950/50',
    glowClass: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]',
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

// Standard fasit-tabell (før sesongstart / utgangspunkt)
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

// Mockup Sesong-tidslinje med runder
const SEASON_ROUNDS = [
  {
    id: 'round-0',
    roundNumber: 0,
    title: 'Før Seriestart',
    dateLabel: 'Mars 2026',
    description: 'Tabelltipsene er levert inn. Ingen kamper er spilt ennå.',
    standings: [...DEFAULT_FASIT]
  },
  {
    id: 'round-8',
    roundNumber: 8,
    title: 'Runde 8 (Vårstart)',
    dateLabel: 'Mai 2026',
    description: 'Ranheim har åpnet sterkt på EXTRA Arena! Lillestrøm leder, mens Skeid sliter.',
    standings: [
      'lillestrom',
      'ranheim',     // Ranheim opp på 2. plass!
      'kongsvinger',
      'aalesund',
      'lyn',
      'start',
      'egersund',
      'sogndal',
      'stabaek',
      'odd',
      'hodd',
      'raufoss',
      'moss',
      'aasane',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'round-16',
    roundNumber: 16,
    title: 'Runde 16 (Halvspilt)',
    dateLabel: 'Juli 2026',
    description: 'Sommerpause! Knalltøff opprykksstrid. Ranheim henger med i toppen.',
    standings: [
      'lillestrom',
      'kongsvinger',
      'ranheim',     // Ranheim på 3. (kvalik)
      'start',
      'aalesund',
      'lyn',
      'egersund',
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
    id: 'round-24',
    roundNumber: 24,
    title: 'Runde 24 (Høstdrama)',
    dateLabel: 'September 2026',
    description: 'Gullfeber og nedrykksnerver! Ranheim knuser rivalene og inntar direkte opprykk.',
    standings: [
      'lillestrom',
      'ranheim',     // Ranheim på 2. plass!
      'aalesund',
      'kongsvinger',
      'start',
      'egersund',
      'lyn',
      'odd',
      'sogndal',
      'stabaek',
      'hodd',
      'moss',
      'aasane',
      'raufoss',
      'mjondalen',
      'skeid'
    ]
  },
  {
    id: 'round-30',
    roundNumber: 30,
    title: 'Runde 30 (Sluttabell)',
    dateLabel: 'November 2026',
    description: 'Sesongen er avgjort! Ranheim rykker opp til Eliteserien!',
    standings: [
      'ranheim',     // Ranheim SERIEMESTER!
      'lillestrom',
      'kongsvinger',
      'aalesund',
      'start',
      'lyn',
      'egersund',
      'sogndal',
      'odd',
      'stabaek',
      'hodd',
      'aasane',
      'raufoss',
      'moss',
      'mjondalen',
      'skeid'
    ]
  }
];

// 6 Varierte demotips fra vennegjengen
const DEMO_PREDICTIONS = [
  {
    id: 'demo-1',
    author: 'Ola Tipsekonge',
    timestamp: '2026-03-25T14:30:00.000Z',
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
    timestamp: '2026-03-25T15:10:00.000Z',
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
    timestamp: '2026-03-25T16:05:00.000Z',
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
    timestamp: '2026-03-25T17:20:00.000Z',
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
    author: 'Jonas Joker 🃏',
    timestamp: '2026-03-25T18:45:00.000Z',
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
    timestamp: '2026-03-25T19:00:00.000Z',
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
