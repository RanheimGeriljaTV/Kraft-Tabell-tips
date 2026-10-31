/**
 * OBOS-ligaen Utmerkelser (Badges)
 * Analyserer deltakernes tips og tildeler sportsutmerkelser
 */

const BADGE_DEFINITIONS = {
  FULLTREFFER: {
    id: 'fulltreffer',
    label: '🎯 Flest Fulltreffere',
    description: 'Flest eksakte plasseringer i gruppen',
    colorClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60'
  },
  PATRIOT: {
    id: 'patriot',
    label: '💙 Ranheim-tro',
    description: 'Har tippet Ranheim høyest på tabellen',
    colorClass: 'bg-sky-950/70 text-sky-200 border-sky-400/60'
  },
  RISIKO: {
    id: 'risiko',
    label: '⚡ Høyeste Risiko',
    description: 'Har det største enkeltavviket på ett lag',
    colorClass: 'bg-amber-950/70 text-amber-300 border-amber-500/60'
  },
  PRESIS: {
    id: 'presis',
    label: '⚖️ Mest Presis',
    description: 'Lavest totalt avvik fra gjeldende fasit',
    colorClass: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/60'
  }
};

/**
 * Analyser deltakerlisten og tildel utmerkelser
 */
function assignBadges(evaluatedList, fasitTable) {
  if (!evaluatedList || evaluatedList.length === 0) return evaluatedList;

  const maxExact = Math.max(...evaluatedList.map(p => p.exactHits || 0));
  const bestRanheimPos = Math.min(...evaluatedList.map(p => p.ranheimPredictedPos || 16));
  const worstSingleDiff = Math.max(...evaluatedList.map(p => p.maxSingleDiff || 0));
  const minTotalDiff = Math.min(...evaluatedList.map(p => p.totalDiff));

  return evaluatedList.map(participant => {
    const badges = [];

    // Fulltreffere
    if (maxExact > 0 && participant.exactHits === maxExact) {
      badges.push({
        ...BADGE_DEFINITIONS.FULLTREFFER,
        detail: `${participant.exactHits} treff`
      });
    }

    // Ranheim-tro
    if (participant.ranheimPredictedPos === bestRanheimPos && bestRanheimPos <= 4) {
      badges.push({
        ...BADGE_DEFINITIONS.PATRIOT,
        detail: `${participant.ranheimPredictedPos}. plass`
      });
    }

    // Høy risiko
    if (worstSingleDiff >= 5 && participant.maxSingleDiff === worstSingleDiff) {
      badges.push({
        ...BADGE_DEFINITIONS.RISIKO,
        detail: `${participant.maxSingleDiff} pl. avvik`
      });
    }

    // Mest presis
    if (participant.totalDiff === minTotalDiff && evaluatedList.length > 2) {
      badges.push({
        ...BADGE_DEFINITIONS.PRESIS,
        detail: `${participant.totalDiff} pl. totalt`
      });
    }

    return {
      ...participant,
      badges
    };
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BADGE_DEFINITIONS,
    assignBadges
  };
} else if (typeof window !== 'undefined') {
  window.BADGE_DEFINITIONS = BADGE_DEFINITIONS;
  window.assignBadges = assignBadges;
}
