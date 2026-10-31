/**
 * OBOS Tabell-tipper Gamification Motor
 * Håndterer XP, Spillernivåer, Låsbare Prestasjoner, FUT-kort og Playoff-tipping
 */

const GAMIFICATION_LEVELS = [
  { level: 1, title: 'Benkesliter', minXp: 0, badge: '🥉', color: 'from-slate-700 to-slate-900', border: 'border-slate-600' },
  { level: 2, title: 'Roteringsspiller', minXp: 120, badge: '🥈', color: 'from-blue-900 to-slate-900', border: 'border-blue-600' },
  { level: 3, title: 'Fast i Startelleveren', minXp: 250, badge: '🥇', color: 'from-cyan-900 to-blue-950', border: 'border-cyan-500' },
  { level: 4, title: 'Publikumsyndling', minXp: 400, badge: '⭐', color: 'from-amber-900 to-yellow-950', border: 'border-amber-400' },
  { level: 5, title: 'Klubblegende', minXp: 600, badge: '👑', color: 'from-purple-950 via-indigo-900 to-sky-900', border: 'border-purple-400' }
];

const ACHIEVEMENTS = [
  {
    id: 'sniper',
    title: '🎯 Krysseren',
    description: 'Få minst 3 eksakte fulltreffere på tabellen',
    xpReward: 100,
    check: (evalData) => evalData.exactHits >= 3,
    progress: (evalData) => `${Math.min(evalData.exactHits, 3)} / 3 treff`
  },
  {
    id: 'patriot_heart',
    title: '💙 Ranheim-Hjertet',
    description: 'Tipp Ranheim innen topp 6 (opprykk eller kvalik)',
    xpReward: 80,
    check: (evalData) => evalData.ranheimPredictedPos <= 6,
    progress: (evalData) => evalData.ranheimPredictedPos <= 6 ? 'Fullført!' : `Tippet ${evalData.ranheimPredictedPos}.`
  },
  {
    id: 'iron_wall',
    title: '🛡️ Forsvarsklippe',
    description: 'Ha maks 2 plasser avvik på begge direkte nedrykkslag',
    xpReward: 70,
    check: (evalData, fasit) => {
      const bottom15 = evalData.teamBreakdowns.find(t => t.predictedPos === 15);
      const bottom16 = evalData.teamBreakdowns.find(t => t.predictedPos === 16);
      return bottom15 && bottom16 && bottom15.diff <= 2 && bottom16.diff <= 2;
    },
    progress: (evalData) => 'Fullføres ved bunntreff'
  },
  {
    id: 'top3_hunter',
    title: '🚀 Pallen i Sikte',
    description: 'Ligg på topp 3 på sammenlagttavlen',
    xpReward: 90,
    check: (evalData, fasit, rank) => rank <= 3,
    progress: (evalData, fasit, rank) => rank <= 3 ? 'På pallen!' : `Plass ${rank}`
  },
  {
    id: 'zone_master',
    title: '💎 Sonemester',
    description: 'Tipp minst 4 lag i riktig OBOS-sone (opprykk/kvalik/nedrykk)',
    xpReward: 120,
    check: (evalData) => {
      let count = 0;
      evalData.teamBreakdowns.forEach(t => {
        if (t.zoneBonus > 0) count++;
      });
      return count >= 4;
    },
    progress: (evalData) => {
      let count = 0;
      evalData.teamBreakdowns.forEach(t => {
        if (t.zoneBonus > 0) count++;
      });
      return `${Math.min(count, 4)} / 4 soner`;
    }
  },
  {
    id: 'bold_move',
    title: '⚡ Is i Årene',
    description: 'Tipp et lag utenfor topp 4 inn på direkte opprykk',
    xpReward: 60,
    check: (evalData) => {
      const p1 = evalData.teamBreakdowns.find(t => t.predictedPos === 1);
      const p2 = evalData.teamBreakdowns.find(t => t.predictedPos === 2);
      return (p1 && p1.actualPos > 4) || (p2 && p2.actualPos > 4);
    },
    progress: () => 'Aktiv'
  }
];

