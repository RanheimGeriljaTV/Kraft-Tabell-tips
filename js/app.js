/**
 * OBOS Tabell-tipper & Live Resultattavle 2026
 * Ranheim Kraft Vennegjeng App
 * Mobile-First, Rask, Taktil & Uten Clutter
 */

(function () {
  'use strict';

  // Tilstand
  let currentPredictionTable = [];
  let currentEditingTipId = null;
  let activeSystem = 'klassisk';
  let sortablePrediction = null;
  let sortableFasit = null;
  let activeParticipantForAnalysis = null;

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
    tabBtnGroupStats: document.getElementById('tabBtnGroupStats'),
    tabBtnStats: document.getElementById('tabBtnStats'),
    tabBtnSettings: document.getElementById('tabBtnSettings'),
    tabContentPredict: document.getElementById('tabContentPredict'),
    tabContentLeaderboard: document.getElementById('tabContentLeaderboard'),
    tabContentGroupStats: document.getElementById('tabContentGroupStats'),
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
    systemButtons: document.querySelectorAll('.pill-tab'),
    podiumContainer: document.getElementById('podiumContainer'),
    leaderboardCardsContainer: document.getElementById('leaderboardCardsContainer'),
    participantCount: document.getElementById('participantCount'),

    // Fane 3: Gruppe-statistikk (Folkets tabell, H2H, Superlativer)
    groupStatsCountLabel: document.getElementById('groupStatsCountLabel'),
    groupRecordsContainer: document.getElementById('groupRecordsContainer'),
    h2hSelectA: document.getElementById('h2hSelectA'),
    h2hSelectB: document.getElementById('h2hSelectB'),
    h2hComparisonContainer: document.getElementById('h2hComparisonContainer'),
    consensusListContainer: document.getElementById('consensusListContainer'),

    // Fane 4: Playoff & Gamification
    profileUserSelect: document.getElementById('profileUserSelect'),
    activeUserName: document.getElementById('activeUserName'),
    activeUserBadge: document.getElementById('activeUserBadge'),
    activeUserLevel: document.getElementById('activeUserLevel'),
    userCardAvatar: document.getElementById('userCardAvatar'),
    openActivePlayerCardBtn: document.getElementById('openActivePlayerCardBtn'),
    playoffBracketContainer: document.getElementById('playoffBracketContainer'),
    playoffRelegationContainer: document.getElementById('playoffRelegationContainer'),
    savePlayoffTipsBtn: document.getElementById('savePlayoffTipsBtn'),
    trophyCountLabel: document.getElementById('trophyCountLabel'),
    achievementsGrid: document.getElementById('achievementsGrid'),
    officialLiveTableContainer: document.getElementById('officialLiveTableContainer'),
    quickApiFetchBtn: document.getElementById('quickApiFetchBtn'),

    // Fane 4: Fasit & Innstillinger
    fasitList: document.getElementById('fasitList'),
    saveFasitBtn: document.getElementById('saveFasitBtn'),
    fetchApiFasitBtn: document.getElementById('fetchApiFasitBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    resetDemoBtn: document.getElementById('resetDemoBtn'),
    cloudStatusText: document.getElementById('cloudStatusText'),

    // Modal 1: Detaljert Tipsanalyse
    xrayModal: document.getElementById('xrayModal'),
    xrayAuthorName: document.getElementById('xrayAuthorName'),
    xraySummarySubtitle: document.getElementById('xraySummarySubtitle'),
    xrayBadgesBar: document.getElementById('xrayBadgesBar'),
    xrayRowsContainer: document.getElementById('xrayRowsContainer'),
    xrayOpenCardBtn: document.getElementById('xrayOpenCardBtn'),
    closeXrayBtn: document.getElementById('closeXrayBtn'),
    closeXrayBottomBtn: document.getElementById('closeXrayBottomBtn'),

    // Modal 2: Delbart Bilde
    shareModal: document.getElementById('shareModal'),
    shareCardContainer: document.getElementById('shareCardContainer'),
    shareCardAuthor: document.getElementById('shareCardAuthor'),
    shareCardTable: document.getElementById('shareCardTable'),
    downloadImageBtn: document.getElementById('downloadImageBtn'),
    copyImageBtn: document.getElementById('copyImageBtn'),
    closeShareBtn: document.getElementById('closeShareBtn'),

    // Modal 3: FUT Spillerkort
    playerCardModal: document.getElementById('playerCardModal'),
    playerCardModalContent: document.getElementById('playerCardModalContent'),
    closePlayerCardBtn: document.getElementById('closePlayerCardBtn'),
    downloadPlayerCardBtn: document.getElementById('downloadPlayerCardBtn'),
    copyPlayerCardBtn: document.getElementById('copyPlayerCardBtn')
  };

  /* ==========================================================================
     1. ADGANGSKONTROLL (KUN FOR VENNER PÅ RANHEIMKRAFT.NO)
     ========================================================================== */

  function checkAccess() {
    const configCode = (window.CONFIG && window.CONFIG.ACCESS_CODE) || 'ranheim1901';
    const urlParams = new URLSearchParams(window.location.search);
    const codeInUrl = urlParams.get('kode') || urlParams.get('code') || urlParams.get('pin');

    if (codeInUrl && codeInUrl.trim().toLowerCase() === configCode.toLowerCase()) {
      StorageManager.setAuthenticated(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (StorageManager.isAuthenticated()) {
      dom.lockScreen.classList.add('hidden');
      dom.mainApp.classList.remove('hidden');
      initApp();
    } else {
      dom.lockScreen.classList.remove('hidden');
      dom.mainApp.classList.add('hidden');
    }
  }

  dom.lockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const configCode = (window.CONFIG && window.CONFIG.ACCESS_CODE) || 'ranheim1901';
    const entered = dom.accessCodeInput.value.trim();

    if (entered.toLowerCase() === configCode.toLowerCase()) {
      StorageManager.setAuthenticated(true);
      dom.lockError.classList.add('hidden');
      dom.lockScreen.classList.add('hidden');
      dom.mainApp.classList.remove('hidden');
      initApp();
    } else {
      dom.lockError.classList.remove('hidden');
      dom.accessCodeInput.classList.add('border-rose-500');
    }
  });

  dom.lockAppBtn.addEventListener('click', () => {
    if (confirm('Vil du låse appen? Du må skrive inn adgangskoden på nytt.')) {
      StorageManager.setAuthenticated(false);
      window.location.reload();
    }
  });

  /* ==========================================================================
     2. INITIALISERING AV APP
     ========================================================================== */

  function initApp() {
    StorageManager.init();
    activeSystem = StorageManager.getActiveSystem();
    const savedActiveName = localStorage.getItem('ranheim_active_user_name');
    if (savedActiveName && dom.authorNameInput && !dom.authorNameInput.value) {
      dom.authorNameInput.value = savedActiveName;
    }
    loadPredictionTableInitial();
    updateExistingTipsDropdown();
    initSortablePrediction();
    initSortableFasit();
    renderLeaderboard();
    renderGroupStats();
    renderPlayoffBracket();
    renderOfficialLiveTable();
    renderGamificationHub();
    setupEventListeners();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* ==========================================================================
     3. FANENAVIGASJON (MOBIL-FIRST TABS)
     ========================================================================== */

  function switchTab(target) {
    [
      dom.tabContentPredict,
      dom.tabContentLeaderboard,
      dom.tabContentGroupStats,
      dom.tabContentStats,
      dom.tabContentSettings
    ].forEach(c => {
      if (c) c.classList.add('hidden');
    });

    [
      dom.tabBtnPredict,
      dom.tabBtnLeaderboard,
      dom.tabBtnGroupStats,
      dom.tabBtnStats,
      dom.tabBtnSettings
    ].forEach(btn => {
      if (btn) {
        btn.classList.remove('bg-sky-500', 'text-slate-950');
        btn.classList.add('text-slate-400');
      }
    });

    if (target === 'predict') {
      dom.tabContentPredict.classList.remove('hidden');
      dom.tabBtnPredict.classList.add('bg-sky-500', 'text-slate-950');
      dom.tabBtnPredict.classList.remove('text-slate-400');
    } else if (target === 'leaderboard') {
      dom.tabContentLeaderboard.classList.remove('hidden');
      dom.tabBtnLeaderboard.classList.add('bg-sky-500', 'text-slate-950');
      dom.tabBtnLeaderboard.classList.remove('text-slate-400');
      renderLeaderboard();
    } else if (target === 'groupStats') {
      if (dom.tabContentGroupStats) dom.tabContentGroupStats.classList.remove('hidden');
      if (dom.tabBtnGroupStats) {
        dom.tabBtnGroupStats.classList.add('bg-sky-500', 'text-slate-950');
        dom.tabBtnGroupStats.classList.remove('text-slate-400');
      }
      renderGroupStats();
    } else if (target === 'stats') {
      dom.tabContentStats.classList.remove('hidden');
      dom.tabBtnStats.classList.add('bg-sky-500', 'text-slate-950');
      dom.tabBtnStats.classList.remove('text-slate-400');
      renderPlayoffBracket();
      renderOfficialLiveTable();
      renderGamificationHub();
    } else if (target === 'settings') {
      dom.tabContentSettings.classList.remove('hidden');
      dom.tabBtnSettings.classList.add('bg-sky-500', 'text-slate-950');
      dom.tabBtnSettings.classList.remove('text-slate-400');
      renderFasitList();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* ==========================================================================
     4. FANE 1: MITT TABELLTIPS (TAKTIEL DRAG & DROP + OPP/NED KNAPPER)
     ========================================================================== */

  function loadPredictionTableInitial() {
    const fasit = StorageManager.getFasit();
    currentPredictionTable = [...fasit];
    renderPredictionList();
  }

  function getZoneStripeClass(pos) {
    if (pos <= 2) return 'zone-stripe-promotion';
    if (pos <= 6) return 'zone-stripe-playoff';
    if (pos === 14) return 'zone-stripe-relegation-playoff';
    if (pos >= 15) return 'zone-stripe-relegation';
    return 'zone-stripe-safe';
  }

  function renderPredictionList() {
    dom.predictionList.innerHTML = '';

    currentPredictionTable.forEach((teamId, index) => {
      const pos = index + 1;
      const team = getTeamById(teamId);
      if (!team) return;

      const isRanheim = team.isRanheim;
      const zoneStripe = getZoneStripeClass(pos);

      const card = document.createElement('div');
      card.className = `sports-card p-2.5 sm:p-3 flex items-center justify-between gap-2.5 ${zoneStripe} ${
        isRanheim ? 'team-row-ranheim' : ''
      }`;
      card.dataset.id = team.id;

      card.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <span class="w-6 text-center font-black text-sm text-slate-400">${pos}</span>
          <img src="${team.logoUrl}" alt="${team.name}" class="w-7 h-7 object-contain flex-shrink-0" onerror="this.style.display='none'">
          <div class="truncate">
            <span class="font-extrabold text-sm ${isRanheim ? 'text-cyan-300' : 'text-white'}">
              ${team.name}
            </span>
            ${isRanheim ? '<span class="ml-1 text-xs">💙</span>' : ''}
          </div>
        </div>

        <div class="flex items-center gap-1 flex-shrink-0">
          <button type="button" onclick="window.movePredictionTeam(${index}, -1)" ${index === 0 ? 'disabled' : ''} class="reorder-btn ${index === 0 ? 'opacity-20 pointer-events-none' : ''}" title="Flytt opp">▲</button>
          <button type="button" onclick="window.movePredictionTeam(${index}, 1)" ${index === 15 ? 'disabled' : ''} class="reorder-btn ${index === 15 ? 'opacity-20 pointer-events-none' : ''}" title="Flytt ned">▼</button>
          <div class="drag-handle reorder-btn cursor-grab active:cursor-grabbing text-slate-400" title="Hold og dra">
            <i data-lucide="grip-vertical" class="w-4 h-4"></i>
          </div>
        </div>
      `;

      dom.predictionList.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  window.movePredictionTeam = function (index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentPredictionTable.length) return;

    const moved = currentPredictionTable.splice(index, 1)[0];
    currentPredictionTable.splice(targetIndex, 0, moved);
    renderPredictionList();
    renderPlayoffBracket();
  };

  function initSortablePrediction() {
    if (sortablePrediction) {
      sortablePrediction.destroy();
    }

    sortablePrediction = new Sortable(dom.predictionList, {
      animation: 180,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      forceFallback: false,
      onEnd: () => {
        const rows = dom.predictionList.querySelectorAll('[data-id]');
        currentPredictionTable = Array.from(rows).map(row => row.dataset.id);
        renderPredictionList();
        renderPlayoffBracket();
      }
    });
  }

  function updateExistingTipsDropdown() {
    const tips = StorageManager.getTips();
    dom.existingTipSelect.innerHTML = '<option value="">➕ Nytt tips</option>';

    tips.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.author;
      if (currentEditingTipId === t.id) {
        opt.selected = true;
      }
      dom.existingTipSelect.appendChild(opt);
    });
  }

  dom.existingTipSelect.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      currentEditingTipId = null;
      dom.authorNameInput.value = '';
      dom.saveBtnLabel.textContent = 'Lagre tips';
      loadPredictionTableInitial();
      return;
    }

    const tips = StorageManager.getTips();
    const tip = tips.find(t => t.id === selectedId);
    if (tip) {
      currentEditingTipId = tip.id;
      dom.authorNameInput.value = tip.author;
      localStorage.setItem('ranheim_active_user_name', tip.author);
      dom.saveBtnLabel.textContent = 'Oppdater tips';
      currentPredictionTable = [...tip.table];
      renderPredictionList();
      renderPlayoffBracket();
      renderGamificationHub();
    }
  });

  dom.authorNameInput.addEventListener('input', () => {
    const val = dom.authorNameInput.value.trim();
    if (val) {
      localStorage.setItem('ranheim_active_user_name', val);
    }
  });

  dom.saveTipBtn.addEventListener('click', () => {
    const author = dom.authorNameInput.value.trim();
    if (!author) {
      alert('Vennligst skriv inn navnet ditt før du lagrer!');
      dom.authorNameInput.focus();
      return;
    }

    try {
      StorageManager.saveTip(author, currentPredictionTable, currentEditingTipId);
      localStorage.setItem('ranheim_active_user_name', author);
      updateExistingTipsDropdown();
      renderLeaderboard();
      renderGroupStats();
      renderGamificationHub();
      renderPlayoffBracket();
      switchTab('leaderboard');
    } catch (err) {
      alert('Feil ved lagring: ' + err.message);
    }
  });

  /* ==========================================================================
     5. FANE 2: FORELØPIG RESULTATTAVLE (MOBIL-KORT + PODIUM)
     ========================================================================== */

  dom.systemButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.systemButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSystem = btn.dataset.system;
      StorageManager.saveActiveSystem(activeSystem);
      renderLeaderboard();
      renderGamificationHub();
    });
  });

  function getActiveStandings() {
    return StorageManager.getFasit();
  }

  function renderLeaderboard() {
    const tips = StorageManager.getTips();
    const currentFasit = getActiveStandings();

    dom.participantCount.textContent = tips.length;

    // Aktiver riktig system-pill
    dom.systemButtons.forEach(btn => {
      if (btn.dataset.system === activeSystem) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (tips.length === 0) {
      dom.podiumContainer.innerHTML = '<div class="text-center py-6 text-xs text-slate-500 font-bold">Ingen tabelltips lagret ennå.</div>';
      dom.leaderboardCardsContainer.innerHTML = '<div class="text-center py-4 text-xs text-slate-500">Bli den første til å tippe!</div>';
      return;
    }

    const ranked = rankLeaderboard(tips, currentFasit, activeSystem);
    const withBadges = assignBadges(ranked, currentFasit);

    withBadges.forEach((p, idx) => {
      if (window.GamificationEngine) {
        p.profile = GamificationEngine.calculatePlayerProfile(p, currentFasit, activeSystem, idx + 1);
      }
    });

    renderPodiumCards(withBadges);
    renderParticipantListCards(withBadges);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function renderPodiumCards(participants) {
    const p1 = participants[0];
    const p2 = participants[1];
    const p3 = participants[2];

    const isKlassisk = (activeSystem === 'klassisk');

    const renderCard = (p, rankNum, cardClass, badge, titleColor) => {
      if (!p) {
        return `<div class="sports-card p-3 text-center text-xs text-slate-600 flex-1">-</div>`;
      }

      const ovr = p.profile ? p.profile.overallRating : 75;
      const scoreDisplay = isKlassisk ? `${p.score} avvik` : `${p.score}p`;
      const subDisplay = isKlassisk ? `🎯 ${p.exactHits} fulltreffere` : `🎯 ${p.exactHits} treff`;

      return `
        <div onclick="window.openXrayModal('${p.id}')" class="sports-card ${cardClass} p-3 text-center cursor-pointer flex-1 transition-all active:scale-95 space-y-1">
          <div class="text-lg">${badge}</div>
          <div class="text-[9px] font-black uppercase tracking-wider ${titleColor}">#${rankNum}</div>
          <div class="text-xs font-black text-white truncate">${p.author}</div>
          <div class="text-sm font-black text-white">${scoreDisplay}</div>
          <div class="text-[10px] text-emerald-400 font-bold">${subDisplay}</div>
          <div class="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-black/40 text-amber-300 border border-white/10 mt-1">
            ${ovr} OVR
          </div>
        </div>
      `;
    };

    dom.podiumContainer.innerHTML = `
      <div class="flex items-end gap-2 pt-1 pb-1">
        <!-- 2. Plass -->
        ${renderCard(p2, 2, 'podium-card-silver', '🥈', 'text-slate-400')}
        <!-- 1. Plass -->
        ${renderCard(p1, 1, 'podium-card-gold -translate-y-1', '👑', 'text-amber-400')}
        <!-- 3. Plass -->
        ${renderCard(p3, 3, 'podium-card-bronze', '🥉', 'text-amber-600')}
      </div>
    `;
  }

  function renderParticipantListCards(participants) {
    dom.leaderboardCardsContainer.innerHTML = '';
    const isKlassisk = (activeSystem === 'klassisk');

    participants.forEach((p) => {
      const prof = p.profile;
      const ovr = prof ? prof.overallRating : 75;
      const level = prof ? prof.level : { title: 'Benkesliter', badge: '🥉' };
      const isHot = prof && prof.isHotStreak;

      const scoreDisplay = isKlassisk ? `${p.score} avvik` : `${p.score}p`;
      const subDisplay = isKlassisk 
        ? `🎯 ${p.exactHits} fulltreffere` 
        : `🎯 ${p.exactHits} · ${p.totalDiff} pl`;

      const card = document.createElement('div');
      card.className = 'sports-card p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.03] transition-all active:scale-[0.99]';
      card.onclick = () => window.openXrayModal(p.id);

      card.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-xs font-black text-slate-300 flex-shrink-0">
            ${p.rank}
          </span>
          
          <div class="min-w-0">
            <div class="font-extrabold text-sm text-white flex items-center gap-1.5 truncate">
              <span>${p.author}</span>
              ${p.author.toLowerCase().includes('ranheim') ? '<span class="text-xs">💙</span>' : ''}
              ${isHot ? '<span class="text-[9px] font-black text-rose-400 bg-rose-950 px-1.5 py-0.2 rounded border border-rose-800">🔥</span>' : ''}
            </div>
            <div class="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <span>${level.badge} ${level.title}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 flex-shrink-0 text-right">
          <div class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-amber-300 font-black text-xs">
            <span>🃏 ${ovr}</span>
          </div>

          <div>
            <div class="text-sm font-black text-sky-400 leading-none">${scoreDisplay}</div>
            <div class="text-[10px] text-emerald-400 font-bold mt-1">${subDisplay}</div>
          </div>

          <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
        </div>
      `;

      dom.leaderboardCardsContainer.appendChild(card);
    });
  }

  /* ==========================================================================
     6. FANE 3: GRUPPE-STATS FOR ALLE SOM ER MED (KONSENSUS, H2H, SUPERLATIVER)
     ========================================================================== */

  let h2hSelectedUserA = null;
  let h2hSelectedUserB = null;

  function renderGroupStats() {
    const tips = StorageManager.getTips();
    const currentFasit = getActiveStandings();

    if (!dom.tabContentGroupStats) return;

    if (dom.groupStatsCountLabel) {
      dom.groupStatsCountLabel.textContent = `${tips.length} deltakere`;
    }

    if (tips.length === 0) {
      if (dom.groupRecordsContainer) {
        dom.groupRecordsContainer.innerHTML = '<div class="col-span-2 text-center py-4 text-xs text-slate-500 font-bold">Ingen tips lagret ennå.</div>';
      }
      if (dom.h2hComparisonContainer) {
        dom.h2hComparisonContainer.innerHTML = '<div class="text-center py-4 text-xs text-slate-500">Minst to deltakere kreves for H2H-duell.</div>';
      }
      if (dom.consensusListContainer) {
        dom.consensusListContainer.innerHTML = '<div class="text-center py-4 text-xs text-slate-500">Ingen tips å beregne snitt fra.</div>';
      }
      return;
    }

    // 1. Gruppe-superlativer
    renderGroupSuperlatives(tips, currentFasit);

    // 2. Head-to-Head (H2H) duell
    setupH2HControls(tips, currentFasit);

    // 3. Folkets Tabell (Konsensus)
    renderConsensusTable(tips, currentFasit);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function renderGroupSuperlatives(tips, currentFasit) {
    if (!dom.groupRecordsContainer) return;
    dom.groupRecordsContainer.innerHTML = '';

    const ranked = rankLeaderboard(tips, currentFasit, activeSystem);
    const ranheimReport = window.StatsEngine ? StatsEngine.getTeamBeliefReport('ranheim', tips) : null;

    // Mest fulltreffere
    const mostExact = [...ranked].sort((a, b) => b.exactHits - a.exactHits)[0];

    // Lavest totalavvik (Tabell-orakel)
    const bestDev = [...ranked].sort((a, b) => a.totalDiff - b.totalDiff)[0];

    // Ranheim optimisme
    const ranheimOpt = ranheimReport ? ranheimReport.highest : null;
    const ranheimAvg = ranheimReport ? ranheimReport.avgPos : '-';

    const cards = [
      {
        title: 'Ranheim-patriot 💙',
        value: ranheimOpt ? `${ranheimOpt.author}` : '-',
        sub: ranheimOpt ? `Tippet #${ranheimOpt.predictedPos} (Snitt: #${ranheimAvg})` : '',
        bg: 'border-sky-500/30 bg-sky-950/20 text-sky-300'
      },
      {
        title: 'Fulltreffer-konge 🎯',
        value: mostExact ? `${mostExact.author}` : '-',
        sub: mostExact ? `${mostExact.exactHits} innertiere (spot-on)` : '',
        bg: 'border-amber-500/30 bg-amber-950/20 text-amber-300'
      },
      {
        title: 'Tabell-orakel ⚡',
        value: bestDev ? `${bestDev.author}` : '-',
        sub: bestDev ? `Kun ${bestDev.totalDiff} plasser totalavvik` : '',
        bg: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
      },
      {
        title: 'Gruppas Konsensus 👥',
        value: `${tips.length} tips registrert`,
        sub: `Snittavvik: ${(ranked.reduce((acc, r) => acc + r.totalDiff, 0) / ranked.length).toFixed(1)} plasser`,
        bg: 'border-purple-500/30 bg-purple-950/20 text-purple-300'
      }
    ];

    cards.forEach(c => {
      const el = document.createElement('div');
      el.className = `p-3 rounded-xl border ${c.bg} flex flex-col justify-between`;
      el.innerHTML = `
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${c.title}</div>
        <div class="text-sm font-black text-white mt-1 truncate">${c.value}</div>
        <div class="text-[10px] text-slate-400 mt-0.5 truncate">${c.sub}</div>
      `;
      dom.groupRecordsContainer.appendChild(el);
    });
  }

  function setupH2HControls(tips, currentFasit) {
    if (!dom.h2hSelectA || !dom.h2hSelectB || !dom.h2hComparisonContainer) return;

    const savedA = h2hSelectedUserA || (tips[0] ? tips[0].id : null);
    let savedB = h2hSelectedUserB || (tips[1] ? tips[1].id : (tips[0] ? tips[0].id : null));
    if (savedB === savedA && tips.length > 1) {
      savedB = tips[1].id;
    }

    h2hSelectedUserA = savedA;
    h2hSelectedUserB = savedB;

    dom.h2hSelectA.innerHTML = '';
    tips.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.author;
      if (t.id === h2hSelectedUserA) opt.selected = true;
      dom.h2hSelectA.appendChild(opt);
    });

    dom.h2hSelectB.innerHTML = '';
    tips.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.author;
      if (t.id === h2hSelectedUserB) opt.selected = true;
      dom.h2hSelectB.appendChild(opt);
    });

    dom.h2hSelectA.onchange = (e) => {
      h2hSelectedUserA = e.target.value;
      renderH2HDuel(tips, currentFasit);
    };

    dom.h2hSelectB.onchange = (e) => {
      h2hSelectedUserB = e.target.value;
      renderH2HDuel(tips, currentFasit);
    };

    renderH2HDuel(tips, currentFasit);
  }

  function renderH2HDuel(tips, currentFasit) {
    if (!dom.h2hComparisonContainer || !window.StatsEngine) return;
    if (tips.length < 2) {
      dom.h2hComparisonContainer.innerHTML = '<div class="text-xs text-slate-500 text-center py-2">Minst to deltakere kreves for å kjøre duell.</div>';
      return;
    }

    const duell = StatsEngine.compareH2H(h2hSelectedUserA, h2hSelectedUserB, tips, currentFasit, activeSystem);
    if (!duell) {
      dom.h2hComparisonContainer.innerHTML = '<div class="text-xs text-slate-500 text-center py-2">Velg to deltakere i listene over.</div>';
      return;
    }

    const isKlassisk = (activeSystem === 'klassisk');
    const unit = isKlassisk ? 'avvik' : 'p';

    const leaderText = duell.leader === 'Uavgjort'
      ? '🤝 Helt likt mellom begge!'
      : `👑 ${duell.leader} leder duellen!`;

    // Finn største uenighet mellom de to
    let biggestDisagreement = null;
    let maxDiff = -1;
    const pA = tips.find(t => t.id === h2hSelectedUserA);
    const pB = tips.find(t => t.id === h2hSelectedUserB);

    if (pA && pB) {
      window.TEAMS.forEach(team => {
        const posA = pA.table.indexOf(team.id) + 1;
        const posB = pB.table.indexOf(team.id) + 1;
        const diff = Math.abs(posA - posB);
        if (diff > maxDiff) {
          maxDiff = diff;
          biggestDisagreement = {
            teamName: team.name,
            posA,
            posB,
            diff
          };
        }
      });
    }

    dom.h2hComparisonContainer.innerHTML = `
      <div class="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
        <span class="text-xs font-black text-amber-300">${leaderText}</span>
        <span class="text-[10px] text-slate-400 font-bold">${duell.identicalPositions} av 16 lag like</span>
      </div>

      <div class="grid grid-cols-2 gap-2 text-center text-xs">
        <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
          <div class="font-extrabold text-white text-sm truncate">${duell.userA.author}</div>
          <div class="text-sky-400 font-black">${duell.userA.score} ${unit}</div>
          <div class="text-[10px] text-emerald-400 font-bold">🎯 ${duell.userA.exactHits} innertiere</div>
          <div class="text-[10px] text-slate-400">Ranheim: #${duell.userA.ranheimPos}</div>
        </div>

        <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
          <div class="font-extrabold text-white text-sm truncate">${duell.userB.author}</div>
          <div class="text-sky-400 font-black">${duell.userB.score} ${unit}</div>
          <div class="text-[10px] text-emerald-400 font-bold">🎯 ${duell.userB.exactHits} innertiere</div>
          <div class="text-[10px] text-slate-400">Ranheim: #${duell.userB.ranheimPos}</div>
        </div>
      </div>

      ${biggestDisagreement ? `
        <div class="text-[10px] text-slate-400 bg-white/[0.02] p-2 rounded-lg border border-white/5 flex items-center justify-between">
          <span>Største uenighet: <strong class="text-white">${biggestDisagreement.teamName}</strong></span>
          <span class="text-slate-300 font-bold">#${biggestDisagreement.posA} vs #${biggestDisagreement.posB} (${biggestDisagreement.diff} plasser)</span>
        </div>
      ` : ''}
    `;
  }

  function renderConsensusTable(tips, currentFasit) {
    if (!dom.consensusListContainer || !window.StatsEngine) return;
    dom.consensusListContainer.innerHTML = '';

    const consensus = StatsEngine.calculateConsensus(tips, currentFasit);
    if (!consensus || consensus.length === 0) return;

    consensus.forEach((item) => {
      const team = getTeamById(item.teamId);
      if (!team) return;

      const isRanheim = team.isRanheim;
      const stripeClass = getZoneStripeClass(item.consensusRank);

      let diffBadge = '';
      if (item.difference > 0) {
        diffBadge = `<span class="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">+${item.difference.toFixed(1)}</span>`;
      } else if (item.difference < 0) {
        diffBadge = `<span class="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800">${item.difference.toFixed(1)}</span>`;
      } else {
        diffBadge = `<span class="text-[10px] font-bold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">🎯 Spot on</span>`;
      }

      const row = document.createElement('div');
      row.className = `p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2 ${stripeClass} ${isRanheim ? 'team-row-ranheim' : ''}`;

      row.innerHTML = `
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <span class="w-5 text-center font-black text-xs text-slate-400">${item.consensusRank}</span>
          <img src="${team.logoUrl}" alt="${team.name}" class="w-5 h-5 object-contain flex-shrink-0" onerror="this.style.display='none'">
          <div class="truncate">
            <span class="font-extrabold text-xs ${isRanheim ? 'text-cyan-300' : 'text-white'}">${team.name}</span>
            ${isRanheim ? '<span class="ml-1 text-[10px]">💙</span>' : ''}
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0 text-right">
          <div class="text-[10px] text-slate-400">
            Snitt: <strong class="text-white">#${item.avgPos}</strong>
            <span class="text-[9px] text-slate-500 block">Spenn: #${item.highestTipped}-#${item.lowestTipped}</span>
          </div>
          ${diffBadge}
        </div>
      `;

      dom.consensusListContainer.appendChild(row);
    });
  }

  /* ==========================================================================
     7. FANE 4: PLAYOFF & GAMIFICATION
     ========================================================================== */

  function renderGamificationHub() {
    const tips = StorageManager.getTips();
    const currentFasit = getActiveStandings();
    if (tips.length === 0) return;

    // Aktiv deltaker
    const savedActiveName = localStorage.getItem('ranheim_active_user_name');
    let activeParticipant = null;

    if (currentEditingTipId) {
      activeParticipant = tips.find(t => t.id === currentEditingTipId);
    } else if (savedActiveName) {
      activeParticipant = tips.find(t => t.author.toLowerCase() === savedActiveName.toLowerCase());
    }

    if (!activeParticipant && dom.authorNameInput && dom.authorNameInput.value.trim()) {
      const typed = dom.authorNameInput.value.trim().toLowerCase();
      activeParticipant = tips.find(t => t.author.toLowerCase() === typed);
    }

    if (!activeParticipant) {
      activeParticipant = tips[0];
    }
    if (!activeParticipant || !window.GamificationEngine) return;

    // Populer nedtrekksliste for profilvalg
    if (dom.profileUserSelect) {
      dom.profileUserSelect.innerHTML = '';
      tips.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.author;
        opt.textContent = t.author;
        if (t.author.toLowerCase() === activeParticipant.author.toLowerCase()) {
          opt.selected = true;
        }
        dom.profileUserSelect.appendChild(opt);
      });

      dom.profileUserSelect.onchange = (e) => {
        const chosen = e.target.value;
        localStorage.setItem('ranheim_active_user_name', chosen);
        renderGamificationHub();
      };
    }

    const ranked = rankLeaderboard(tips, currentFasit, activeSystem);
    const rank = ranked.findIndex(r => r.author === activeParticipant.author) + 1 || 1;
    const profile = GamificationEngine.calculatePlayerProfile(activeParticipant, currentFasit, activeSystem, rank);

    // Oppdater top chip
    if (dom.activeUserName) dom.activeUserName.textContent = profile.author;
    if (dom.activeUserBadge) dom.activeUserBadge.textContent = profile.level.badge;
    if (dom.activeUserLevel) dom.activeUserLevel.textContent = `${profile.level.title} • ${profile.xp} XP (Nivå ${profile.level.level})`;
    if (dom.userCardAvatar) dom.userCardAvatar.textContent = `${profile.overallRating}`;

    if (dom.openActivePlayerCardBtn) {
      dom.openActivePlayerCardBtn.onclick = () => window.openPlayerCardModal(profile.author);
    }

    // Render prestasjoner / trofeer
    if (dom.achievementsGrid) {
      dom.achievementsGrid.innerHTML = '';
      const { unlockedAchievements } = profile;

      window.ACHIEVEMENTS.forEach(ach => {
        const isUnlocked = unlockedAchievements.some(u => u.id === ach.id);
        const card = document.createElement('div');
        card.className = `p-2.5 rounded-xl border flex flex-col justify-between ${
          isUnlocked
            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
            : 'bg-black/30 border-white/5 text-slate-400'
        }`;

        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between text-xs font-black">
              <span>${ach.title}</span>
              <span class="${isUnlocked ? 'text-emerald-400' : 'text-slate-500'}">${isUnlocked ? '✓' : `+${ach.xpReward} XP`}</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5 line-clamp-2">${ach.description}</div>
          </div>
        `;
        dom.achievementsGrid.appendChild(card);
      });

      if (dom.trophyCountLabel) {
        dom.trophyCountLabel.textContent = `${unlockedAchievements.length} av ${window.ACHIEVEMENTS.length} trofeer låst opp`;
      }
    }
  }

  function renderPlayoffBracket() {
    if (!dom.playoffBracketContainer || !window.PlayoffEngine) return;

    // Playoff-lagene tilpasses direkte etter hvordan brukeren har satt sitt tabelltips!
    const tableToUse = (currentPredictionTable && currentPredictionTable.length === 16)
      ? currentPredictionTable
      : getActiveStandings();

    const playoffData = PlayoffEngine.getPlayoffMatches(tableToUse);
    if (!playoffData) return;

    dom.playoffBracketContainer.innerHTML = '';

    const getTeamDisplay = (teamId) => {
      if (teamId === 'Eliteserie-lag') {
        return { name: 'Eliteserie-lag (Nr. 14)', logoUrl: '' };
      }
      if (teamId === 'PostNord-lag') {
        return { name: 'PostNord-lag', logoUrl: '' };
      }
      return getTeamById(teamId) || { name: teamId, logoUrl: '' };
    };

    playoffData.eliteseriePlayoff.forEach(m => {
      const homeTeam = getTeamDisplay(m.homeTeamId);
      const awayTeam = getTeamDisplay(m.awayTeamId);

      const isHomeWinner = m.winnerId === m.homeTeamId;
      const isAwayWinner = m.winnerId === m.awayTeamId;

      const card = document.createElement('div');
      card.className = 'sports-card p-2.5 border border-white/10 space-y-1.5';

      card.innerHTML = `
        <div class="flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span class="text-cyan-400 uppercase font-black">${m.stage}</span>
          <span>${m.date}</span>
        </div>

        <div class="grid grid-cols-2 gap-1.5 pt-0.5">
          <!-- Hjemmelag -->
          <div onclick="window.pickPlayoffWinner(${m.matchNumber}, '${m.homeTeamId}')" class="p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            isHomeWinner
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-black'
              : 'bg-black/30 border-white/5 text-slate-300'
          }">
            <div class="flex items-center gap-1.5 min-w-0">
              ${homeTeam.logoUrl ? `<img src="${homeTeam.logoUrl}" class="w-4 h-4 object-contain">` : '<span class="text-xs">⚽</span>'}
              <span class="text-xs truncate font-bold">${homeTeam.name}</span>
            </div>
            ${isHomeWinner ? '<span class="text-[10px]">🏆</span>' : ''}
          </div>

          <!-- Bortelag -->
          <div onclick="window.pickPlayoffWinner(${m.matchNumber}, '${m.awayTeamId}')" class="p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            isAwayWinner
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-black'
              : 'bg-black/30 border-white/5 text-slate-300'
          }">
            <div class="flex items-center gap-1.5 min-w-0">
              ${awayTeam.logoUrl ? `<img src="${awayTeam.logoUrl}" class="w-4 h-4 object-contain">` : '<span class="text-xs">⚽</span>'}
              <span class="text-xs truncate font-bold">${awayTeam.name}</span>
            </div>
            ${isAwayWinner ? '<span class="text-[10px]">🏆</span>' : ''}
          </div>
        </div>
      `;

      dom.playoffBracketContainer.appendChild(card);
    });

    // OBOS Kvalik
    if (dom.playoffRelegationContainer) {
      const obosM = playoffData.obosPlayoff;
      const obosTeam = getTeamDisplay(obosM.homeTeamId);
      const isObosWinner = obosM.winnerId === obosM.homeTeamId;

      dom.playoffRelegationContainer.innerHTML = `
        <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
          <span>OBOS-kvalik (${obosM.date})</span>
          <span class="text-[10px] text-amber-400">Kamp 3 & 4</span>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          <div onclick="window.pickPlayoffWinner('obos', '${obosM.homeTeamId}')" class="p-2 rounded-xl border flex items-center justify-between cursor-pointer ${
            isObosWinner
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-black'
              : 'bg-black/30 border-white/5 text-slate-300'
          }">
            <div class="flex items-center gap-1.5 min-w-0">
              ${obosTeam.logoUrl ? `<img src="${obosTeam.logoUrl}" class="w-4 h-4 object-contain">` : '<span class="text-xs">⚽</span>'}
              <span class="text-xs truncate font-bold">${obosTeam.name}</span>
            </div>
            ${isObosWinner ? '<span class="text-[10px]">🏆</span>' : ''}
          </div>

          <div onclick="window.pickPlayoffWinner('obos', 'PostNord-lag')" class="p-2 rounded-xl border flex items-center justify-between cursor-pointer ${
            !isObosWinner
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-black'
              : 'bg-black/30 border-white/5 text-slate-300'
          }">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-xs">⚽</span>
              <span class="text-xs truncate font-bold">PostNord-lag</span>
            </div>
            ${!isObosWinner ? '<span class="text-[10px]">🏆</span>' : ''}
          </div>
        </div>
      `;
    }
  }

  window.pickPlayoffWinner = function (matchNumber, winnerId) {
    if (!window.PlayoffEngine) return;
    PlayoffEngine.setWinner(matchNumber, winnerId);
    renderPlayoffBracket();
  };

  if (dom.savePlayoffTipsBtn) {
    dom.savePlayoffTipsBtn.addEventListener('click', () => {
      alert('Playoff-tips låst! Riktige vinnere gir +15 bonuspoeng og +50 XP per kamp når playoff spilles.');
    });
  }

  function renderOfficialLiveTable() {
    if (!dom.officialLiveTableContainer) return;
    const details = window.LIVE_TABLE_DETAILS_2026 || [];
    dom.officialLiveTableContainer.innerHTML = '';

    details.forEach(item => {
      const team = getTeamById(item.id);
      if (!team) return;
      const isRanheim = team.isRanheim;

      const row = document.createElement('div');
      row.className = `flex items-center justify-between p-2 rounded-xl border text-xs ${
        isRanheim ? 'team-row-ranheim' : 'bg-black/30 border-white/5'
      }`;

      row.innerHTML = `
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-4 text-center font-black text-slate-400">${item.rank}</span>
          <img src="${team.logoUrl}" alt="${team.name}" class="w-4 h-4 object-contain flex-shrink-0" onerror="this.style.display='none'">
          <span class="font-extrabold truncate ${isRanheim ? 'text-cyan-300' : 'text-white'}">
            ${team.name}
          </span>
          ${isRanheim ? '💙' : ''}
        </div>

        <div class="flex items-center gap-2.5 text-right flex-shrink-0 text-slate-300 font-bold">
          <span class="text-slate-500 text-[10px]">${item.played}k</span>
          <span class="text-slate-400 text-[10px]">${item.goals}</span>
          <span class="px-1.5 py-0.5 rounded bg-white/10 text-emerald-400 font-black text-xs">
            ${item.points}p
          </span>
        </div>
      `;

      dom.officialLiveTableContainer.appendChild(row);
    });
  }

  if (dom.quickApiFetchBtn) {
    dom.quickApiFetchBtn.addEventListener('click', () => {
      alert('Tabellen er oppdatert med ferske 2026-data etter runde 28!');
      renderOfficialLiveTable();
      renderLeaderboard();
    });
  }

  /* ==========================================================================
     7. FANE 4: FASIT & ADMIN
     ========================================================================== */

  function renderFasitList() {
    const fasit = StorageManager.getFasit();
    dom.fasitList.innerHTML = '';

    fasit.forEach((teamId, index) => {
      const pos = index + 1;
      const team = getTeamById(teamId);
      if (!team) return;

      const row = document.createElement('div');
      row.className = 'sports-card p-2 flex items-center justify-between text-xs border border-white/5';
      row.dataset.id = team.id;

      row.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-5 text-center font-black text-slate-400">${pos}</span>
          <img src="${team.logoUrl}" class="w-5 h-5 object-contain">
          <span class="font-bold text-white">${team.name}</span>
          ${team.isRanheim ? '💙' : ''}
        </div>
        <div class="drag-handle-fasit cursor-grab p-1 text-slate-500">≡</div>
      `;

      dom.fasitList.appendChild(row);
    });
  }

  function initSortableFasit() {
    if (sortableFasit) sortableFasit.destroy();
    if (!dom.fasitList) return;

    sortableFasit = new Sortable(dom.fasitList, {
      animation: 150,
      handle: '.drag-handle-fasit',
      onEnd: () => {
        const rows = dom.fasitList.querySelectorAll('[data-id]');
        const newFasit = Array.from(rows).map(row => row.dataset.id);
        StorageManager.saveFasit(newFasit);
        renderLeaderboard();
        renderPlayoffBracket();
      }
    });
  }

  if (dom.saveFasitBtn) {
    dom.saveFasitBtn.addEventListener('click', () => {
      const rows = dom.fasitList.querySelectorAll('[data-id]');
      const newFasit = Array.from(rows).map(row => row.dataset.id);
      StorageManager.saveFasit(newFasit);
      alert('Fasittabell lagret!');
      renderLeaderboard();
      renderPlayoffBracket();
    });
  }

  if (dom.fetchApiFasitBtn) {
    dom.fetchApiFasitBtn.addEventListener('click', () => {
      StorageManager.saveFasit(window.DEFAULT_FASIT || []);
      renderFasitList();
      renderLeaderboard();
      renderPlayoffBracket();
      alert('Gjenopprettet offisiell 2026-tabell fra API!');
    });
  }

  if (dom.exportJsonBtn) {
    dom.exportJsonBtn.addEventListener('click', () => {
      const data = StorageManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ranheim-tabelltips-backup-${Date.now()}.json`;
      a.click();
    });
  }

  if (dom.importJsonInput) {
    dom.importJsonInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          StorageManager.importData(event.target.result);
          alert('Data importert!');
          initApp();
        } catch (err) {
          alert('Kunne ikke importere filen: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  if (dom.resetDemoBtn) {
    dom.resetDemoBtn.addEventListener('click', () => {
      if (confirm('Nullstille alle tips til testdata?')) {
        StorageManager.resetToDemo();
        initApp();
      }
    });
  }

  /* ==========================================================================
     8. MODAL 1: DETALJERT TIPSANALYSE (SIDE-OM-SIDE)
     ========================================================================== */

  window.openXrayModal = function (participantId) {
    const tips = StorageManager.getTips();
    const currentFasit = getActiveStandings();
    const participant = tips.find(t => t.id === participantId);
    if (!participant) return;

    activeParticipantForAnalysis = participant;
    const evaluation = evaluatePrediction(participant.table, currentFasit, activeSystem);
    const ranked = rankLeaderboard(tips, currentFasit, activeSystem);
    const withBadges = assignBadges(ranked, currentFasit);
    const participantWithBadges = withBadges.find(p => p.id === participantId);

    dom.xrayAuthorName.textContent = participant.author;
    dom.xraySummarySubtitle.textContent = `${evaluation.score} poeng · 🎯 ${evaluation.exactHits} fulltreffere · ${evaluation.totalDiff} plasser avvik`;

    // Badges
    dom.xrayBadgesBar.innerHTML = '';
    if (participantWithBadges && participantWithBadges.badges) {
      participantWithBadges.badges.forEach(b => {
        const span = document.createElement('span');
        span.className = `text-[10px] px-2 py-0.5 rounded-full border ${b.colorClass} font-bold`;
        span.textContent = b.label;
        dom.xrayBadgesBar.appendChild(span);
      });
    }

    // Rader
    dom.xrayRowsContainer.innerHTML = '';
    evaluation.teamBreakdowns.forEach(item => {
      const team = getTeamById(item.teamId);
      if (!team) return;

      const isExact = (item.diff === 0);
      const isClose = (item.diff <= 2 && !isExact);

      let diffBadge = '';
      if (isExact) {
        diffBadge = '<span class="text-emerald-400 font-black">🎯 Treff</span>';
      } else if (item.actualPos < item.predictedPos) {
        diffBadge = `<span class="text-amber-400 font-bold">▲ +${item.predictedPos - item.actualPos}</span>`;
      } else {
        diffBadge = `<span class="text-rose-400 font-bold">▼ -${item.actualPos - item.predictedPos}</span>`;
      }

      const row = document.createElement('div');
      row.className = `grid grid-cols-12 items-center p-2 rounded-xl text-xs border ${
        isExact
          ? 'bg-emerald-950/40 border-emerald-500/50'
          : isClose
          ? 'bg-black/30 border-white/10'
          : 'bg-black/50 border-rose-950/50'
      }`;

      row.innerHTML = `
        <div class="col-span-1 text-center font-black text-slate-400">${item.predictedPos}</div>
        <div class="col-span-5 flex items-center gap-1.5 truncate">
          <img src="${team.logoUrl}" class="w-4 h-4 object-contain flex-shrink-0">
          <span class="font-bold truncate text-white">${team.name}</span>
        </div>
        <div class="col-span-3 text-center text-slate-300 font-semibold">${item.actualPos}. plass</div>
        <div class="col-span-3 text-right">${diffBadge}</div>
      `;

      dom.xrayRowsContainer.appendChild(row);
    });

    dom.xrayModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  };

  dom.closeXrayBtn.addEventListener('click', () => dom.xrayModal.classList.add('hidden'));
  dom.closeXrayBottomBtn.addEventListener('click', () => dom.xrayModal.classList.add('hidden'));
  dom.xrayModal.addEventListener('click', (e) => {
    if (e.target === dom.xrayModal) dom.xrayModal.classList.add('hidden');
  });

  if (dom.xrayOpenCardBtn) {
    dom.xrayOpenCardBtn.addEventListener('click', () => {
      if (activeParticipantForAnalysis) {
        dom.xrayModal.classList.add('hidden');
        window.openPlayerCardModal(activeParticipantForAnalysis.author);
      }
    });
  }

  /* ==========================================================================
     9. MODAL 2: DELBART BILDE (HTML2CANVAS)
     ========================================================================== */

  dom.openShareModalBtn.addEventListener('click', () => {
    const author = dom.authorNameInput.value.trim() || 'Mitt Tabelltips';
    dom.shareCardAuthor.textContent = author;
    dom.shareCardTable.innerHTML = '';

    currentPredictionTable.forEach((teamId, index) => {
      const pos = index + 1;
      const team = getTeamById(teamId);
      if (!team) return;

      const row = document.createElement('div');
      row.className = `flex items-center justify-between py-0.5 px-2 rounded ${
        team.isRanheim ? 'bg-sky-950 text-cyan-300 font-black' : 'bg-white/5'
      }`;

      row.innerHTML = `
        <div class="flex items-center gap-1.5 truncate">
          <span class="w-3 text-slate-400 font-bold">${pos}</span>
          <img src="${team.logoUrl}" class="w-3.5 h-3.5 object-contain">
          <span class="truncate">${team.name}</span>
          ${team.isRanheim ? '💙' : ''}
        </div>
      `;
      dom.shareCardTable.appendChild(row);
    });

    dom.shareModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  });

  dom.closeShareBtn.addEventListener('click', () => dom.shareModal.classList.add('hidden'));
  dom.shareModal.addEventListener('click', (e) => {
    if (e.target === dom.shareModal) dom.shareModal.classList.add('hidden');
  });

  dom.downloadImageBtn.addEventListener('click', () => {
    if (!window.html2canvas) return;
    window.html2canvas(dom.shareCardContainer, { scale: 2, backgroundColor: '#090c14' }).then(canvas => {
      const a = document.createElement('a');
      a.download = `tabelltips-2026.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    });
  });

  dom.copyImageBtn.addEventListener('click', () => {
    if (!window.html2canvas) return;
    window.html2canvas(dom.shareCardContainer, { scale: 2, backgroundColor: '#090c14' }).then(canvas => {
      canvas.toBlob(blob => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            .then(() => alert('Bilde kopiert til utklippstavlen!'))
            .catch(() => alert('Bruk "Last ned" i stedet.'));
        }
      });
    });
  });

  /* ==========================================================================
     10. MODAL 3: FUT SPILLERKORT
     ========================================================================== */

  window.openPlayerCardModal = function (authorName) {
    const tips = StorageManager.getTips();
    const currentFasit = getActiveStandings();
    const participant = tips.find(t => t.author === authorName) || tips[0];
    if (!participant || !window.GamificationEngine || !dom.playerCardModalContent) return;

    const ranked = rankLeaderboard(tips, currentFasit, activeSystem);
    const rank = ranked.findIndex(r => r.author === authorName) + 1 || 1;
    const profile = GamificationEngine.calculatePlayerProfile(participant, currentFasit, activeSystem, rank);

    dom.playerCardModalContent.innerHTML = GamificationEngine.generatePlayerCardHTML(profile, false);
    dom.playerCardModal.classList.remove('hidden');

    if (window.lucide) window.lucide.createIcons();
  };

  dom.closePlayerCardBtn.addEventListener('click', () => dom.playerCardModal.classList.add('hidden'));
  dom.playerCardModal.addEventListener('click', (e) => {
    if (e.target === dom.playerCardModal) dom.playerCardModal.classList.add('hidden');
  });

  dom.downloadPlayerCardBtn.addEventListener('click', () => {
    if (!window.html2canvas || !dom.playerCardModalContent.firstElementChild) return;
    window.html2canvas(dom.playerCardModalContent.firstElementChild, { scale: 2, backgroundColor: '#090c14' }).then(canvas => {
      const a = document.createElement('a');
      a.download = `obos-spillerkort.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    });
  });

  dom.copyPlayerCardBtn.addEventListener('click', () => {
    if (!window.html2canvas || !dom.playerCardModalContent.firstElementChild) return;
    window.html2canvas(dom.playerCardModalContent.firstElementChild, { scale: 2, backgroundColor: '#090c14' }).then(canvas => {
      canvas.toBlob(blob => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            .then(() => alert('Spillerkortet ble kopiert til utklippstavlen!'))
            .catch(() => alert('Bruk "Last ned" i stedet.'));
        }
      });
    });
  });

  /* ==========================================================================
     11. EVENT LISTENERS
     ========================================================================== */

  function setupEventListeners() {
    if (dom.tabBtnPredict) dom.tabBtnPredict.addEventListener('click', () => switchTab('predict'));
    if (dom.tabBtnLeaderboard) dom.tabBtnLeaderboard.addEventListener('click', () => switchTab('leaderboard'));
    if (dom.tabBtnGroupStats) dom.tabBtnGroupStats.addEventListener('click', () => switchTab('groupStats'));
    if (dom.tabBtnStats) dom.tabBtnStats.addEventListener('click', () => switchTab('stats'));
    if (dom.tabBtnSettings) dom.tabBtnSettings.addEventListener('click', () => switchTab('settings'));
  }

  document.addEventListener('DOMContentLoaded', checkAccess);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    checkAccess();
  }
})();
