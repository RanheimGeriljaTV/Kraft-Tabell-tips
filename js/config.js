/**
 * Konfigurasjon for OBOS Tabell-tipper & Resultattavle
 * Skreddersydd for ranheimkraft.no
 */

const CONFIG = {
  // Gruppe-adgangskode for vennegjengen (kan også sendes som ?kode=ranheim1901 i URL)
  ACCESS_CODE: 'ranheim1901',

  // Admin-PIN for fasit-redigering, tømming og mockup-styring
  ADMIN_PIN: '1901',

  // Dato og tid for seriestart når tipping automatisk stenges (ISO format)
  // For neste sesong: 5. april kl. 15:00
  SEASON_START_DEADLINE: '2026-04-05T15:00:00',

  // Mockup-overstyring av sperre:
  // 'auto' = følger reell klokke mot SEASON_START_DEADLINE
  // 'locked' = simuler at ligaen er i gang (låst)
  // 'open' = simuler før seriestart (åpen for tipping)
  LOCKDOWN_OVERRIDE: 'open',

  // Valgfri Google Apps Script Web App URL for felles sanntids-sky-synkronisering
  GOOGLE_SCRIPT_URL: '',

  // Valgfri Supabase-konfigurasjon for felles sky-synkronisering
  // Opprett et prosjekt på https://supabase.com, kjør SQL-skjemaet (se README), og fyll inn:
  SUPABASE_URL: 'https://cuspqdbjyrywmvherpca.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1c3BxZGJqeXJ5d212aGVycGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MTQ4ODksImV4cCI6MjEwODk5MDg4OX0.gMwKsZVysmButhdPeuyaXmi9oFPM4fqko2qq-DMNuUs',

  // Merkevare og sesong
  APP_TITLE: 'OBOS Tabell-tipper',
  APP_SUBTITLE: 'Ranheim Kraft Vennegjeng & Kollegatabell',
  SEASON_LABEL: 'Sesongen 2026',
  COMMUNITY_NAME: 'Ranheim Kraft',
  RANHEIM_TEAM_ID: 'ranheim'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