const GamificationEngine = {
  /**
   * Beregn XP og spillernivå for en deltaker
   */
  calculatePlayerProfile(participant, fasit, activeSystem = 'innertier', rank = 1) {
    const evaluation = window.evaluatePrediction(participant.table, fasit, activeSystem);
    
    // Grunn-XP fra poeng
    let xp = Math.max(0, evaluation.score * 2);
    
    // Bonus-XP for fulltreffere
    xp += evaluation.exactHits * 35;
    
    // Bonus-XP for lavt avvik
    if (evaluation.totalDiff <= 30) xp += 100;
    else if (evaluation.totalDiff <= 45) xp += 50;

    // Sjekk prestasjoner (Achievements)
    const unlockedAchievements = [];
    const lockedAchievements = [];

    ACHIEVEMENTS.forEach(ach => {
      const isUnlocked = ach.check(evaluation, fasit, rank);
      const progressText = ach.progress(evaluation, fasit, rank);
      if (isUnlocked) {
        xp += ach.xpReward;
        unlockedAchievements.push({ ...ach, progressText });
      } else {
        lockedAchievements.push({ ...ach, progressText });
      }
    });

    // Finn nivå
    let currentLevel = GAMIFICATION_LEVELS[0];
    let nextLevel = GAMIFICATION_LEVELS[1];

    for (let i = GAMIFICATION_LEVELS.length - 1; i >= 0; i--) {
      if (xp >= GAMIFICATION_LEVELS[i].minXp) {
        currentLevel = GAMIFICATION_LEVELS[i];
        nextLevel = GAMIFICATION_LEVELS[i + 1] || null;
        break;
      }
    }

    // Regn ut FIFA/FUT-aktige ratings (0-99)
    // 1. Treffsikkerhet (ACC)
    const accuracy = Math.min(99, Math.max(45, Math.round(99 - (evaluation.totalDiff * 1.1) + (evaluation.exactHits * 4))));
    
    // 2. Ranheim-Patriotisme (PAT)
    const patriotism = Math.min(99, Math.max(30, Math.round(100 - (evaluation.ranheimPredictedPos * 4.5))));

    // 3. Stabilitet (STA)
    const stability = Math.min(99, Math.max(40, Math.round(99 - (evaluation.maxSingleDiff * 4))));

    // 4. Taktisk Sans (TAK)
    const tactics = Math.min(99, Math.max(50, Math.round(50 + (evaluation.zoneBonusTotal * 1.5))));

    // OVR (Overall rating)
    const overallRating = Math.round((accuracy * 0.35) + (stability * 0.25) + (tactics * 0.25) + (patriotism * 0.15));

    // Formkurve / Streak
    const isHotStreak = evaluation.exactHits >= 2 || rank <= 2;

    return {
      author: participant.author,
      score: evaluation.score,
      rank,
      xp,
      level: currentLevel,
      nextLevel,
      xpToNext: nextLevel ? nextLevel.minXp - xp : 0,
      overallRating,
      stats: {
        accuracy,
        patriotism,
        stability,
        tactics
      },
      isHotStreak,
      unlockedAchievements,
      lockedAchievements,
      evaluation
    };
  },

  /**
   * Generer HTML for et rålekkert FUT/Sorare-inspirert spillerkort
   */
  generatePlayerCardHTML(profile, isCompact = false) {
    const { author, rank, xp, level, overallRating, stats, isHotStreak, unlockedAchievements } = profile;
    
    // Kortfarge basert på OVR / nivå
    let cardGradient = 'from-amber-600/30 via-yellow-700/20 to-slate-950';
    let borderColor = 'border-amber-400/60';
    let ovrGlow = 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]';
    let cardClass = 'fut-card-gold';

    if (overallRating >= 90 || level.level === 5) {
      cardGradient = 'from-purple-600/30 via-indigo-700/20 to-[#07090e]';
      borderColor = 'border-purple-400/70';
      ovrGlow = 'text-purple-300 drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]';
      cardClass = 'fut-card-legend';
    } else if (overallRating >= 80) {
      cardGradient = 'from-sky-600/30 via-blue-800/20 to-slate-950';
      borderColor = 'border-sky-400/60';
      ovrGlow = 'text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]';
      cardClass = 'fut-card-blue';
    } else if (overallRating < 70) {
      cardGradient = 'from-slate-700/30 via-slate-800/20 to-slate-950';
      borderColor = 'border-slate-500/50';
      ovrGlow = 'text-slate-300';
      cardClass = 'fut-card-silver';
    }

    if (isCompact) {
      return `
        <div class="fut-card p-3 rounded-2xl border ${borderColor} bg-gradient-to-b ${cardGradient} relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl font-black ${ovrGlow}">${overallRating}</span>
              <div>
                <div class="text-xs font-black text-white truncate max-w-[120px]">${author}</div>
                <div class="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                  <span>${level.badge}</span>
                  <span>${level.title}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-[10px] font-black text-amber-400">#${rank}</div>
              <div class="text-[9px] text-slate-400">${xp} XP</div>
            </div>
          </div>
        </div>
      `;
    }

    // Fullstendig visuelt samlekort
    const achievementsIcons = unlockedAchievements.slice(0, 4).map(a => 
      `<span title="${a.title}: ${a.description}" class="text-xs p-1 rounded-lg bg-black/40 border border-white/10">${a.title.split(' ')[0]}</span>`
    ).join('');

    return `
      <div class="fut-card ${cardClass} relative rounded-3xl p-6 border-2 ${borderColor} bg-gradient-to-b ${cardGradient} text-white shadow-2xl overflow-hidden select-none">
        
        <!-- Shimmer & Hologram Effekt -->
        <div class="fut-shimmer absolute inset-0 pointer-events-none opacity-40"></div>
        <div class="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Topp: OVR, Posisjon & Ranheim Logo -->
        <div class="relative z-10 flex items-start justify-between border-b border-white/10 pb-4">
          <div class="flex flex-col">
            <span class="text-4xl sm:text-5xl font-black tracking-tighter ${ovrGlow} leading-none">
              ${overallRating}
            </span>
            <span class="text-[11px] font-black tracking-widest uppercase text-slate-300 mt-1">
              OVR
            </span>
            <div class="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-black/50 border border-white/10 text-cyan-300">
              <span>Plass #${rank}</span>
            </div>
          </div>

          <!-- Spillerklubb / Ranheim Merke -->
          <div class="text-right flex flex-col items-end">
            <img src="https://images.fotmob.com/image_resources/logo/teamlogo/6563.png" alt="Ranheim" class="w-12 h-12 object-contain drop-shadow-md">
            <span class="text-[9px] font-black tracking-wider uppercase text-cyan-300 mt-1">RANHEIM KRAFT</span>
            ${isHotStreak ? '<span class="text-[10px] font-black text-rose-400 flex items-center gap-1 mt-1 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-600/50">🔥 I FORM</span>' : ''}
          </div>
        </div>

        <!-- Midten: Navn & Spillernivå -->
        <div class="relative z-10 py-4 text-center">
          <h2 class="text-xl sm:text-2xl font-black uppercase tracking-wide text-white drop-shadow truncate">
            ${author}
          </h2>
          
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-black/60 border border-white/10 text-slate-200 mt-1">
            <span>${level.badge}</span>
            <span>${level.title}</span>
            <span class="text-slate-400 font-normal">| Nivå ${level.level}</span>
          </div>

          <!-- XP-bar mot neste nivå -->
          <div class="mt-3 max-w-[240px] mx-auto text-left">
            <div class="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
              <span>${xp} XP</span>
              <span>${profile.nextLevel ? `Neste: ${profile.nextLevel.title} (${profile.nextLevel.minXp} XP)` : 'Maks Nivå! 👑'}</span>
            </div>
            <div class="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <div class="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500" style="width: ${profile.nextLevel ? Math.min(100, Math.round((xp / profile.nextLevel.minXp) * 100)) : 100}%"></div>
            </div>
          </div>
        </div>

        <!-- 4 Nøkkeltall (FUT Stats: ACC, PAT, STA, TAK) -->
        <div class="relative z-10 grid grid-cols-4 gap-2 pt-3 border-t border-white/10 text-center">
          <div class="p-2 rounded-xl bg-black/40 border border-white/5">
            <div class="text-base sm:text-lg font-black text-emerald-400">${stats.accuracy}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider text-slate-400">ACC</div>
            <div class="text-[8px] text-slate-500 hidden sm:block">Treff</div>
          </div>

          <div class="p-2 rounded-xl bg-black/40 border border-white/5">
            <div class="text-base sm:text-lg font-black text-sky-400">${stats.patriotism}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider text-slate-400">PAT</div>
            <div class="text-[8px] text-slate-500 hidden sm:block">Ranheim</div>
          </div>

          <div class="p-2 rounded-xl bg-black/40 border border-white/5">
            <div class="text-base sm:text-lg font-black text-amber-400">${stats.stability}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider text-slate-400">STA</div>
            <div class="text-[8px] text-slate-500 hidden sm:block">Stabilitet</div>
          </div>

          <div class="p-2 rounded-xl bg-black/40 border border-white/5">
            <div class="text-base sm:text-lg font-black text-purple-400">${stats.tactics}</div>
            <div class="text-[9px] font-bold uppercase tracking-wider text-slate-400">TAK</div>
            <div class="text-[8px] text-slate-500 hidden sm:block">Sone</div>
          </div>
        </div>

        <!-- Bunn: Opplåste Prestasjoner & Sesong 2026 -->
        <div class="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <div class="flex items-center gap-1">
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-500">Trofeer:</span>
            <div class="flex items-center gap-1">
              ${achievementsIcons || '<span class="text-[9px] text-slate-600">Ingen ennå</span>'}
            </div>
          </div>

          <div class="font-extrabold uppercase tracking-wider text-sky-400 text-[9px]">
            OBOS 2026 KORT
          </div>
        </div>

      </div>
    `;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GAMIFICATION_LEVELS,
    ACHIEVEMENTS,
    GamificationEngine
  };
} else if (typeof window !== 'undefined') {
  window.GAMIFICATION_LEVELS = GAMIFICATION_LEVELS;
  window.ACHIEVEMENTS = ACHIEVEMENTS;
  window.GamificationEngine = GamificationEngine;
}
