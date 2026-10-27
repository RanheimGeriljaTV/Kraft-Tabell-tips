/**
 * OBOS-ligaen Morsomme Merkelapper (Badges)
 * Beregner automatiske hedersbetegnelser og roast-merker på deltakerne
 */

const BADGE_DEFINITIONS = {
  SYNSK: {
    id: 'synsk',
    label: '🔮 Synsk',
    description: 'Flest eksakte innertiere (🎯) i gjengen!',
    colorClass: 'bg-purple-900/60 text-purple-300 border-purple-500/50'
  },
  PATRIOT: {
    id: 'patriot',
    label: '💙 Ekte Ranheim-patriot',
    description: 'Har tippet Ranheim TF høyest på tabellen!',
    colorClass: 'bg-blue-900/60 text-blue-200 border-blue-400/50'
  },
  SKIVEBOM: {
    id: 'skivebom',
    label: '💀 Største skivebom',
    description: 'Har gjengens mest katastrofale enkelt-bom på ett lag!',
    colorClass: 'bg-rose-950/70 text-rose-300 border-rose-500/50'
  },
  STABIL: {
    id: 'stabil',
    label: '⚖️ Mr. Stabilitet',
    description: 'Gjengens minste totalavvik fra virkeligheten!',
    colorClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
  },
  OPTIMIST: {
    id: 'optimist',
    label: '🚀 Vill Optimist',
    description: 'Har tippet et bunnlag helt opp i toppen!',
    colorClass: 'bg-amber-950/60 text-amber-300 border-amber-500/50'
  }
};

/**
 * Analyser hele deltakerlisten og tildel badges
 * @param {Array<Object>} evaluatedList - Liste over evaluerte deltakere
 * @param {Array<string>} fasitTable - Nåværende fasittabell
 */
function assignBadges(evaluatedList, fasitTable) {
  if (!evaluatedList || evaluatedList.length === 0) return evaluatedList;

  // 1. Finn maks innertiere (må ha minst 1 for å bli synsk)
  const maxExact = Math.max(...evaluatedList.map(p => p.exactHits || 0));
  
  // 2. Finn høyeste plassering tippet for Ranheim (1 er høyest)
  const bestRanheimPos = Math.min(...evaluatedList.map(p => p.ranheimPredictedPos || 16));

  // 3. Finn største enkelt-avvik i gjengen
  const worstSingleDiff = Math.max(...evaluatedList.map(p => p.maxSingleDiff || 0));

  // 4. Finn minste totalavvik (mest stabil)
  const minTotalDiff = Math.min(...evaluatedList.map(p => p.totalDiff));

  return evaluatedList.map(participant => {
    const badges = [];

    // 🔮 Synsk: Hvis deltakeren har flest innertiere (og minst 1)
    if (maxExact > 0 && participant.exactHits === maxExact) {
      badges.push({
        ...BADGE_DEFINITIONS.SYNSK,
        detail: `${participant.exactHits} treff`
      });
    }

    // 💙 Ekte Ranheim-patriot: Tippet Ranheim høyest (og innen topp 3)
    if (participant.ranheimPredictedPos === bestRanheimPos && bestRanheimPos <= 4) {
      badges.push({
        ...BADGE_DEFINITIONS.PATRIOT,
        detail: `${participant.ranheimPredictedPos}. plass`
      });
    }

    // 💀 Største skivebom: Har det største enkelt-avviket (minst 5 plasser bom)
    if (worstSingleDiff >= 5 && participant.maxSingleDiff === worstSingleDiff) {
      badges.push({
        ...BADGE_DEFINITIONS.SKIVEBOM,
        detail: `${participant.maxSingleDiff} plasser feil!`
      });
    }

    // ⚖️ Mr. Stabilitet: Lavest totalavvik
    if (participant.totalDiff === minTotalDiff && evaluatedList.length > 2) {
      badges.push({
        ...BADGE_DEFINITIONS.STABIL,
        detail: `Kun ${participant.totalDiff} pl. avvik`
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
