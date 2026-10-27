/**
 * Konfigurasjon for OBOS Tabell-tipper & Resultattavle
 * Skreddersydd for ranheimkraft.no
 */

const CONFIG = {
  // Gruppe-adgangskode for vennegjengen (kan også sendes som ?kode=ranheim1901 i URL)
  ACCESS_CODE: 'ranheim1901',

  // Admin-PIN for å redigere Fasit-tabell eller slette/nullstille data
  ADMIN_PIN: '1901',

  // Valgfri Google Apps Script Web App URL for felles sanntids-sky-synkronisering på tvers av enheter.
  // La stå tom '' for å kun bruke lokal lagring (localStorage) og manuell JSON-backup.
  GOOGLE_SCRIPT_URL: '',

  // Merkevare og tittel
  APP_TITLE: 'OBOS-ligaen Tabell-tipper',
  APP_SUBTITLE: 'Ranheim Kraft Vennegjeng & Kollegatabell',
  COMMUNITY_NAME: 'Ranheim Kraft',
  RANHEIM_TEAM_ID: 'ranheim'
};

// Eksporter for bruk i ES-moduler eller global window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
