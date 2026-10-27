/**
 * OBOS Tabell-tipper & Live Resultattavle
 * Hovedapplikasjon (App Controller)
 */

(function () {
  'use strict';

  // Tilstands-variabler (State)
  let currentPredictionTable = [];
  let currentEditingTipId = null;
  let activeSystem = 'innertier';
  let sortablePrediction = null;
  let sortableFasit = null;

  // DOM-elementer
  const dom = {
    // Låseskjerm
    lockScreen: document.getElementById('lockScreen'),
    lockForm: document.getElementById('lockForm'),
    accessCodeInput: document.getElementById('accessCodeInput'),
    lockError: document.getElementById('lockError'),
    lockAppBtn: document.getElementById('lockAppBtn'),
    mainApp: document.getElementById('mainApp'),

    // Faner
    tabBtnPredict: document.getElementById('tabBtnPredict'),
    tabBtnLeaderboard: document.getElementById('tabBtnLeaderboard'),
    tabBtnSettings: document.getElementById('tabBtnSettings'),
    tabContentPredict: document.getElementById('tabContentPredict'),
    tabContentLeaderboard: document.getElementById('tabContentLeaderboard'),
    tabContentSettings: document.getElementById('tabContentSettings'),

    // Fane 1 (Mitt Tabelltips)
    authorNameInput: document.getElementById('authorNameInput'),
    existingTipSelect: document.getElementById('existingTipSelect'),
    saveTipBtn: document.getElementById('saveTipBtn'),
    openShareModalBtn: document.getElementById('openShareModalBtn'),
    predictionList: document.getElementById('predictionList'),

    // Fane 2 (Resultattavle)
    systemButtons: document.querySelectorAll('.system-btn'),
    activeSystemDescription: document.getElementById('activeSystemDescription'),
    podiumContainer: document.getElementById('podiumContainer'),
    leaderboardTableBody: document.getElementById('leaderboardTableBody'),
    participantCount: document.getElementById('participantCount'),

    // Fane 3 (Fasit & Innstillinger)
    fasitList: document.getElementById('fasitList'),
    saveFasitBtn: document.getElementById('saveFasitBtn'),
    presetStandardBtn: document.getElementById('presetStandardBtn'),
    presetRanheimChampBtn: document.getElementById('presetRanheimChampBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    resetDemoBtn: document.getElementById('resetDemoBtn'),
    syncNowBtn: document.getElementById('syncNowBtn'),
    cloudStatusText: document.getElementById('cloudStatusText'),

    // Modal 1 (Tippe-røntgen)
    xrayModal: document.getElementById('xrayModal'),
    xrayAuthorName: document.getElementById('xrayAuthorName'),
    xraySummarySubtitle: document.getElementById('xraySummarySubtitle'),
    xrayBadgesBar: document.getElementById('xrayBadgesBar'),
    xrayRowsContainer: document.getElementById('xrayRowsContainer'),
    closeXrayBtn: document.getElementById('closeXrayBtn'),
    closeXrayBottomBtn: document.getElementById('closeXrayBottomBtn'),

    // Modal 2 (Delbart bilde)
    shareModal: document.getElementById('shareModal'),
    shareCardContainer: document.getElementById('shareCardContainer'),
    shareCardAuthor: document.getElementById('shareCardAuthor'),
    shareCardDate: document.getElementById('shareCardDate'),
    shareCardTable: document.getElementById('shareCardTable'),
    downloadImageBtn: document.getElementById('downloadImageBtn'),
    copyImageBtn: document.getElementById('copyImageBtn'),
    closeShareBtn: document.getElementById('closeShareBtn')
  };

  /* ==========================================================================
     1. ADGANGSKONTROLL & AUTENTISERING
     ========================================================================== */

  function checkAccess() {
    const configCode = (window.CONFIG && window.CONFIG.ACCESS_CODE) || 'ranheim1901';

    // 1. Sjekk URL-parameter (?kode=... eller ?pin=...)
    const urlParams = new URLSearchParams(window.location.search);
    const codeInUrl = urlParams.get('kode') || urlParams.get('code') || urlParams.get('pin');

    if (codeInUrl && codeInUrl.trim().toLowerCase() === configCode.toLowerCase()) {
      StorageManager.setAuthenticated(true);
      // Fjern parameter fra URL uten omlasting for pen visning
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
      unlockApp();
      return;
    }

    // 2. Sjekk om allerede autentisert i localStorage
    if (StorageManager.isAuthenticated()) {
      unlockApp();
    } else {
      lockApp();
    }
  }

  function unlockApp() {
    dom.lockScreen.classList.add('hidden');
    dom.mainApp.classList.remove('hidden');
    initApp();
  }

  function lockApp() {
    dom.lockScreen.classList.remove('hidden');
    dom.mainApp.classList.add('hidden');
  }

  dom.lockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = dom.accessCodeInput.value.trim().toLowerCase();
    const expected = ((window.CONFIG && window.CONFIG.ACCESS_CODE) || 'ranheim1901').toLowerCase();

    if (entered === expected) {
      dom.lockError.classList.add('hidden');
      StorageManager.setAuthenticated(true);
      unlockApp();

      if (window.confetti) {
        window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      dom.lockError.classList.remove('hidden');
      dom.accessCodeInput.select();
    }
  });

  dom.lockAppBtn.addEventListener('click', () => {
    if (confirm('Vil du låse appen og logge ut? Du må taste adgangskoden igjen for å åpne den.')) {
      StorageManager.setAuthenticated(false);
      window.location.reload();
    }
  });

  /* ==========================================================================
     2. INITIALISERING AV APP
     ========================================================================== */

  function initApp() {
    activeSystem = StorageManager.getActiveSystem();
    loadPredictionTableInitial();
    updateExistingTipsDropdown();
    initSortablePrediction();
    initSortableFasit();
    renderLeaderboard();
    setupEventListeners();
    updateCloudStatusUI();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function updateCloudStatusUI() {
    const url = window.CONFIG && window.CONFIG.GOOGLE_SCRIPT_URL;
    if (url && url.startsWith('https://')) {
      dom.cloudStatusText.innerHTML = `🟢 Google Sheets er koblet til! Felles sanntidssynkronisering er aktiv.`;
    } else {
      dom.cloudStatusText.innerHTML = `Lokal modus (localStorage). For felles sky-synking på tvers av enheter, legg inn Apps Script URL i <code class="text-sky-300">js/config.js</code>.`;
    }
  }

  /* ==========================================================================
     3. FANEBYTTE
     ========================================================================== */

  function switchTab(target) {
    // Skjul alle faner
    dom.tabContentPredict.classList.add('hidden');
    dom.tabContentLeaderboard.classList.add('hidden');
    dom.tabContentSettings.classList.add('hidden');

    // Deaktiver alle knapper
    [dom.tabBtnPredict, dom.tabBtnLeaderboard, dom.tabBtnSettings].forEach(btn => {
      btn.classList.remove('active', 'border-sky-500', 'text-sky-400');
      btn.classList.add('border-transparent', 'text-slate-400');
    });

    if (target === 'predict') {
      dom.tabContentPredict.classList.remove('hidden');
      dom.tabBtnPredict.classList.add('active', 'border-sky-500', 'text-sky-400');
      dom.tabBtnPredict.classList.remove('border-transparent', 'text-slate-400');
    } else if (target === 'leaderboard') {
      dom.tabContentLeaderboard.classList.remove('hidden');
      dom.tabBtnLeaderboard.classList.add('active', 'border-sky-500', 'text-sky-400');
      dom.tabBtnLeaderboard.classList.remove('border-transparent', 'text-slate-400');
      renderLeaderboard();
    } else if (target === 'settings') {
      dom.tabContentSettings.classList.remove('hidden');
      dom.tabBtnSettings.classList.add('active', 'border-sky-500', 'text-sky-400');
      dom.tabBtnSettings.classList.remove('border-transparent', 'text-slate-400');
      renderFasitList();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* ==========================================================================
     4. FANE 1: MITT TABELLTIPS (DRAG & DROP)
     ========================================================================== */

  function loadPredictionTableInitial() {
    const fasit = StorageManager.getFasit();
    currentPredictionTable = [...fasit];
    renderPredictionList();
  }

  function updateExistingTipsDropdown() {
    const tips = StorageManager.getTips();
    dom.existingTipSelect.innerHTML = '<option value="">➕ Opprett nytt tips</option>';

    tips.forEach(tip => {
      const opt = document.createElement('option');
      opt.value = tip.id;
      opt.textContent = `👤 ${tip.author}`;
      dom.existingTipSelect.appendChild(opt);
    });

    if (currentEditingTipId) {
      dom.existingTipSelect.value = currentEditingTipId;
    }
  }

  function renderPredictionList() {
    dom.predictionList.innerHTML = '';

    currentPredictionTable.forEach((teamId, index) => {
      const position = index + 1;
      const team = getTeamById(teamId);
      if (!team) return;

      const zone = getZoneForPosition(position);
      const isRanheim = team.isRanheim;

      const itemEl = document.createElement('div');
      itemEl.className = `prediction-item flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
        isRanheim ? 'ranheim-highlight' : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
      }`;
      itemEl.dataset.id = team.id;

      itemEl.innerHTML = `
        <div class="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <!-- Posisjonstall -->
          <div class="pos-badge ${zone.colorClass} border flex-shrink-0">
            ${position}
          </div>

          <!-- Klubb fargestripe -->
          <div class="club-strip" style="background-color: ${team.primaryColor}; border: 1px solid rgba(255,255,255,0.2);"></div>

          <!-- Klubbnavn & Detaljer -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm sm:text-base font-extrabold truncate ${isRanheim ? 'text-sky-200' : 'text-white'}">
                ${team.name}
              </span>
              ${
                isRanheim
                  ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500 text-slate-950 shadow-sm flex items-center gap-1">💙 HJEMMELAG</span>'
                  : ''
              }
            </div>
            <div class="text-[11px] text-slate-400 flex items-center gap-2">
              <span>${team.arena}</span>
              <span class="text-slate-600">•</span>
              <span class="zone-tag ${zone.colorClass}">${zone.name}</span>
            </div>
          </div>
        </div>

        <!-- Dra-håndtak -->
        <div class="drag-handle px-2 py-1 text-slate-400 hover:text-white flex items-center gap-1">
          <i data-lucide="grip-vertical" class="w-5 h-5"></i>
        </div>
      `;

      dom.predictionList.appendChild(itemEl);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function initSortablePrediction() {
    if (sortablePrediction) {
      sortablePrediction.destroy();
    }

    sortablePrediction = new Sortable(dom.predictionList, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onEnd: function () {
        // Hent ny rekkefølge fra DOM
        const items = dom.predictionList.querySelectorAll('.prediction-item');
        currentPredictionTable = Array.from(items).map(el => el.dataset.id);
        // Oppdater tall og soner
        updatePredictionRanksInDOM();
      }
    });
  }

  function updatePredictionRanksInDOM() {
    const items = dom.predictionList.querySelectorAll('.prediction-item');
    items.forEach((el, index) => {
      const position = index + 1;
      const zone = getZoneForPosition(position);
      const posBadge = el.querySelector('.pos-badge');
      const zoneTag = el.querySelector('.zone-tag');

      if (posBadge) {
        posBadge.textContent = position;
        posBadge.className = `pos-badge ${zone.colorClass} border flex-shrink-0`;
      }
      if (zoneTag) {
        zoneTag.textContent = zone.name;
        zoneTag.className = `zone-tag ${zone.colorClass}`;
      }
    });
  }

  // Velg eksisterende tips for redigering
  dom.existingTipSelect.addEventListener('change', (e) => {
    const tipId = e.target.value;
    if (!tipId) {
      currentEditingTipId = null;
      dom.authorNameInput.value = '';
      loadPredictionTableInitial();
      return;
    }

    const tips = StorageManager.getTips();
    const tip = tips.find(t => t.id === tipId);
    if (tip) {
      currentEditingTipId = tip.id;
      dom.authorNameInput.value = tip.author;
      currentPredictionTable = [...tip.table];
      renderPredictionList();
    }
  });

  // Lagre tabelltips
  dom.saveTipBtn.addEventListener('click', () => {
    const author = dom.authorNameInput.value.trim();
    if (!author) {
      alert('Vennligst skriv inn ditt navn eller kallenavn før du lagrer!');
      dom.authorNameInput.focus();
      return;
    }

    try {
      const saved = StorageManager.saveTip(author, currentPredictionTable, currentEditingTipId);
      currentEditingTipId = saved.id;
      updateExistingTipsDropdown();

      // Konfetti-effekt!
      if (window.confetti) {
        window.confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      alert(`🎉 Tabelltips for "${author}" ble lagret! Du kan nå se plasseringen på Resultattavlen.`);
      switchTab('leaderboard');
    } catch (err) {
      alert('Feil ved lagring: ' + err.message);
    }
  });

  /* ==========================================================================
     5. FANE 2: RESULTATTAVLE & PODIUM
     ========================================================================== */

  // Endre poengsystem live
  dom.systemButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeSystem = btn.dataset.system;
      StorageManager.saveActiveSystem(activeSystem);
      renderLeaderboard();
    });
  });

  function renderLeaderboard() {
    const tips = StorageManager.getTips();
    const fasit = StorageManager.getFasit();

    dom.participantCount.textContent = tips.length;

    // Oppdater aktiv knapp UI
    dom.systemButtons.forEach(btn => {
      const isCurrent = btn.dataset.system === activeSystem;
      if (isCurrent) {
        btn.classList.add('border-sky-500', 'bg-sky-950/60', 'text-sky-300');
        btn.classList.remove('border-slate-700', 'bg-slate-900', 'text-slate-300');
      } else {
        btn.classList.remove('border-sky-500', 'bg-sky-950/60', 'text-sky-300');
        btn.classList.add('border-slate-700', 'bg-slate-900', 'text-slate-300');
      }
    });

    const meta = SYSTEM_METADATA[activeSystem] || SYSTEM_METADATA.innertier;
    dom.activeSystemDescription.textContent = meta.description;

    if (tips.length === 0) {
      dom.podiumContainer.innerHTML = `
        <div class="text-center py-8 text-slate-500">
          Ingen tabelltips lagret ennå. Vær den første til å legge inn et tips i fane 1!
        </div>
      `;
      dom.leaderboardTableBody.innerHTML = `
        <tr><td colspan="7" class="py-6 text-center text-slate-500">Ingen deltakere registrert</td></tr>
      `;
      return;
    }

    // Regn ut rangering og utmerkelser
    const ranked = rankLeaderboard(tips, fasit, activeSystem);
    const withBadges = assignBadges(ranked, fasit);

    // 1. Render Podium
    renderPodium(withBadges, meta);

    // 2. Render Full Tabell
    renderLeaderboardTable(withBadges, meta);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function renderPodium(participants, meta) {
    const p1 = participants[0];
    const p2 = participants[1];
    const p3 = participants[2];

    const getBadgePill = (p) => {
      if (!p || !p.badges || p.badges.length === 0) return '';
      const b = p.badges[0];
      return `<span class="inline-block text-[10px] px-2 py-0.5 rounded-full border ${b.colorClass} truncate max-w-full font-bold">${b.label}</span>`;
    };

    dom.podiumContainer.innerHTML = `
      <div class="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto px-2">
        
        <!-- 2. PLASS (SØLV - VENSTRE) -->
        <div class="order-1 flex flex-col items-center">
          ${
            p2
              ? `
            <div onclick="window.openXrayModal('${p2.id}')" class="w-full glass-card hover:bg-slate-800/80 cursor-pointer rounded-2xl p-3 text-center border-t-4 border-slate-300 shadow-lg transition-transform hover:-translate-y-1">
              <div class="text-2xl sm:text-3xl mb-1">🥈</div>
              <div class="text-xs sm:text-sm font-extrabold text-white truncate">${p2.author}</div>
              <div class="text-base sm:text-lg font-black text-slate-300 mt-1">${p2.score} <span class="text-[10px] font-normal text-slate-400">${meta.unit}</span></div>
              <div class="text-[11px] text-slate-400 mt-0.5">🎯 ${p2.exactHits} treff</div>
              <div class="mt-2 h-5 flex justify-center">${getBadgePill(p2)}</div>
            </div>
            <div class="w-full h-16 sm:h-20 bg-gradient-to-t from-slate-900 to-slate-800/90 rounded-t-xl flex items-center justify-center font-black text-xl text-slate-400 border-t border-slate-400/40">
              2
            </div>
          `
              : `<div class="h-28 flex items-center justify-center text-xs text-slate-600">-</div>`
          }
        </div>

        <!-- 1. PLASS (GULL - MIDTEN, HØYEST) -->
        <div class="order-2 flex flex-col items-center">
          ${
            p1
              ? `
            <div onclick="window.openXrayModal('${p1.id}')" class="w-full glass-card hover:bg-slate-800/90 cursor-pointer rounded-2xl p-4 text-center border-t-4 border-amber-400 shadow-2xl transition-transform hover:-translate-y-1 gold-crown-glow">
              <div class="text-3xl sm:text-4xl mb-1">👑</div>
              <div class="text-sm sm:text-base font-black text-amber-200 truncate">${p1.author}</div>
              <div class="text-xl sm:text-2xl font-black text-amber-400 mt-1">${p1.score} <span class="text-xs font-normal text-amber-200/80">${meta.unit}</span></div>
              <div class="text-xs text-amber-300 font-semibold mt-0.5">🎯 ${p1.exactHits} innertiere</div>
              <div class="mt-2 h-5 flex justify-center">${getBadgePill(p1)}</div>
            </div>
            <div class="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-900 to-amber-950/70 rounded-t-xl flex items-center justify-center font-black text-2xl text-amber-400 border-t-2 border-amber-400 shadow-lg">
              1
            </div>
          `
              : `<div class="h-36 flex items-center justify-center text-xs text-slate-600">-</div>`
          }
        </div>

        <!-- 3. PLASS (BRONSE - HØYRE) -->
        <div class="order-3 flex flex-col items-center">
          ${
            p3
              ? `
            <div onclick="window.openXrayModal('${p3.id}')" class="w-full glass-card hover:bg-slate-800/80 cursor-pointer rounded-2xl p-3 text-center border-t-4 border-amber-700 shadow-lg transition-transform hover:-translate-y-1">
              <div class="text-2xl sm:text-3xl mb-1">🥉</div>
              <div class="text-xs sm:text-sm font-extrabold text-white truncate">${p3.author}</div>
              <div class="text-base sm:text-lg font-black text-amber-600 mt-1">${p3.score} <span class="text-[10px] font-normal text-slate-400">${meta.unit}</span></div>
              <div class="text-[11px] text-slate-400 mt-0.5">🎯 ${p3.exactHits} treff</div>
              <div class="mt-2 h-5 flex justify-center">${getBadgePill(p3)}</div>
            </div>
            <div class="w-full h-12 sm:h-14 bg-gradient-to-t from-slate-900 to-slate-800/80 rounded-t-xl flex items-center justify-center font-black text-lg text-amber-700 border-t border-amber-700/40">
              3
            </div>
          `
              : `<div class="h-24 flex items-center justify-center text-xs text-slate-600">-</div>`
          }
        </div>

      </div>
    `;
  }

  function renderLeaderboardTable(participants, meta) {
    dom.leaderboardTableBody.innerHTML = '';

    participants.forEach((p) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-800/50 cursor-pointer transition-colors';
      row.onclick = () => window.openXrayModal(p.id);

      let rankDisplay = p.rank;
      if (p.rank === 1) rankDisplay = '🥇 1';
      else if (p.rank === 2) rankDisplay = '🥈 2';
      else if (p.rank === 3) rankDisplay = '🥉 3';

      const badgeHtml = (p.badges || [])
        .map(
          b =>
            `<span class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${b.colorClass} mr-1 font-semibold" title="${b.description}">
              ${b.label}
            </span>`
        )
        .join('');

      row.innerHTML = `
        <td class="py-3 px-4 text-center font-bold text-slate-400">${rankDisplay}</td>
        <td class="py-3 px-4">
          <div class="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
            <span>${p.author}</span>
            ${p.author.toLowerCase().includes('ranheim') ? '<span class="text-xs">💙</span>' : ''}
          </div>
          <div class="text-[11px] text-slate-500 sm:hidden">
            ${(p.badges && p.badges[0]) ? p.badges[0].label : ''}
          </div>
        </td>
        <td class="py-3 px-3 text-center">
          <span class="font-black text-sm sm:text-base text-sky-300">${p.score}</span>
        </td>
        <td class="py-3 px-3 text-center">
          <span class="inline-flex items-center justify-center font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 text-xs">
            🎯 ${p.exactHits}
          </span>
        </td>
        <td class="py-3 px-3 text-center text-xs text-slate-400 font-medium">
          ${p.totalDiff} pl
        </td>
        <td class="py-3 px-4 hidden md:table-cell">
          <div class="flex flex-wrap gap-1">${badgeHtml || '<span class="text-xs text-slate-600">-</span>'}</div>
        </td>
        <td class="py-3 px-4 text-right">
          <button class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-bold border border-slate-700">
            🔍 Røntgen
          </button>
        </td>
      `;

      dom.leaderboardTableBody.appendChild(row);
    });
  }

  /* ==========================================================================
     6. TIPPE-RØNTGEN MODAL (SAMMENLIGNING)
     ========================================================================== */

  window.openXrayModal = function (participantId) {
    const tips = StorageManager.getTips();
    const fasit = StorageManager.getFasit();
    const participant = tips.find(t => t.id === participantId);
    if (!participant) return;

    const evaluation = evaluatePrediction(participant.table, fasit, activeSystem);
    const rankedWithBadges = assignBadges(
      rankLeaderboard(tips, fasit, activeSystem),
      fasit
    );
    const withMyBadges = rankedWithBadges.find(p => p.id === participantId) || {};

    dom.xrayAuthorName.textContent = participant.author;
    dom.xraySummarySubtitle.textContent = `Score: ${evaluation.score}p | Totalt avvik: ${evaluation.totalDiff} plasser | Innertiere: ${evaluation.exactHits}`;

    // Badges i toppen av modal
    dom.xrayBadgesBar.innerHTML = '';
    if (withMyBadges.badges && withMyBadges.badges.length > 0) {
      withMyBadges.badges.forEach(b => {
        const badgeEl = document.createElement('div');
        badgeEl.className = `text-xs px-2.5 py-1 rounded-lg border ${b.colorClass} font-bold flex items-center gap-1.5`;
        badgeEl.innerHTML = `<span>${b.label}</span> <span class="text-[10px] opacity-80">(${b.description})</span>`;
        dom.xrayBadgesBar.appendChild(badgeEl);
      });
    } else {
      dom.xrayBadgesBar.innerHTML = `<span class="text-xs text-slate-500">Ingen spesielle utmerkelser ennå.</span>`;
    }

    // Rader side om side
    dom.xrayRowsContainer.innerHTML = '';

    evaluation.teamBreakdowns.forEach((item) => {
      const team = getTeamById(item.teamId);
      if (!team) return;

      const diff = item.diff;
      let diffBadgeClass = '';
      let diffText = '';

      if (diff === 0) {
        diffBadgeClass = 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60 font-black';
        diffText = '🎯 EKSAKT!';
      } else if (diff <= 2) {
        diffBadgeClass = 'bg-amber-950/70 text-amber-300 border-amber-500/60 font-bold';
        diffText = `±${diff} pl`;
      } else {
        diffBadgeClass = 'bg-rose-950/70 text-rose-300 border-rose-500/60 font-bold';
        diffText = `-${diff} pl`;
      }

      const row = document.createElement('div');
      row.className = `grid grid-cols-12 items-center p-2 rounded-xl border text-xs sm:text-sm ${
        item.isRanheim ? 'ranheim-highlight' : 'bg-slate-900/60 border-slate-800'
      }`;

      row.innerHTML = `
        <div class="col-span-1 text-center font-extrabold text-slate-400">
          ${item.predictedPos}
        </div>
        <div class="col-span-5 flex items-center gap-2 min-w-0 pr-1">
          <div class="club-strip h-4" style="background-color: ${team.primaryColor};"></div>
          <span class="font-bold truncate ${item.isRanheim ? 'text-sky-300' : 'text-white'}">
            ${team.name}
          </span>
          ${item.isRanheim ? '<span class="text-[10px]">💙</span>' : ''}
        </div>
        <div class="col-span-3 text-center text-slate-400 font-semibold">
          Plass ${item.actualPos}
        </div>
        <div class="col-span-3 text-right">
          <span class="inline-block px-2 py-0.5 rounded border text-[11px] ${diffBadgeClass}">
            ${diffText}
          </span>
        </div>
      `;

      dom.xrayRowsContainer.appendChild(row);
    });

    dom.xrayModal.classList.remove('hidden');
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  dom.closeXrayBtn.addEventListener('click', () => dom.xrayModal.classList.add('hidden'));
  dom.closeXrayBottomBtn.addEventListener('click', () => dom.xrayModal.classList.add('hidden'));

  /* ==========================================================================
     7. FANE 3: FASIT-EDITOR & DATAHÅNDTERING
     ========================================================================== */

  function renderFasitList() {
    const fasit = StorageManager.getFasit();
    dom.fasitList.innerHTML = '';

    fasit.forEach((teamId, index) => {
      const position = index + 1;
      const team = getTeamById(teamId);
      if (!team) return;

      const zone = getZoneForPosition(position);

      const itemEl = document.createElement('div');
      itemEl.className =
        'fasit-item flex items-center justify-between p-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/80 transition-all';
      itemEl.dataset.id = team.id;

      itemEl.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${zone.colorClass} border">
            ${position}
          </div>
          <div class="club-strip h-4" style="background-color: ${team.primaryColor};"></div>
          <span class="text-sm font-bold text-white">${team.name}</span>
          ${team.isRanheim ? '<span class="text-xs">💙</span>' : ''}
        </div>
        <div class="drag-handle-fasit px-2 text-slate-500 hover:text-white">
          <i data-lucide="grip-vertical" class="w-4 h-4"></i>
        </div>
      `;

      dom.fasitList.appendChild(itemEl);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function initSortableFasit() {
    if (sortableFasit) sortableFasit.destroy();

    sortableFasit = new Sortable(dom.fasitList, {
      animation: 150,
      handle: '.drag-handle-fasit',
      ghostClass: 'sortable-ghost',
      onEnd: function () {
        updateFasitRanksInDOM();
      }
    });
  }

  function updateFasitRanksInDOM() {
    const items = dom.fasitList.querySelectorAll('.fasit-item');
    items.forEach((el, index) => {
      const position = index + 1;
      const zone = getZoneForPosition(position);
      const posDiv = el.querySelector('div > div:first-child');
      if (posDiv) {
        posDiv.textContent = position;
        posDiv.className = `w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${zone.colorClass} border`;
      }
    });
  }

  // Lagre ny fasit (med valgfri PIN)
  dom.saveFasitBtn.addEventListener('click', () => {
    const adminPin = (window.CONFIG && window.CONFIG.ADMIN_PIN) || '1901';
    const pin = prompt('Skriv inn Admin-PIN for å lagre ny fasittabell:');
    if (pin !== adminPin) {
      alert('Feil Admin-PIN! Kun administrator kan endre offisiell fasit.');
      return;
    }

    const items = dom.fasitList.querySelectorAll('.fasit-item');
    const newFasit = Array.from(items).map(el => el.dataset.id);

    try {
      StorageManager.saveFasit(newFasit);
      alert('✅ Fasit-tabellen er oppdatert! Alle poengsummer er regnet ut på nytt.');
      renderLeaderboard();
    } catch (e) {
      alert('Feil: ' + e.message);
    }
  });

  // Hurtig-presets for fasit
  dom.presetStandardBtn.addEventListener('click', () => {
    StorageManager.saveFasit(window.DEFAULT_FASIT);
    renderFasitList();
    renderLeaderboard();
    alert('Fasit tilbakestilt til standard OBOS 2025-tabell.');
  });

  dom.presetRanheimChampBtn.addEventListener('click', () => {
    const champFasit = ['ranheim', ...window.DEFAULT_FASIT.filter(id => id !== 'ranheim')];
    StorageManager.saveFasit(champFasit);
    renderFasitList();
    renderLeaderboard();
    alert('💙 Herlig! Fasit er nå satt med Ranheim TF på 1. plass!');
  });

  // Backup & Import
  dom.exportJsonBtn.addEventListener('click', () => StorageManager.exportToJson());

  dom.importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        StorageManager.importFromJson(event.target.result);
        alert('✅ Data ble importert!');
        window.location.reload();
      } catch (err) {
        alert('Kunne ikke importere fil: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  dom.resetDemoBtn.addEventListener('click', () => {
    const adminPin = (window.CONFIG && window.CONFIG.ADMIN_PIN) || '1901';
    const pin = prompt('Skriv inn Admin-PIN for å tilbakestille alle tips til demodata:');
    if (pin !== adminPin) {
      alert('Feil Admin-PIN!');
      return;
    }
    StorageManager.resetToDemo();
    alert('Nullstilt til 6 demo-kompiser.');
    window.location.reload();
  });

  dom.syncNowBtn.addEventListener('click', async () => {
    dom.syncNowBtn.disabled = true;
    dom.syncNowBtn.innerHTML = `<span>Synkroniserer...</span>`;

    const success = await StorageManager.syncFromCloud();
    dom.syncNowBtn.disabled = false;
    dom.syncNowBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i><span>Synkroniser med Google Sheets</span>`;
    if (window.lucide) window.lucide.createIcons();

    if (success) {
      alert('✅ Synkronisering fullført! Hentet siste tips fra Google Sheets.');
      renderLeaderboard();
      updateExistingTipsDropdown();
    } else {
      alert('Kunne ikke hente data fra Google Sheets. Sjekk at GOOGLE_SCRIPT_URL er lagt inn i js/config.js.');
    }
  });

  /* ==========================================================================
     8. DELBART BILDE (HTML2CANVAS)
     ========================================================================== */

  dom.openShareModalBtn.addEventListener('click', () => {
    const author = dom.authorNameInput.value.trim() || 'Mitt Tabelltips';
    dom.shareCardAuthor.textContent = author;
    dom.shareCardDate.textContent = new Date().toLocaleDateString('no-NO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // Bygg kompakt 16-raders forhåndsvisning
    dom.shareCardTable.innerHTML = '';
    currentPredictionTable.forEach((teamId, index) => {
      const pos = index + 1;
      const team = getTeamById(teamId);
      if (!team) return;

      const zone = getZoneForPosition(pos);
      const row = document.createElement('div');
      row.className = `flex items-center justify-between py-0.5 px-2 rounded ${
        team.isRanheim ? 'bg-sky-900/60 border border-sky-400/60' : 'bg-slate-900/60'
      }`;

      row.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-4 text-center font-bold text-[10px] ${zone.colorClass}">${pos}</span>
          <div class="w-1.5 h-3 rounded-full" style="background-color: ${team.primaryColor};"></div>
          <span class="font-bold text-[11px] ${team.isRanheim ? 'text-sky-300' : 'text-white'}">
            ${team.name}
          </span>
          ${team.isRanheim ? '<span class="text-[9px]">💙</span>' : ''}
        </div>
        <span class="text-[9px] uppercase font-semibold text-slate-400">${zone.badgeText}</span>
      `;
      dom.shareCardTable.appendChild(row);
    });

    dom.shareModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  });

  dom.closeShareBtn.addEventListener('click', () => dom.shareModal.classList.add('hidden'));

  dom.downloadImageBtn.addEventListener('click', () => {
    if (!window.html2canvas) {
      alert('html2canvas biblioteket ble ikke lastet.');
      return;
    }

    const card = dom.shareCardContainer;
    window
      .html2canvas(card, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#090d16'
      })
      .then((canvas) => {
        const link = document.createElement('a');
        const author = dom.authorNameInput.value.trim() || 'tips';
        link.download = `ranheim-tabelltips-${author.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
  });

  dom.copyImageBtn.addEventListener('click', () => {
    if (!window.html2canvas) return;

    const card = dom.shareCardContainer;
    window
      .html2canvas(card, { scale: 2, useCORS: true, backgroundColor: '#090d16' })
      .then((canvas) => {
        canvas.toBlob((blob) => {
          if (!blob) return;
          if (navigator.clipboard && window.ClipboardItem) {
            navigator.clipboard
              .write([new ClipboardItem({ 'image/png': blob })])
              .then(() => alert('📋 Bildet ble kopiert til utklippstavlen! Lim det rett inn i chatten (Ctrl+V).'))
              .catch(() => alert('Kunne ikke kopiere automatisk. Bruk "Last ned PNG" i stedet.'));
          } else {
            alert('Nettleseren støtter ikke direkte bildekopiering. Bruk "Last ned PNG".');
          }
        });
      });
  });

  /* ==========================================================================
     9. EVENT LISTENERS & SETUP
     ========================================================================== */

  function setupEventListeners() {
    dom.tabBtnPredict.addEventListener('click', () => switchTab('predict'));
    dom.tabBtnLeaderboard.addEventListener('click', () => switchTab('leaderboard'));
    dom.tabBtnSettings.addEventListener('click', () => switchTab('settings'));
  }

  // Start app
  document.addEventListener('DOMContentLoaded', () => {
    checkAccess();
  });

  // Hvis scriptet kjører etter DOMContentLoaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    checkAccess();
  }
})();
