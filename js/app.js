/**
 * OBOS Tabell-tipper, Live Resultattavle & Sesong-Stats Hub
 * Hovedapplikasjon (App Controller)
 */

(function () {
  'use strict';

  // Tilstands-variabler (State)
  let currentPredictionTable = [];
  let currentEditingTipId = null;
  let activeSystem = 'innertier';
  let activeRoundIndex = 0; // Standard 0 = før seriestart
  let isSeasonLocked = false;
  let mockLockState = null; // null = bruk config/dato, true = tvunget låst, false = tvunget åpen
  let countdownTimerInterval = null;
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

    // Seriestart-nedtelling og sperre
    deadlineStatusPill: document.getElementById('deadlineStatusPill'),
    deadlineStatusDot: document.getElementById('deadlineStatusDot'),
    deadlineStatusLabel: document.getElementById('deadlineStatusLabel'),
    deadlineSubtext: document.getElementById('deadlineSubtext'),
    countdownDays: document.getElementById('countdownDays'),
    countdownHours: document.getElementById('countdownHours'),
    countdownMinutes: document.getElementById('countdownMinutes'),
    countdownSeconds: document.getElementById('countdownSeconds'),
    toggleMockLockBtn: document.getElementById('toggleMockLockBtn'),
    lockedWarningBanner: document.getElementById('lockedWarningBanner'),

    // Faner
    tabBtnPredict: document.getElementById('tabBtnPredict'),
    tabBtnLeaderboard: document.getElementById('tabBtnLeaderboard'),
    tabBtnStats: document.getElementById('tabBtnStats'),
    tabBtnSettings: document.getElementById('tabBtnSettings'),
    tabContentPredict: document.getElementById('tabContentPredict'),
    tabContentLeaderboard: document.getElementById('tabContentLeaderboard'),
    tabContentStats: document.getElementById('tabContentStats'),
    tabContentSettings: document.getElementById('tabContentSettings'),

    // Fane 1: Mitt Tabelltips
    authorNameInput: document.getElementById('authorNameInput'),
    existingTipSelect: document.getElementById('existingTipSelect'),
    saveTipBtn: document.getElementById('saveTipBtn'),
    saveBtnLabel: document.getElementById('saveBtnLabel'),
    openShareModalBtn: document.getElementById('openShareModalBtn'),
    predictionList: document.getElementById('predictionList'),

    // Fane 2: Resultattavle
    systemButtons: document.querySelectorAll('.system-btn'),
    activeSystemDescription: document.getElementById('activeSystemDescription'),
    podiumContainer: document.getElementById('podiumContainer'),
    leaderboardTableBody: document.getElementById('leaderboardTableBody'),
    participantCount: document.getElementById('participantCount'),

    // Fane 3: Sesong-Stats
    seasonRoundsContainer: document.getElementById('seasonRoundsContainer'),
    roundInfoBanner: document.getElementById('roundInfoBanner'),
    roundInfoText: document.getElementById('roundInfoText'),
    consensusListContainer: document.getElementById('consensusListContainer'),
    h2hSelectA: document.getElementById('h2hSelectA'),
    h2hSelectB: document.getElementById('h2hSelectB'),
    h2hComparisonContainer: document.getElementById('h2hComparisonContainer'),
    ranheimBeliefContainer: document.getElementById('ranheimBeliefContainer'),

    // Fane 4: Fasit & Innstillinger
    fasitList: document.getElementById('fasitList'),
    saveFasitBtn: document.getElementById('saveFasitBtn'),
    presetStandardBtn: document.getElementById('presetStandardBtn'),
    presetRanheimChampBtn: document.getElementById('presetRanheimChampBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    resetDemoBtn: document.getElementById('resetDemoBtn'),
    syncNowBtn: document.getElementById('syncNowBtn'),
    cloudStatusText: document.getElementById('cloudStatusText'),

    // Modal 1: Tippe-røntgen
    xrayModal: document.getElementById('xrayModal'),
    xrayAuthorName: document.getElementById('xrayAuthorName'),
    xraySummarySubtitle: document.getElementById('xraySummarySubtitle'),
    xrayBadgesBar: document.getElementById('xrayBadgesBar'),
    xrayRowsContainer: document.getElementById('xrayRowsContainer'),
    closeXrayBtn: document.getElementById('closeXrayBtn'),
    closeXrayBottomBtn: document.getElementById('closeXrayBottomBtn'),

    // Modal 2: Delbart Bilde
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
     1. ADGANGSKONTROLL (KUN FOR VENNER PÅ RANHEIMKRAFT.NO)
     ========================================================================== */

  function checkAccess() {
    const configCode = (window.CONFIG && window.CONFIG.ACCESS_CODE) || 'ranheim1901';

    // Sjekk URL-parameter (?kode=... eller ?pin=...)
    const urlParams = new URLSearchParams(window.location.search);
    const codeInUrl = urlParams.get('kode') || urlParams.get('code') || urlParams.get('pin');

    if (codeInUrl && codeInUrl.trim().toLowerCase() === configCode.toLowerCase()) {
      StorageManager.setAuthenticated(true);
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
      unlockApp();
      return;
    }

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
    if (confirm('Vil du låse appen? Du må skrive inn adgangskoden igjen for å åpne den.')) {
      StorageManager.setAuthenticated(false);
      window.location.reload();
    }
  });

  /* ==========================================================================
     2. SERIESTART-NEDTELLING & TIPPESPERRE
     ========================================================================== */

  function updateLockdownState() {
    // Sjekk om mockup-overstyring er aktiv
    const configOverride = window.CONFIG && window.CONFIG.LOCKDOWN_OVERRIDE;
    let override = mockLockState;
    if (override === null && configOverride && configOverride !== 'auto') {
      override = (configOverride === 'locked');
    }

    const deadlineStr = (window.CONFIG && window.CONFIG.SEASON_START_DEADLINE) || '2026-04-05T15:00:00';
    const deadlineDate = new Date(deadlineStr).getTime();
    const now = new Date().getTime();
    const diff = deadlineDate - now;

    if (override !== null) {
      isSeasonLocked = override;
    } else {
      isSeasonLocked = (diff <= 0);
    }

    // Oppdater UI
    if (isSeasonLocked) {
      dom.deadlineStatusPill.className =
        'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 bg-rose-950 text-rose-300 border border-rose-700/60';
      dom.deadlineStatusDot.className = 'w-2 h-2 rounded-full bg-rose-500';
      dom.deadlineStatusLabel.textContent = '🔒 Tipping Stengt';
      dom.deadlineSubtext.textContent = 'Ligaen er i gang! Tabellene er låst for sesongen.';
      dom.lockedWarningBanner.classList.remove('hidden');

      dom.saveTipBtn.disabled = true;
      dom.saveTipBtn.classList.add('opacity-50', 'cursor-not-allowed', 'from-slate-700', 'to-slate-800');
      dom.saveBtnLabel.textContent = '🔒 Tipping er stengt';

      if (sortablePrediction) {
        sortablePrediction.option('disabled', true);
      }
    } else {
      dom.deadlineStatusPill.className =
        'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 bg-emerald-950 text-emerald-400 border border-emerald-700/60';
      dom.deadlineStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-400 live-dot';
      dom.deadlineStatusLabel.textContent = '🟢 Tipping Åpen';
      dom.deadlineSubtext.textContent = 'Sperres automatisk ved seriestart:';
      dom.lockedWarningBanner.classList.add('hidden');

      dom.saveTipBtn.disabled = false;
      dom.saveTipBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'from-slate-700', 'to-slate-800');
      dom.saveBtnLabel.textContent = 'Lagre tabelltips';

      if (sortablePrediction) {
        sortablePrediction.option('disabled', false);
      }
    }

    // Oppdater nedtellingsur
    if (diff > 0 && !isSeasonLocked) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      dom.countdownDays.textContent = String(days).padStart(2, '0');
      dom.countdownHours.textContent = String(hours).padStart(2, '0');
      dom.countdownMinutes.textContent = String(minutes).padStart(2, '0');
      dom.countdownSeconds.textContent = String(seconds).padStart(2, '0');
    } else {
      dom.countdownDays.textContent = '00';
      dom.countdownHours.textContent = '00';
      dom.countdownMinutes.textContent = '00';
      dom.countdownSeconds.textContent = '00';
    }
  }

  function startCountdownTimer() {
    updateLockdownState();
    if (countdownTimerInterval) clearInterval(countdownTimerInterval);
    countdownTimerInterval = setInterval(updateLockdownState, 1000);
  }

  // Mockup hurtigbryter for å teste åpen/låst
  dom.toggleMockLockBtn.addEventListener('click', () => {
    mockLockState = !isSeasonLocked;
    updateLockdownState();
    alert(isSeasonLocked 
      ? '🔒 Mockup-test: Simulerer at LIGAEN ER I GANG (Tipping er sperret og skrivebeskyttet).' 
      : '🟢 Mockup-test: Simulerer FØR SERIESTART (Tipping er åpen for redigering).'
    );
  });

  /* ==========================================================================
     3. INITIALISERING AV APP
     ========================================================================== */

  function initApp() {
    activeSystem = StorageManager.getActiveSystem();
    startCountdownTimer();
    loadPredictionTableInitial();
    updateExistingTipsDropdown();
    initSortablePrediction();
    initSortableFasit();
    renderLeaderboard();
    renderSeasonRoundsUI();
    renderStatsDashboard();
    setupEventListeners();
    updateCloudStatusUI();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function updateCloudStatusUI() {
    const url = window.CONFIG && window.CONFIG.GOOGLE_SCRIPT_URL;
    if (url && url.startsWith('https://')) {
      dom.cloudStatusText.innerHTML = `🟢 Google Sheets sky-synk er aktiv! Felles sanntidstabell er tilkoblet.`;
    } else {
      dom.cloudStatusText.innerHTML = `Lokal lagring (localStorage). For felles sky-synking på ranheimkraft.no, legg inn Apps Script URL i <code class="text-cyan-300">js/config.js</code>.`;
    }
  }

  /* ==========================================================================
     4. FANEBYTTE
     ========================================================================== */

  function switchTab(target) {
    dom.tabContentPredict.classList.add('hidden');
    dom.tabContentLeaderboard.classList.add('hidden');
    dom.tabContentStats.classList.add('hidden');
    dom.tabContentSettings.classList.add('hidden');

    [dom.tabBtnPredict, dom.tabBtnLeaderboard, dom.tabBtnStats, dom.tabBtnSettings].forEach(btn => {
      btn.classList.remove('active', 'border-sky-400', 'text-sky-300');
      btn.classList.add('border-transparent', 'text-slate-400');
    });

    if (target === 'predict') {
      dom.tabContentPredict.classList.remove('hidden');
      dom.tabBtnPredict.classList.add('active', 'border-sky-400', 'text-sky-300');
      dom.tabBtnPredict.classList.remove('border-transparent', 'text-slate-400');
    } else if (target === 'leaderboard') {
      dom.tabContentLeaderboard.classList.remove('hidden');
      dom.tabBtnLeaderboard.classList.add('active', 'border-sky-400', 'text-sky-300');
      dom.tabBtnLeaderboard.classList.remove('border-transparent', 'text-slate-400');
      renderLeaderboard();
    } else if (target === 'stats') {
      dom.tabContentStats.classList.remove('hidden');
      dom.tabBtnStats.classList.add('active', 'border-sky-400', 'text-sky-300');
      dom.tabBtnStats.classList.remove('border-transparent', 'text-slate-400');
      renderStatsDashboard();
    } else if (target === 'settings') {
      dom.tabContentSettings.classList.remove('hidden');
      dom.tabBtnSettings.classList.add('active', 'border-sky-400', 'text-sky-300');
      dom.tabBtnSettings.classList.remove('border-transparent', 'text-slate-400');
      renderFasitList();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* ==========================================================================
     5. FANE 1: MITT TABELLTIPS (DRAG & DROP)
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
      itemEl.className = `prediction-item flex items-center justify-between p-3 rounded-2xl border transition-all ${
        isRanheim ? 'ranheim-card' : 'cyber-card border-white/5 hover:border-sky-500/30'
      }`;
      itemEl.dataset.id = team.id;

      itemEl.innerHTML = `
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <!-- Posisjonstall med sonefarge -->
          <div class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border ${zone.colorClass} flex-shrink-0 shadow-inner">
            ${position}
          </div>

          <!-- Klubb fargebånd -->
          <div class="w-1.5 h-7 rounded-full flex-shrink-0" style="background-color: ${team.primaryColor}; box-shadow: 0 0 8px ${team.primaryColor}80;"></div>

          <!-- Navn & detaljer -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm sm:text-base font-black truncate ${isRanheim ? 'text-cyan-200' : 'text-white'}">
                ${team.name}
              </span>
              ${
                isRanheim
                  ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950 shadow-sm flex items-center gap-1">💙 HJEMMELAG</span>'
                  : ''
              }
            </div>
            <div class="text-[11px] text-slate-400 flex items-center gap-2">
              <span>${team.arena}</span>
              <span class="text-slate-600">•</span>
              <span class="font-extrabold uppercase text-[10px] ${zone.colorClass.split(' ')[2]}">${zone.name}</span>
            </div>
          </div>
        </div>

        <!-- Dra-håndtak -->
        <div class="drag-handle px-2.5 py-1.5 text-slate-400 hover:text-cyan-300 flex items-center gap-1">
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
      animation: 160,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      disabled: isSeasonLocked,
      onEnd: function () {
        const items = dom.predictionList.querySelectorAll('.prediction-item');
        currentPredictionTable = Array.from(items).map(el => el.dataset.id);
        updatePredictionRanksInDOM();
      }
    });
  }

  function updatePredictionRanksInDOM() {
    const items = dom.predictionList.querySelectorAll('.prediction-item');
    items.forEach((el, index) => {
      const position = index + 1;
      const zone = getZoneForPosition(position);
      const posBadge = el.querySelector('.w-8');
      if (posBadge) {
        posBadge.textContent = position;
        posBadge.className = `w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border ${zone.colorClass} flex-shrink-0 shadow-inner`;
      }
    });
  }

  // Velg eksisterende tips for visning / redigering
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
    if (isSeasonLocked) {
      alert('🔒 Tipping er stengt for sesongen! Ligaen er i gang.');
      return;
    }

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

      if (window.confetti) {
        window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }

      alert(`🎉 Tabelltips for "${author}" ble lagret! Du kan nå sjekke stillingen på Resultattavlen.`);
      switchTab('leaderboard');
    } catch (err) {
      alert('Feil ved lagring: ' + err.message);
    }
  });

  /* ==========================================================================
     6. FANE 2: RESULTATTAVLE & PODIUM
     ========================================================================== */

  dom.systemButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeSystem = btn.dataset.system;
      StorageManager.saveActiveSystem(activeSystem);
      renderLeaderboard();
      renderStatsDashboard();
    });
  });

  function renderLeaderboard() {
    const tips = StorageManager.getTips();
    const currentFasit = getActiveStandings();

    dom.participantCount.textContent = tips.length;

    dom.systemButtons.forEach(btn => {
      const isCurrent = btn.dataset.system === activeSystem;
      if (isCurrent) {
        btn.classList.add('border-sky-400', 'bg-sky-950/70', 'text-sky-200');
        btn.classList.remove('border-slate-700/80', 'bg-slate-900/80', 'text-slate-300');
      } else {
        btn.classList.remove('border-sky-400', 'bg-sky-950/70', 'text-sky-200');
        btn.classList.add('border-slate-700/80', 'bg-slate-900/80', 'text-slate-300');
      }
    });

    const meta = SYSTEM_METADATA[activeSystem] || SYSTEM_METADATA.innertier;
    dom.activeSystemDescription.textContent = meta.description;

    if (tips.length === 0) {
      dom.podiumContainer.innerHTML = `
        <div class="text-center py-8 text-slate-500 font-bold">
          Ingen tabelltips lagret ennå. Vær den første til å legge inn et tips i fane 1!
        </div>
      `;
      dom.leaderboardTableBody.innerHTML = `
        <tr><td colspan="7" class="py-6 text-center text-slate-500">Ingen deltakere registrert</td></tr>
      `;
      return;
    }

    const ranked = rankLeaderboard(tips, currentFasit, activeSystem);
    const withBadges = assignBadges(ranked, currentFasit);

    renderPodium(withBadges, meta);
    renderLeaderboardTable(withBadges, meta);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function getActiveStandings() {
    const rounds = window.SEASON_ROUNDS || [];
    if (activeRoundIndex > 0 && rounds[activeRoundIndex]) {
      return rounds[activeRoundIndex].standings;
    }
    return StorageManager.getFasit();
  }

  function renderPodium(participants, meta) {
    const p1 = participants[0];
    const p2 = participants[1];
    const p3 = participants[2];

    const getBadgePill = (p) => {
      if (!p || !p.badges || p.badges.length === 0) return '';
      const b = p.badges[0];
      return `<span class="inline-block text-[10px] px-2.5 py-0.5 rounded-full border ${b.colorClass} truncate max-w-full font-black">${b.label}</span>`;
    };

    dom.podiumContainer.innerHTML = `
      <div class="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto px-2">
        
        <!-- 2. PLASS (SØLV) -->
        <div class="order-1 flex flex-col items-center">
          ${
            p2
              ? `
            <div onclick="window.openXrayModal('${p2.id}')" class="w-full cyber-card hover:bg-slate-800/80 cursor-pointer rounded-3xl p-3.5 text-center border-t-4 border-slate-300 shadow-xl transition-all hover:-translate-y-1">
              <div class="text-3xl mb-1">🥈</div>
              <div class="text-xs sm:text-sm font-black text-white truncate">${p2.author}</div>
              <div class="text-base sm:text-xl font-black text-slate-200 mt-1">${p2.score} <span class="text-[10px] font-normal text-slate-400">${meta.unit}</span></div>
              <div class="text-[11px] text-slate-400 mt-0.5">🎯 ${p2.exactHits} treff</div>
              <div class="mt-2 h-5 flex justify-center">${getBadgePill(p2)}</div>
            </div>
            <div class="w-full h-18 sm:h-24 podium-pedestal-2 rounded-t-2xl flex items-center justify-center font-black text-xl text-slate-300">
              2
            </div>
          `
              : `<div class="h-28 flex items-center justify-center text-xs text-slate-600">-</div>`
          }
        </div>

        <!-- 1. PLASS (GULL) -->
        <div class="order-2 flex flex-col items-center">
          ${
            p1
              ? `
            <div onclick="window.openXrayModal('${p1.id}')" class="w-full cyber-card hover:bg-slate-800/90 cursor-pointer rounded-3xl p-4 text-center border-t-4 border-amber-400 shadow-2xl transition-all hover:-translate-y-1">
              <div class="text-4xl mb-1 crown-anim">👑</div>
              <div class="text-sm sm:text-base font-black text-amber-200 truncate">${p1.author}</div>
              <div class="text-xl sm:text-2xl font-black text-amber-400 mt-1">${p1.score} <span class="text-xs font-normal text-amber-200/80">${meta.unit}</span></div>
              <div class="text-xs text-amber-300 font-bold mt-0.5">🎯 ${p1.exactHits} innertiere</div>
              <div class="mt-2 h-5 flex justify-center">${getBadgePill(p1)}</div>
            </div>
            <div class="w-full h-26 sm:h-32 podium-pedestal-1 rounded-t-2xl flex items-center justify-center font-black text-2xl text-amber-400">
              1
            </div>
          `
              : `<div class="h-36 flex items-center justify-center text-xs text-slate-600">-</div>`
          }
        </div>

        <!-- 3. PLASS (BRONSE) -->
        <div class="order-3 flex flex-col items-center">
          ${
            p3
              ? `
            <div onclick="window.openXrayModal('${p3.id}')" class="w-full cyber-card hover:bg-slate-800/80 cursor-pointer rounded-3xl p-3.5 text-center border-t-4 border-amber-700 shadow-xl transition-all hover:-translate-y-1">
              <div class="text-3xl mb-1">🥉</div>
              <div class="text-xs sm:text-sm font-black text-white truncate">${p3.author}</div>
              <div class="text-base sm:text-xl font-black text-amber-500 mt-1">${p3.score} <span class="text-[10px] font-normal text-slate-400">${meta.unit}</span></div>
              <div class="text-[11px] text-slate-400 mt-0.5">🎯 ${p3.exactHits} treff</div>
              <div class="mt-2 h-5 flex justify-center">${getBadgePill(p3)}</div>
            </div>
            <div class="w-full h-14 sm:h-18 podium-pedestal-3 rounded-t-2xl flex items-center justify-center font-black text-lg text-amber-600">
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
      row.className = 'hover:bg-slate-800/60 cursor-pointer transition-colors';
      row.onclick = () => window.openXrayModal(p.id);

      let rankDisplay = p.rank;
      if (p.rank === 1) rankDisplay = '🥇 1';
      else if (p.rank === 2) rankDisplay = '🥈 2';
      else if (p.rank === 3) rankDisplay = '🥉 3';

      const badgeHtml = (p.badges || [])
        .map(
          b =>
            `<span class="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border ${b.colorClass} mr-1 font-bold" title="${b.description}">
              ${b.label}
            </span>`
        )
        .join('');

      row.innerHTML = `
        <td class="py-3 px-4 text-center font-black text-slate-400">${rankDisplay}</td>
        <td class="py-3 px-4">
          <div class="font-black text-white text-sm sm:text-base flex items-center gap-2">
            <span>${p.author}</span>
            ${p.author.toLowerCase().includes('ranheim') ? '<span class="text-xs">💙</span>' : ''}
          </div>
          <div class="text-[11px] text-slate-500 sm:hidden">
            ${(p.badges && p.badges[0]) ? p.badges[0].label : ''}
          </div>
        </td>
        <td class="py-3 px-3 text-center">
          <span class="font-black text-sm sm:text-base text-cyan-300">${p.score}</span>
        </td>
        <td class="py-3 px-3 text-center">
          <span class="inline-flex items-center justify-center font-black px-2.5 py-0.5 rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-600/50 text-xs">
            🎯 ${p.exactHits}
          </span>
        </td>
        <td class="py-3 px-3 text-center text-xs text-slate-400 font-bold">
          ${p.totalDiff} pl
        </td>
        <td class="py-3 px-4 hidden md:table-cell">
          <div class="flex flex-wrap gap-1">${badgeHtml || '<span class="text-xs text-slate-600">-</span>'}</div>
        </td>
        <td class="py-3 px-4 text-right">
          <button class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-black border border-slate-700">
            🔍 Røntgen
          </button>
        </td>
      `;

      dom.leaderboardTableBody.appendChild(row);
    });
  }

  /* ==========================================================================
     7. FANE 3: SESONG-STATS & ANALYSE HUB
     ========================================================================== */

  function renderSeasonRoundsUI() {
    const rounds = window.SEASON_ROUNDS || [];
    dom.seasonRoundsContainer.innerHTML = '';

    rounds.forEach((round, index) => {
      const isCurrent = (index === activeRoundIndex);
      const btn = document.createElement('button');
      btn.className = `p-2.5 rounded-2xl border text-left transition-all ${
        isCurrent
          ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-lg shadow-cyan-950/50'
          : 'border-white/5 bg-slate-900/80 hover:border-slate-700 text-slate-400'
      }`;

      btn.innerHTML = `
        <div class="text-[10px] font-black uppercase tracking-wider ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}">
          ${round.dateLabel}
        </div>
        <div class="text-xs font-black text-white truncate">${round.title}</div>
      `;

      btn.addEventListener('click', () => {
        activeRoundIndex = index;
        renderSeasonRoundsUI();
        dom.roundInfoText.textContent = round.description;
        renderLeaderboard();
        renderStatsDashboard();
      });

      dom.seasonRoundsContainer.appendChild(btn);
    });
  }

  function renderStatsDashboard() {
    const tips = StorageManager.getTips();
    const currentFasit = getActiveStandings();

    // 1. Folkets Tabell (Konsensus)
    renderConsensusTable(tips, currentFasit);

    // 2. Head-to-Head (H2H) duellvelgere
    setupH2HSelectors(tips, currentFasit);

    // 3. Ranheim TF Tro & Patriotisme
    renderRanheimBeliefReport(tips);
  }

  function renderConsensusTable(tips, fasit) {
    if (!window.StatsEngine) return;
    const consensus = StatsEngine.calculateConsensus(tips, fasit);
    dom.consensusListContainer.innerHTML = '';

    if (consensus.length === 0) {
      dom.consensusListContainer.innerHTML = `<div class="text-slate-500 py-4 text-center">Ingen tips registrert ennå.</div>`;
      return;
    }

    consensus.forEach((item) => {
      const team = getTeamById(item.teamId);
      if (!team) return;

      const diff = item.difference;
      let diffBadge = '';

      if (diff > 0.5) {
        diffBadge = `<span class="text-[10px] font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">▲ Overpresterer (+${Math.round(diff)})</span>`;
      } else if (diff < -0.5) {
        diffBadge = `<span class="text-[10px] font-black text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-700/50">▼ Skuffer (${Math.round(diff)})</span>`;
      } else {
        diffBadge = `<span class="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">Som forventet</span>`;
      }

      const row = document.createElement('div');
      row.className = `flex items-center justify-between p-2.5 rounded-xl border border-white/5 ${
        team.isRanheim ? 'bg-sky-950/40 border-sky-600/40' : 'bg-slate-900/60'
      }`;

      row.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-5 text-center font-black text-xs text-slate-400">${item.consensusRank}</span>
          <div class="w-1.5 h-5 rounded-full" style="background-color: ${team.primaryColor};"></div>
          <span class="font-extrabold truncate ${team.isRanheim ? 'text-cyan-300' : 'text-white'}">
            ${team.name}
          </span>
          ${team.isRanheim ? '💙' : ''}
        </div>

        <div class="flex items-center gap-2 text-right flex-shrink-0">
          <div class="text-[11px] text-slate-400">
            Snitt: <strong class="text-white">${item.avgPos}</strong> (Fasit: ${item.actualPos}.)
          </div>
          ${diffBadge}
        </div>
      `;

      dom.consensusListContainer.appendChild(row);
    });
  }

  function setupH2HSelectors(tips, fasit) {
    if (!window.StatsEngine || tips.length < 2) {
      dom.h2hComparisonContainer.innerHTML = `
        <div class="text-slate-500 py-4 text-center text-xs">Må ha minst 2 deltakere for å kjøre H2H-duell.</div>
      `;
      return;
    }

    const currentA = dom.h2hSelectA.value || tips[0].id;
    const currentB = dom.h2hSelectB.value || tips[1].id;

    dom.h2hSelectA.innerHTML = '';
    dom.h2hSelectB.innerHTML = '';

    tips.forEach(t => {
      const optA = document.createElement('option');
      optA.value = t.id;
      optA.textContent = t.author;
      dom.h2hSelectA.appendChild(optA);

      const optB = document.createElement('option');
      optB.value = t.id;
      optB.textContent = t.author;
      dom.h2hSelectB.appendChild(optB);
    });

    dom.h2hSelectA.value = currentA;
    dom.h2hSelectB.value = currentB;

    const renderDuel = () => {
      const idA = dom.h2hSelectA.value;
      const idB = dom.h2hSelectB.value;
      if (idA === idB) {
        dom.h2hComparisonContainer.innerHTML = `
          <div class="text-amber-400 text-xs py-4 text-center font-bold">Velg to forskjellige personer for en duell!</div>
        `;
        return;
      }

      const h2h = StatsEngine.compareH2H(idA, idB, tips, fasit, activeSystem);
      if (!h2h) return;

      dom.h2hComparisonContainer.innerHTML = `
        <div class="cyber-panel rounded-2xl p-4 border border-rose-500/30 space-y-4">
          <div class="flex items-center justify-between text-center">
            
            <div class="flex-1">
              <div class="text-xs sm:text-sm font-black text-white truncate">${h2h.userA.author}</div>
              <div class="text-xl sm:text-2xl font-black text-cyan-300 mt-1">${h2h.userA.score}p</div>
              <div class="text-[11px] text-slate-400">🎯 ${h2h.userA.exactHits} treff</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Ranheim på ${h2h.userA.ranheimPos}.</div>
            </div>

            <div class="px-3 flex flex-col items-center">
              <span class="text-xs font-black px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700/60">VS</span>
              <span class="text-[10px] text-slate-500 mt-1 font-bold">${h2h.identicalPositions}/16 like</span>
            </div>

            <div class="flex-1">
              <div class="text-xs sm:text-sm font-black text-white truncate">${h2h.userB.author}</div>
              <div class="text-xl sm:text-2xl font-black text-indigo-300 mt-1">${h2h.userB.score}p</div>
              <div class="text-[11px] text-slate-400">🎯 ${h2h.userB.exactHits} treff</div>
              <div class="text-[10px] text-slate-500 mt-0.5">Ranheim på ${h2h.userB.ranheimPos}.</div>
            </div>

          </div>

          <div class="text-center pt-2 border-t border-white/5">
            <span class="text-[11px] text-slate-400">Leder duellen:</span>
            <div class="text-sm font-black text-emerald-400">🏆 ${h2h.leader}</div>
          </div>
        </div>
      `;
    };

    dom.h2hSelectA.onchange = renderDuel;
    dom.h2hSelectB.onchange = renderDuel;
    renderDuel();
  }

  function renderRanheimBeliefReport(tips) {
    if (!window.StatsEngine) return;
    const report = StatsEngine.getTeamBeliefReport('ranheim', tips);
    if (!report) {
      dom.ranheimBeliefContainer.innerHTML = `<div class="text-slate-500 text-xs">Ingen tips registrert.</div>`;
      return;
    }

    dom.ranheimBeliefContainer.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
        <div class="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Mest Patriotisk 💙</div>
        <div class="text-sm font-black text-white mt-1">${report.highest.author}</div>
        <div class="text-xs text-cyan-300 font-bold mt-0.5">Tippet Ranheim på ${report.highest.predictedPos}. plass!</div>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
        <div class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Gjennomsnittlig Tro</div>
        <div class="text-xl font-black text-white mt-1">${report.avgPos}. plass</div>
        <div class="text-xs text-slate-400 mt-0.5">Kollektiv tro i gjengen</div>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
        <div class="text-[10px] font-black uppercase text-rose-400 tracking-wider">Største Skeptiker 💀</div>
        <div class="text-sm font-black text-white mt-1">${report.lowest.author}</div>
        <div class="text-xs text-rose-300 font-bold mt-0.5">Tippet Ranheim på ${report.lowest.predictedPos}. plass</div>
      </div>
    `;
  }

  /* ==========================================================================
     8. TIPPE-RØNTGEN MODAL
     ========================================================================== */

  window.openXrayModal = function (participantId) {
    const tips = StorageManager.getTips();
    const currentFasit = getActiveStandings();
    const participant = tips.find(t => t.id === participantId);
    if (!participant) return;

    const evaluation = evaluatePrediction(participant.table, currentFasit, activeSystem);
    const rankedWithBadges = assignBadges(
      rankLeaderboard(tips, currentFasit, activeSystem),
      currentFasit
    );
    const withMyBadges = rankedWithBadges.find(p => p.id === participantId) || {};

    dom.xrayAuthorName.textContent = participant.author;
    dom.xraySummarySubtitle.textContent = `Score: ${evaluation.score}p | Totalt avvik: ${evaluation.totalDiff} plasser | Innertiere: ${evaluation.exactHits}`;

    // Badges
    dom.xrayBadgesBar.innerHTML = '';
    if (withMyBadges.badges && withMyBadges.badges.length > 0) {
      withMyBadges.badges.forEach(b => {
        const badgeEl = document.createElement('div');
        badgeEl.className = `text-xs px-3 py-1 rounded-xl border ${b.colorClass} font-black flex items-center gap-1.5`;
        badgeEl.innerHTML = `<span>${b.label}</span> <span class="text-[10px] opacity-80">(${b.description})</span>`;
        dom.xrayBadgesBar.appendChild(badgeEl);
      });
    } else {
      dom.xrayBadgesBar.innerHTML = `<span class="text-xs text-slate-500 font-bold">Ingen spesielle utmerkelser ennå.</span>`;
    }

    // Røntgen rader
    dom.xrayRowsContainer.innerHTML = '';
    evaluation.teamBreakdowns.forEach((item) => {
      const team = getTeamById(item.teamId);
      if (!team) return;

      const diff = item.diff;
      let diffBadgeClass = '';
      let diffText = '';

      if (diff === 0) {
        diffBadgeClass = 'bg-emerald-950 text-emerald-300 border-emerald-500 font-black';
        diffText = '🎯 EKSAKT!';
      } else if (diff <= 2) {
        diffBadgeClass = 'bg-amber-950 text-amber-300 border-amber-500 font-bold';
        diffText = `±${diff} pl`;
      } else {
        diffBadgeClass = 'bg-rose-950 text-rose-300 border-rose-500 font-bold';
        diffText = `-${diff} pl`;
      }

      const row = document.createElement('div');
      row.className = `grid grid-cols-12 items-center p-2.5 rounded-xl border text-xs sm:text-sm ${
        item.isRanheim ? 'ranheim-card' : 'bg-slate-900/60 border-white/5'
      }`;

      row.innerHTML = `
        <div class="col-span-1 text-center font-black text-slate-400">
          ${item.predictedPos}
        </div>
        <div class="col-span-5 flex items-center gap-2 min-w-0 pr-1">
          <div class="w-1.5 h-4 rounded-full" style="background-color: ${team.primaryColor};"></div>
          <span class="font-bold truncate ${item.isRanheim ? 'text-cyan-300' : 'text-white'}">
            ${team.name}
          </span>
          ${item.isRanheim ? '<span class="text-[10px]">💙</span>' : ''}
        </div>
        <div class="col-span-3 text-center text-slate-400 font-bold text-xs">
          Plass ${item.actualPos}
        </div>
        <div class="col-span-3 text-right">
          <span class="inline-block px-2.5 py-0.5 rounded border text-[11px] ${diffBadgeClass}">
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
     9. FANE 4: FASIT-EDITOR & ADMIN-FUNKSJONER
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
        'fasit-item flex items-center justify-between p-2.5 rounded-2xl border border-white/5 bg-slate-900/90 hover:bg-slate-800/80 transition-all';
      itemEl.dataset.id = team.id;

      itemEl.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${zone.colorClass} border">
            ${position}
          </div>
          <div class="w-1.5 h-5 rounded-full" style="background-color: ${team.primaryColor};"></div>
          <span class="text-sm font-bold text-white">${team.name}</span>
          ${team.isRanheim ? '<span class="text-xs">💙</span>' : ''}
        </div>
        <div class="drag-handle-fasit px-2.5 text-slate-500 hover:text-white">
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
        const items = dom.fasitList.querySelectorAll('.fasit-item');
        items.forEach((el, index) => {
          const position = index + 1;
          const zone = getZoneForPosition(position);
          const posDiv = el.querySelector('div > div:first-child');
          if (posDiv) {
            posDiv.textContent = position;
            posDiv.className = `w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${zone.colorClass} border`;
          }
        });
      }
    });
  }

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
      renderStatsDashboard();
    } catch (e) {
      alert('Feil: ' + e.message);
    }
  });

  dom.presetStandardBtn.addEventListener('click', () => {
    StorageManager.saveFasit(window.DEFAULT_FASIT);
    renderFasitList();
    renderLeaderboard();
    renderStatsDashboard();
    alert('Fasit tilbakestilt til standard OBOS 2026-tabell.');
  });

  dom.presetRanheimChampBtn.addEventListener('click', () => {
    const champFasit = ['ranheim', ...window.DEFAULT_FASIT.filter(id => id !== 'ranheim')];
    StorageManager.saveFasit(champFasit);
    renderFasitList();
    renderLeaderboard();
    renderStatsDashboard();
    alert('💙 Herlig! Fasit er nå satt med Ranheim TF på 1. plass!');
  });

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
    alert('Nullstilt til demo-tips.');
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
      renderStatsDashboard();
      updateExistingTipsDropdown();
    } else {
      alert('Kunne ikke hente data fra Google Sheets. Sjekk at GOOGLE_SCRIPT_URL er lagt inn i js/config.js.');
    }
  });

  /* ==========================================================================
     10. DELBART BILDE (HTML2CANVAS)
     ========================================================================== */

  dom.openShareModalBtn.addEventListener('click', () => {
    const author = dom.authorNameInput.value.trim() || 'Mitt Tabelltips';
    dom.shareCardAuthor.textContent = author;
    dom.shareCardDate.textContent = 'Sesongstart 2026';

    dom.shareCardTable.innerHTML = '';
    currentPredictionTable.forEach((teamId, index) => {
      const pos = index + 1;
      const team = getTeamById(teamId);
      if (!team) return;

      const zone = getZoneForPosition(pos);
      const row = document.createElement('div');
      row.className = `flex items-center justify-between py-1 px-2.5 rounded-lg ${
        team.isRanheim ? 'bg-sky-900/60 border border-sky-400/60' : 'bg-slate-900/80'
      }`;

      row.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-4 text-center font-black text-[10px] ${zone.colorClass.split(' ')[2]}">${pos}</span>
          <div class="w-1.5 h-3.5 rounded-full" style="background-color: ${team.primaryColor};"></div>
          <span class="font-extrabold text-[11px] ${team.isRanheim ? 'text-cyan-300' : 'text-white'}">
            ${team.name}
          </span>
          ${team.isRanheim ? '<span class="text-[9px]">💙</span>' : ''}
        </div>
        <span class="text-[9px] uppercase font-black ${zone.colorClass.split(' ')[2]}">${zone.badgeText}</span>
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
        backgroundColor: '#07090e'
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
      .html2canvas(card, { scale: 2, useCORS: true, backgroundColor: '#07090e' })
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
     11. EVENT LISTENERS
     ========================================================================== */

  function setupEventListeners() {
    dom.tabBtnPredict.addEventListener('click', () => switchTab('predict'));
    dom.tabBtnLeaderboard.addEventListener('click', () => switchTab('leaderboard'));
    dom.tabBtnStats.addEventListener('click', () => switchTab('stats'));
    dom.tabBtnSettings.addEventListener('click', () => switchTab('settings'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkAccess();
  });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    checkAccess();
  }
})();
