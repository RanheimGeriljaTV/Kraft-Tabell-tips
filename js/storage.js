/**
 * OBOS-ligaen Lagring & Synkronisering
 * Håndterer localStorage, JSON eksport/import og Google Sheets integrasjon
 */

const STORAGE_KEYS = {
  TIPS: 'ranheim_obos_tips_v1',
  FASIT: 'ranheim_obos_fasit_v1',
  AUTH: 'ranheim_obos_auth_token_v1',
  ACTIVE_SYSTEM: 'ranheim_obos_scoring_system_v1'
};

const StorageManager = {
  /**
   * Initialiser lagring med standarddata hvis tomt
   */
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.TIPS)) {
      this.resetToDemo();
    }
    if (!localStorage.getItem(STORAGE_KEYS.FASIT)) {
      this.saveFasit(window.DEFAULT_FASIT || []);
    }
  },

  /**
   * Hent alle lagrede tips
   */
  getTips() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIPS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Feil ved lesing av tips fra localStorage', e);
      return [];
    }
  },

  /**
   * Lagre eller oppdater et tips
   * @param {string} author - Kallenavn
   * @param {Array<string>} table - 16 lag-ID-er
   * @param {string|null} existingId - ID hvis redigering
   */
  saveTip(author, table, existingId = null) {
    if (!author || !author.trim()) {
      throw new Error('Vennligst skriv inn et navn eller kallenavn!');
    }
    if (!table || table.length !== 16) {
      throw new Error('Tabellen må inneholde nøyaktig 16 lag!');
    }

    const tips = this.getTips();
    const cleanAuthor = author.trim();
    const now = new Date().toISOString();

    let savedTip;

    if (existingId) {
      const index = tips.findIndex(t => t.id === existingId);
      if (index !== -1) {
        tips[index] = {
          ...tips[index],
          author: cleanAuthor,
          table: [...table],
          updatedAt: now
        };
        savedTip = tips[index];
      }
    }

    // Hvis ikke funnet eller ny
    if (!savedTip) {
      // Sjekk om samme navn finnes fra før for å tilby overskriving
      const existingByNameIndex = tips.findIndex(t => t.author.toLowerCase() === cleanAuthor.toLowerCase());
      if (existingByNameIndex !== -1) {
        tips[existingByNameIndex] = {
          ...tips[existingByNameIndex],
          table: [...table],
          updatedAt: now
        };
        savedTip = tips[existingByNameIndex];
      } else {
        savedTip = {
          id: 'tip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          author: cleanAuthor,
          table: [...table],
          createdAt: now,
          updatedAt: now
        };
        tips.push(savedTip);
      }
    }

    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(tips));

    // Prøv sky-synk i bakgrunnen hvis konfigurert
    this.pushTipToCloud(savedTip).catch(err => {
      console.warn('Sky-synk feilet (bruker lokal lagring):', err);
    });

    return savedTip;
  },

  /**
   * Slett ett tips etter ID
   */
  deleteTip(id) {
    const tips = this.getTips().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(tips));
  },

  /**
   * Nullstill til demo-tips
   */
  resetToDemo() {
    const demo = window.DEMO_PREDICTIONS || [];
    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(demo));
    return demo;
  },

  /**
   * Tøm alle tips
   */
  clearAllTips() {
    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify([]));
  },

  /**
   * Hent gjeldende fasit
   */
  getFasit() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FASIT);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length === 16) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Feil ved lesing av fasit', e);
    }
    return window.DEFAULT_FASIT || [];
  },

  /**
   * Lagre ny fasit
   */
  saveFasit(fasitTable) {
    if (!Array.isArray(fasitTable) || fasitTable.length !== 16) {
      throw new Error('Fasit må bestå av nøyaktig 16 lag!');
    }
    localStorage.setItem(STORAGE_KEYS.FASIT, JSON.stringify(fasitTable));

    // Sky-synk av fasit
    this.pushFasitToCloud(fasitTable).catch(err => {
      console.warn('Sky-synk av fasit feilet:', err);
    });
  },

  /**
   * Hent lagret poengsystem
   */
  getActiveSystem() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SYSTEM) || 'innertier';
  },

  /**
   * Lagre aktivt poengsystem
   */
  saveActiveSystem(systemKey) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SYSTEM, systemKey);
  },

  /**
   * Adgangskontroll: Sjekk om bruker er låst opp
   */
  isAuthenticated() {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'unlocked_true';
  },

  /**
   * Lås opp bruker
   */
  setAuthenticated(valid = true) {
    if (valid) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'unlocked_true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  },

  /**
   * Eksport av alle data til nedlastbar JSON
   */
  exportToJson() {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      community: (window.CONFIG && window.CONFIG.COMMUNITY_NAME) || 'Ranheim Kraft',
      fasit: this.getFasit(),
      tips: this.getTips()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranheim-tabelltips-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Importer data fra opplastet JSON-tekst
   */
  importFromJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || (!parsed.tips && !Array.isArray(parsed))) {
        throw new Error('Ugyldig filformat! Finner ingen tabelltips i filen.');
      }

      const importedTips = parsed.tips || parsed;
      if (Array.isArray(importedTips)) {
        localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(importedTips));
      }
      if (parsed.fasit && Array.isArray(parsed.fasit) && parsed.fasit.length === 16) {
        localStorage.setItem(STORAGE_KEYS.FASIT, JSON.stringify(parsed.fasit));
      }
      return true;
    } catch (e) {
      console.error('Importfeil:', e);
      throw e;
    }
  },

  /**
   * Google Apps Script: Send inn tips til felles sky-ark
   */
  async pushTipToCloud(tip) {
    const url = window.CONFIG && window.CONFIG.GOOGLE_SCRIPT_URL;
    if (!url || !url.startsWith('https://')) return;

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'save_tip', tip })
      });
    } catch (err) {
      console.warn('Kunne ikke sende tips til Google Sheets:', err);
    }
  },

  /**
   * Google Apps Script: Send inn oppdatert fasit
   */
  async pushFasitToCloud(fasit) {
    const url = window.CONFIG && window.CONFIG.GOOGLE_SCRIPT_URL;
    if (!url || !url.startsWith('https://')) return;

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'save_fasit', fasit })
      });
    } catch (err) {
      console.warn('Kunne ikke sende fasit til Google Sheets:', err);
    }
  },

  /**
   * Google Apps Script: Hent alle tips og fasit fra skyen
   */
  async syncFromCloud() {
    const url = window.CONFIG && window.CONFIG.GOOGLE_SCRIPT_URL;
    if (!url || !url.startsWith('https://')) return false;

    try {
      const response = await fetch(url + '?action=get_all');
      if (!response.ok) return false;
      const data = await response.json();

      if (data && data.tips && Array.isArray(data.tips)) {
        localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(data.tips));
      }
      if (data && data.fasit && Array.isArray(data.fasit) && data.fasit.length === 16) {
        localStorage.setItem(STORAGE_KEYS.FASIT, JSON.stringify(data.fasit));
      }
      return true;
    } catch (err) {
      console.warn('Feil under synking fra Google Sheets:', err);
      return false;
    }
  }
};

// Initialiser ved lasting
StorageManager.init();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
} else if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
