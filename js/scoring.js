/**
 * OBOS-ligaen Poengberegningsmotor
 * Implementerer 4 dynamiske poengsystemer med detaljert analyse
 */

const SCORING_SYSTEMS = {
  KLASSISK: 'klassisk',
  INNERTIER: 'innertier',
  SONE: 'sone',
  RANHEIM_JOKER: 'ranheim_joker'
};

const SYSTEM_METADATA = {
  [SCORING_SYSTEMS.KLASSISK]: {
    id: SCORING_SYSTEMS.KLASSISK,
    name: '⛳ Klassisk Avvik',
    shortName: 'Klassisk',
    description: 'Summen av plasser man bommer med. Lavest sum er best!',
    unit: 'p bom',
    lowerIsBetter: true,
    badge: 'Lavest vinner'
  },
  [SCORING_SYSTEMS.INNERTIER]: {
    id: SCORING_SYSTEMS.INNERTIER,
    name: '🎯 Poeng + Innertier',
    shortName: 'Innertier',
    description: 'Start med 256p, trekk fra avvik, og få +5p per eksakt treff!',
    unit: 'poeng',
    lowerIsBetter: false,
    badge: 'Høyest vinner'
  },
  [SCORING_SYSTEMS.SONE]: {
    id: SCORING_SYSTEMS.SONE,
    name: '🔥 Sone-jegeren',
    shortName: 'Sone-jegeren',
    description: 'Poeng + Innertier + ekstra bonus for riktig lag i opprykk/kvalik/nedrykk!',
    unit: 'poeng',
    lowerIsBetter: false,
    badge: 'Bonus-jakt'
  },
  [SCORING_SYSTEMS.RANHEIM_JOKER]: {
    id: SCORING_SYSTEMS.RANHEIM_JOKER,
    name: '💙 Ranheim-Jokeren',
    shortName: 'Ranheim-Joker',
    description: 'Avvik og bonuser på Ranheim TF teller dobbelt (2x)!',
    unit: 'poeng',
    lowerIsBetter: false,
    badge: '2x Ranheim'
  }
};

/**
 * Beregn detaljert statistikk og poeng for ett enkelt tabelltips mot gjeldende fasit
 * @param {Array<string>} userTable - Array med 16 lag-ID-er i tippet rekkefølge (indeks 0 = 1. plass)
 * @param {Array<string>} fasitTable - Array med 16 lag-ID-er i fasit-rekkefølge
 * @param {string} system - SCORING_SYSTEMS nøkkel
 * @param {string} ranheimId - ID for Ranheim (standard 'ranheim')
 */
