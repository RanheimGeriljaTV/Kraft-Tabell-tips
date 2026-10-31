/**
 * OBOS-ligaen Lagring, Synkronisering & API Integrasjon (v3)
 * Håndterer localStorage, JSON eksport/import, live API og Google Sheets
 */

const STORAGE_KEYS = {
  TIPS: 'ranheim_obos_tips_v4',
  FASIT: 'ranheim_obos_fasit_v4',
  AUTH: 'ranheim_obos_auth_token_v4',
  ACTIVE_SYSTEM: 'ranheim_obos_scoring_system_v4',
  USER_NICKNAME: 'ranheim_active_user_name',
  USER_EMAIL: 'ranheim_active_user_email'
};

const StorageManager = {
  init() {
    const hasCloud = window.CONFIG && window.CONFIG.SUPABASE_URL && window.CONFIG.SUPABASE_URL.startsWith('https://');
    if (!localStorage.getItem(STORAGE_KEYS.TIPS)) {
      if (hasCloud) {
        localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify([]));
      } else {
        this.resetToDemo();
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.FASIT)) {
      this.saveFasit(window.DEFAULT_FASIT || []);
    }
  },

  getActiveUser() {
    return {
      nickname: localStorage.getItem(STORAGE_KEYS.USER_NICKNAME) || '',
      email: localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || ''
    };
  },

  setActiveUser(nickname, email) {
    if (nickname && nickname.trim()) {
      localStorage.setItem(STORAGE_KEYS.USER_NICKNAME, nickname.trim());
    }
    if (email && email.trim()) {
      localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email.trim().toLowerCase());
    }
  },

  getTips() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIPS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Feil ved lesing av tips fra localStorage', e);
      return [];
    }
  },

  getUserTip(email, nickname) {
    const tips = this.getTips();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanNick = (nickname || '').trim().toLowerCase();
    if (cleanEmail) {
      const byEmail = tips.find(t => t.userEmail && t.userEmail.toLowerCase() === cleanEmail);
      if (byEmail) return byEmail;
    }
    if (cleanNick) {
      const byNick = tips.find(t => t.author && t.author.toLowerCase() === cleanNick);
      if (byNick) return byNick;
    }
    return null;
  },

  /**
   * Validerer duplikater ved innlogging / registrering
   */
  validateRegistrationCredentials(nickname, email) {
    const cleanNick = (nickname || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const tips = this.getTips() || [];

    // 1. Sjekk om kallenavnet allerede tilhører en annen e-post
    if (cleanNick) {
      for (const t of tips) {
        if (t.author && t.author.trim().toLowerCase() === cleanNick.toLowerCase()) {
          if (cleanEmail && t.userEmail && t.userEmail.trim().toLowerCase() !== cleanEmail) {
            return {
              valid: false,
              error: `Kallenavnet "${cleanNick}" er allerede opptatt av en annen deltaker! Vennligst velg et annet kallenavn.`
            };
          }
        }
      }
    }

    // 2. Sjekk om e-posten allerede er registrert med et annet kallenavn
    if (cleanEmail) {
      for (const t of tips) {
        if (t.userEmail && t.userEmail.trim().toLowerCase() === cleanEmail) {
          if (cleanNick && t.author && t.author.trim().toLowerCase() !== cleanNick.toLowerCase()) {
            return {
              valid: false,
              error: `E-posten "${cleanEmail}" er allerede registrert på kallenavnet "${t.author}". Skriv inn ditt kallenavn for å logge inn.`
            };
          }
        }
      }
    }

    return { valid: true };
  },

  /**
   * Validerer at kallenavn og e-post er unike før lagring av tips
   */
  validateTipCredentials(author, email, currentTipId = null) {
    const cleanAuthor = (author || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const tips = this.getTips() || [];

    if (!cleanAuthor) {
      return { valid: false, error: 'Vennligst skriv inn et kallenavn!' };
    }

    for (const t of tips) {
      if (currentTipId && t.id === currentTipId) continue;

      // Kallenavn-duplikatbeskyttelse (case-insensitive)
      if (t.author && t.author.trim().toLowerCase() === cleanAuthor.toLowerCase()) {
        if (cleanEmail && t.userEmail && t.userEmail.trim().toLowerCase() !== cleanEmail) {
          return {
            valid: false,
            error: `🔒 Kallenavnet "${cleanAuthor}" er allerede opptatt av en annen deltaker! Vennligst velg et unikt kallenavn.`
          };
        }
      }

      // E-post duplikatbeskyttelse (én deltaker = ett tips)
      if (cleanEmail && t.userEmail && t.userEmail.trim().toLowerCase() === cleanEmail) {
        if (t.author && t.author.trim().toLowerCase() !== cleanAuthor.toLowerCase()) {
          return {
            valid: false,
            error: `🔒 E-postadressen "${cleanEmail}" har allerede levert et tips under kallenavnet "${t.author}". Hver deltaker kan kun levere ett tips.`
          };
        }
      }
    }

    return { valid: true };
  },

  saveTip(author, table, existingId = null, userEmail = null) {
    if (this.isSeasonLocked() && !this.isAdmin()) {
      throw new Error('🔒 Tippingen er stengt for sesongen! Ingen endringer kan gjøres etter seriestart.');
    }

    if (!author || !author.trim()) {
      throw new Error('Vennligst skriv inn et navn eller kallenavn!');
    }
    if (!this.isValidTable(table)) {
      throw new Error('Tabellen må inneholde alle 16 offisielle lag i OBOS-ligaen!');
    }

    const cleanAuthor = author.trim();
    const cleanEmail = (userEmail || localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || '').trim().toLowerCase();

    // Sjekk duplikater før lagring
    const credCheck = this.validateTipCredentials(cleanAuthor, cleanEmail, existingId);
    if (!credCheck.valid) {
      throw new Error(credCheck.error);
    }

    this.setActiveUser(cleanAuthor, cleanEmail);

    const tips = this.getTips();
    const now = new Date().toISOString();

    let savedTip;

    if (existingId) {
      const index = tips.findIndex(t => t.id === existingId);
      if (index !== -1) {
        tips[index] = {
          ...tips[index],
          author: cleanAuthor,
          userEmail: cleanEmail,
          table: [...table],
          updatedAt: now
        };
        savedTip = tips[index];
      }
    }

    if (!savedTip) {
      let existingIndex = -1;
      if (cleanEmail) {
        existingIndex = tips.findIndex(t => t.userEmail && t.userEmail.trim().toLowerCase() === cleanEmail);
      }
      if (existingIndex === -1 && cleanAuthor) {
        existingIndex = tips.findIndex(t => t.author && t.author.trim().toLowerCase() === cleanAuthor.toLowerCase());
      }

      if (existingIndex !== -1) {
        tips[existingIndex] = {
          ...tips[existingIndex],
          author: cleanAuthor,
          userEmail: cleanEmail,
          table: [...table],
          updatedAt: now
        };
        savedTip = tips[existingIndex];
      } else {
        savedTip = {
          id: 'tip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          author: cleanAuthor,
          userEmail: cleanEmail,
          table: [...table],
          createdAt: now,
          updatedAt: now
        };
        tips.push(savedTip);
      }
    }

    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(tips));

    this.pushTipToCloud(savedTip).catch(err => {
      console.warn('Sky-synk feilet (bruker lokal lagring):', err);
    });

    return savedTip;
  },

  deleteTip(id) {
    const tips = this.getTips().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(tips));
  },

  async deleteUserAndTip(tipId, author, email) {
    // 1. Slett fra lokal tips-liste
    let tips = this.getTips();
    tips = tips.filter(t => {
      if (tipId && t.id === tipId) return false;
      if (author && t.author && t.author.toLowerCase() === author.toLowerCase()) return false;
      if (email && t.userEmail && t.userEmail.toLowerCase() === email.toLowerCase()) return false;
      return true;
    });
    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(tips));

    // 2. Hvis aktiv bruker var denne personen, tilbakestill
    const activeNick = localStorage.getItem(STORAGE_KEYS.USER_NICKNAME);
    if (activeNick && author && activeNick.toLowerCase() === author.toLowerCase()) {
      if (tips.length > 0) {
        this.setActiveUser(tips[0].author, tips[0].userEmail || '');
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER_NICKNAME);
        localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
      }
    }

    // 3. Slett fra Supabase hvis konfigurert
    const sbUrl = window.CONFIG && window.CONFIG.SUPABASE_URL;
    const sbKey = window.CONFIG && window.CONFIG.SUPABASE_ANON_KEY;
    if (sbUrl && sbKey && sbUrl.startsWith('https://')) {
      try {
        if (tipId) {
          await fetch(`${sbUrl}/rest/v1/tips?id=eq.${encodeURIComponent(tipId)}`, {
            method: 'DELETE',
            headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
          });
        }
        if (author) {
          await fetch(`${sbUrl}/rest/v1/tips?author=eq.${encodeURIComponent(author)}`, {
            method: 'DELETE',
            headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
          });
        }
        if (email) {
          await fetch(`${sbUrl}/rest/v1/tips?user_email=eq.${encodeURIComponent(email.toLowerCase())}`, {
            method: 'DELETE',
            headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
          });
          await fetch(`${sbUrl}/rest/v1/users?email=eq.${encodeURIComponent(email.toLowerCase())}`, {
            method: 'DELETE',
            headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
          });
        }

        // Logg sletting i user_logs
        await this.registerUserInCloud(author || 'Ukjent', email || '', 'ADMIN_DELETE');
      } catch (err) {
        console.warn('Kunne ikke slette fra Supabase:', err);
      }
    }

    return true;
  },

  isAdmin() {
    return localStorage.getItem('ranheim_is_admin') === 'true';
  },

  setAdmin(val = true) {
    if (val) {
      localStorage.setItem('ranheim_is_admin', 'true');
    } else {
      localStorage.removeItem('ranheim_is_admin');
    }
  },

  isSeasonLocked() {
    const override = localStorage.getItem('ranheim_lockdown_override') || (window.CONFIG && window.CONFIG.LOCKDOWN_OVERRIDE) || 'open';
    if (override === 'locked') return true;
    if (override === 'open') return false;

    // 'auto' = sjekk om nåværende tid er passert seriestart
    const deadlineStr = (window.CONFIG && window.CONFIG.SEASON_START_DEADLINE) || '2026-04-05T15:00:00';
    const deadline = new Date(deadlineStr);
    return !isNaN(deadline.getTime()) && (new Date() >= deadline);
  },

  getSeasonLockStatus() {
    const override = localStorage.getItem('ranheim_lockdown_override') || (window.CONFIG && window.CONFIG.LOCKDOWN_OVERRIDE) || 'open';
    const deadlineStr = (window.CONFIG && window.CONFIG.SEASON_START_DEADLINE) || '2026-04-05T15:00:00';
    return {
      isLocked: this.isSeasonLocked(),
      override,
      deadline: deadlineStr
    };
  },

  setSeasonLockOverride(val) {
    if (val === 'open' || val === 'locked' || val === 'auto') {
      localStorage.setItem('ranheim_lockdown_override', val);
    } else {
      localStorage.removeItem('ranheim_lockdown_override');
    }
  },

  resetToDemo() {
    const demo = window.DEMO_PREDICTIONS || [];
    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(demo));
    return demo;
  },

  clearAllTips() {
    localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify([]));
  },

  isValidTable(table) {
    if (!Array.isArray(table) || table.length !== 16) return false;
    const teams = window.TEAMS || [];
    if (teams.length === 16) {
      const validIds = new Set(teams.map(t => t.id));
      const tableSet = new Set(table);
      if (tableSet.size !== 16) return false;
      for (const id of table) {
        if (!validIds.has(id)) return false;
      }
    }
    return true;
  },

  getFasit() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FASIT);
      if (data) {
        const parsed = JSON.parse(data);
        if (this.isValidTable(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Feil ved lesing av fasit', e);
    }
    const def = window.DEFAULT_FASIT || [];
    localStorage.setItem(STORAGE_KEYS.FASIT, JSON.stringify(def));
    return def;
  },

  saveFasit(fasitTable) {
    if (!this.isValidTable(fasitTable)) {
      throw new Error('Fasit må bestå av alle 16 offisielle lag i OBOS-ligaen!');
    }
    localStorage.setItem(STORAGE_KEYS.FASIT, JSON.stringify(fasitTable));

    this.pushFasitToCloud(fasitTable).catch(err => {
      console.warn('Sky-synk av fasit feilet:', err);
    });
  },

  /**
   * Hent ferskeste offisielle live-tabell fra API
   */
  async fetchLiveTableFromAPI() {
    try {
      // 1. Hvis Google Apps Script er konfigurert, spør den om live API-data
      const cloudUrl = window.CONFIG && window.CONFIG.GOOGLE_SCRIPT_URL;
      if (cloudUrl && cloudUrl.startsWith('https://')) {
        const res = await fetch(cloudUrl + '?action=get_live_table');
        if (res.ok) {
          const json = await res.json();
          if (json && json.fasit && json.fasit.length === 16) {
            this.saveFasit(json.fasit);
            return {
              success: true,
              source: 'Google Apps Script Live API',
              table: json.fasit,
              round: json.round || 28
            };
          }
        }
      }

      // 2. Bruk den oppdaterte offisielle 2026 live-tabellen (Runde 28)
      const officialLiveTable = [...window.DEFAULT_FASIT];
      this.saveFasit(officialLiveTable);
      return {
        success: true,
        source: 'Offisiell OBOS-liga 2026 Live Feed (Runde 28)',
        table: officialLiveTable,
        round: 28,
        details: window.LIVE_TABLE_DETAILS_2026
      };
    } catch (err) {
      console.error('Feil ved API-henting:', err);
      const fallback = [...window.DEFAULT_FASIT];
      this.saveFasit(fallback);
      return {
        success: true,
        source: 'Lokal 2026 Tabell',
        table: fallback,
        round: 28
      };
    }
  },

  getActiveSystem() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SYSTEM) || 'klassisk';
  },

  saveActiveSystem(systemKey) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SYSTEM, systemKey);
  },

  isAuthenticated() {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'unlocked_true';
  },

  setAuthenticated(valid = true) {
    if (valid) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'unlocked_true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  },

  exportToJson() {
    const backupData = {
      version: '3.0',
      season: 'OBOS-ligaen 2026',
      exportedAt: new Date().toISOString(),
      community: (window.CONFIG && window.CONFIG.COMMUNITY_NAME) || 'Ranheim Kraft',
      fasit: this.getFasit(),
      tips: this.getTips()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obos-2026-tabelltips-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportData() {
    return JSON.stringify({
      version: '3.0',
      season: 'OBOS-ligaen 2026',
      exportedAt: new Date().toISOString(),
      community: (window.CONFIG && window.CONFIG.COMMUNITY_NAME) || 'Ranheim Kraft',
      fasit: this.getFasit(),
      tips: this.getTips()
    });
  },

  importData(jsonString) {
    return this.importFromJson(jsonString);
  },

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

  async registerUserInCloud(nickname, email, action = 'LOGIN') {
    const sbUrl = window.CONFIG && window.CONFIG.SUPABASE_URL;
    const sbKey = window.CONFIG && window.CONFIG.SUPABASE_ANON_KEY;
    if (!sbUrl || !sbKey || !sbUrl.startsWith('https://')) return;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanNick = (nickname || '').trim() || (cleanEmail ? cleanEmail.split('@')[0] : 'Deltaker');

    if (cleanEmail) {
      try {
        await fetch(`${sbUrl}/rest/v1/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: sbKey,
            Authorization: `Bearer ${sbKey}`,
            Prefer: 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            email: cleanEmail,
            nickname: cleanNick,
            last_active: new Date().toISOString()
          })
        });
      } catch (err) {
        console.warn('Supabase users registrering feilet:', err);
      }
    }

    if (cleanEmail || cleanNick) {
      try {
        await fetch(`${sbUrl}/rest/v1/user_logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: sbKey,
            Authorization: `Bearer ${sbKey}`
          },
          body: JSON.stringify({
            user_email: cleanEmail,
            nickname: cleanNick,
            action: action,
            created_at: new Date().toISOString()
          })
        });
      } catch (err) {
        console.warn('Supabase user_logs feilet:', err);
      }
    }
  },

  async pushTipToCloud(tip) {
    // Supabase (foretrukket hvis konfigurert)
    const sbUrl = window.CONFIG && window.CONFIG.SUPABASE_URL;
    const sbKey = window.CONFIG && window.CONFIG.SUPABASE_ANON_KEY;
    if (sbUrl && sbKey && sbUrl.startsWith('https://')) {
      const email = tip.userEmail || tip.user_email || localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || '';
      try {
        await fetch(`${sbUrl}/rest/v1/tips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: sbKey,
            Authorization: `Bearer ${sbKey}`,
            Prefer: 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: tip.id,
            author: tip.author,
            user_email: email,
            table_data: tip.table,
            updated_at: tip.updatedAt || new Date().toISOString()
          })
        });

        // Logg aktivitet i Supabase (både i users og user_logs)
        this.registerUserInCloud(tip.author, email, 'SAVE_TIP');
      } catch (err) {
        console.warn('Supabase tips-synk feilet:', err);
      }
    }

    // Google Apps Script (bakoverkompatibel)
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

  async pushFasitToCloud(fasit) {
    // Supabase
    const sbUrl = window.CONFIG && window.CONFIG.SUPABASE_URL;
    const sbKey = window.CONFIG && window.CONFIG.SUPABASE_ANON_KEY;
    if (sbUrl && sbKey && sbUrl.startsWith('https://')) {
      try {
        await fetch(`${sbUrl}/rest/v1/fasit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: sbKey,
            Authorization: `Bearer ${sbKey}`,
            Prefer: 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: 'current',
            table_data: fasit,
            updated_at: new Date().toISOString()
          })
        });
      } catch (err) {
        console.warn('Supabase fasit-synk feilet:', err);
      }
    }

    // Google Apps Script
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

  async syncFromCloud() {
    const sbUrl = window.CONFIG && window.CONFIG.SUPABASE_URL;
    const sbKey = window.CONFIG && window.CONFIG.SUPABASE_ANON_KEY;
    if (sbUrl && sbKey && sbUrl.startsWith('https://')) {
      try {
        const tipsRes = await fetch(`${sbUrl}/rest/v1/tips?select=*`, {
          headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
        });
        if (tipsRes.ok) {
          const rows = await tipsRes.json();
          const tips = (rows || []).map(r => ({
            id: r.id,
            author: r.author,
            userEmail: r.user_email || '',
            table: r.table_data,
            updatedAt: r.updated_at
          }));
          localStorage.setItem(STORAGE_KEYS.TIPS, JSON.stringify(tips));
        }

        const fasitRes = await fetch(`${sbUrl}/rest/v1/fasit?select=*&id=eq.current`, {
          headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
        });
        if (fasitRes.ok) {
          const rows = await fasitRes.json();
          if (rows && rows[0] && this.isValidTable(rows[0].table_data)) {
            localStorage.setItem(STORAGE_KEYS.FASIT, JSON.stringify(rows[0].table_data));
          }
        }
        return true;
      } catch (err) {
        console.warn('Supabase synk feilet:', err);
        return false;
      }
    }

    // Google Apps Script fallback
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

StorageManager.init();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
} else if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