function evaluatePrediction(userTable, fasitTable, system = SCORING_SYSTEMS.INNERTIER, ranheimId = 'ranheim') {
  let totalDiff = 0;
  let exactHits = 0;
  let zoneBonusTotal = 0;
  let maxSingleDiff = -1;
  let maxSingleDiffTeam = null;
  let ranheimPredictedPos = null;
  let ranheimActualPos = null;
  let ranheimDiff = 0;

  const teamBreakdowns = [];

  for (let i = 0; i < userTable.length; i++) {
    const teamId = userTable[i];
    const predictedPos = i + 1; // 1-indeksert
    const actualPos = fasitTable.indexOf(teamId) + 1;
    const diff = Math.abs(predictedPos - actualPos);

    if (diff > maxSingleDiff) {
      maxSingleDiff = diff;
      maxSingleDiffTeam = teamId;
    }

    const isExact = diff === 0;
    if (isExact) {
      exactHits++;
    }

    totalDiff += diff;

    // Sone-evaluering
    let zoneBonus = 0;
    // Direkte opprykk (1-2)
    if (predictedPos <= 2 && actualPos <= 2) {
      zoneBonus += 10;
    }
    // Opprykkskvalik (3-6)
    if (predictedPos >= 3 && predictedPos <= 6 && actualPos >= 3 && actualPos <= 6) {
      zoneBonus += 5;
    }
    // Direkte nedrykk (15-16)
    if (predictedPos >= 15 && predictedPos <= 16 && actualPos >= 15 && actualPos <= 16) {
      zoneBonus += 10;
    }
    // Nedrykkskvalik (14)
    if (predictedPos === 14 && actualPos === 14) {
      zoneBonus += 5;
    }

    zoneBonusTotal += zoneBonus;

    const isRanheim = teamId === ranheimId;
    if (isRanheim) {
      ranheimPredictedPos = predictedPos;
      ranheimActualPos = actualPos;
      ranheimDiff = diff;
    }

    teamBreakdowns.push({
      teamId,
      predictedPos,
      actualPos,
      diff,
      isExact,
      zoneBonus,
      isRanheim
    });
  }

  // Beregn poengsum basert på valgt system
  let score = 0;
  let scoreDetails = '';

  switch (system) {
    case SCORING_SYSTEMS.KLASSISK:
      // Kun totalavvik (lavest er best)
      score = totalDiff;
      scoreDetails = `${totalDiff} plasser totalt avvik`;
      break;

    case SCORING_SYSTEMS.INNERTIER:
      // 256 base - avvik + (5 * innertiere)
      score = 256 - totalDiff + (exactHits * 5);
      scoreDetails = `256 - ${totalDiff} avvik + (${exactHits} 🎯 × 5) = ${score}p`;
      break;

    case SCORING_SYSTEMS.SONE:
      // 256 base - avvik + (5 * innertiere) + zoneBonusTotal
      score = 256 - totalDiff + (exactHits * 5) + zoneBonusTotal;
      scoreDetails = `Base (${256 - totalDiff}p) + Innertiere (${exactHits * 5}p) + Sonebonus (${zoneBonusTotal}p) = ${score}p`;
      break;

    case SCORING_SYSTEMS.RANHEIM_JOKER: {
      // Som innertier, men Ranheim teller 2x:
      // Ekstra Ranheim avvik-straff (trekk fra diff en gang til)
      // og ekstra Ranheim innertier-bonus hvis treff (+5 til)
      const ranheimExactBonus = (ranheimDiff === 0) ? 10 : 0;
      const otherExactHits = exactHits - (ranheimDiff === 0 ? 1 : 0);
      const regularExactBonus = otherExactHits * 5;

      const baseWithoutRanheim = 256 - (totalDiff - ranheimDiff);
      const ranheimScoreImpact = -(ranheimDiff * 2) + ranheimExactBonus;

      score = baseWithoutRanheim + ranheimScoreImpact + regularExactBonus;
      scoreDetails = `Ranheim på ${ranheimPredictedPos}. plass (fasit ${ranheimActualPos}., bom ${ranheimDiff}×2 = -${ranheimDiff * 2}p) | Totalt: ${score}p`;
      break;
    }

    default:
      score = 256 - totalDiff;
      scoreDetails = `${score}p`;
  }

  return {
    score,
    scoreDetails,
    totalDiff,
    exactHits,
    zoneBonusTotal,
    maxSingleDiff,
    maxSingleDiffTeam,
    ranheimPredictedPos,
    ranheimActualPos,
    ranheimDiff,
    teamBreakdowns
  };
}

/**
 * Beregn og sorter alle deltakere etter gjeldende poengsystem
 * @param {Array<Object>} predictions - Liste med deltakertips [{ id, author, table }]
 * @param {Array<string>} fasitTable - 16 lag i fasitrekkefølge
 * @param {string} system - Nøkkel for poengsystem
 */
function rankLeaderboard(predictions, fasitTable, system = SCORING_SYSTEMS.INNERTIER) {
  const meta = SYSTEM_METADATA[system] || SYSTEM_METADATA[SCORING_SYSTEMS.INNERTIER];

  const evaluated = predictions.map(pred => {
    const evaluation = evaluatePrediction(pred.table, fasitTable, system);
    return {
      ...pred,
      ...evaluation
    };
  });

  // Sortering: Klassisk avvik = stigende (lavest score først)
  // De andre = synkende (høyest score først)
  evaluated.sort((a, b) => {
    if (meta.lowerIsBetter) {
      if (a.score !== b.score) return a.score - b.score;
      // Tie-breaker: flest innertiere
      return b.exactHits - a.exactHits;
    } else {
      if (a.score !== b.score) return b.score - a.score;
      // Tie-breaker: færrest totalavvik
      return a.totalDiff - b.totalDiff;
    }
  });

  // Tildel rangering (1, 2, 3...)
  return evaluated.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SCORING_SYSTEMS,
    SYSTEM_METADATA,
    evaluatePrediction,
    rankLeaderboard
  };
} else if (typeof window !== 'undefined') {
  window.SCORING_SYSTEMS = SCORING_SYSTEMS;
  window.SYSTEM_METADATA = SYSTEM_METADATA;
  window.evaluatePrediction = evaluatePrediction;
  window.rankLeaderboard = rankLeaderboard;
}
