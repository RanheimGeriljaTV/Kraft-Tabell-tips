/**
 * OBOS-ligaen Sesong-Statistikk & Analyse Motor
 * Beregner konsensus (Folkets tabell), H2H-dueller, klubbanalyser og rundens utvikling
 */

const StatsEngine = {
  /**
   * Beregn "Folkets Tabell" (Gjennomsnittlig tips for hele gjengen)
   * @param {Array} predictions - Alle innsendte tips
   * @param {Array} fasit - Gjeldende fasittabell
   */
  calculateConsensus(predictions, fasit) {
    if (!predictions || predictions.length === 0) return [];

    const teamTotals = {};

    // Initialiser alle 16 lag
    window.TEAMS.forEach(team => {
      teamTotals[team.id] = {
        teamId: team.id,
        teamName: team.name,
        positions: [],
        sumPositions: 0
      };
    });

    // Summer plasseringer fra alle tips
    predictions.forEach(p => {
      p.table.forEach((teamId, index) => {
        const pos = index + 1;
        if (teamTotals[teamId]) {
          teamTotals[teamId].positions.push(pos);
          teamTotals[teamId].sumPositions += pos;
        }
      });
    });

    // Beregn snitt og avvik
    const consensusList = Object.values(teamTotals).map(item => {
      const count = item.positions.length || 1;
      const avgPos = parseFloat((item.sumPositions / count).toFixed(2));
      const actualPos = fasit.indexOf(item.teamId) + 1;
      const highestTipped = item.positions.length ? Math.min(...item.positions) : '-';
      const lowestTipped = item.positions.length ? Math.max(...item.positions) : '-';

      return {
        teamId: item.teamId,
        avgPos,
        actualPos,
        highestTipped,
        lowestTipped,
        // Positiv differanse betyr at laget gjør det BEDRE enn folket trodde
        difference: avgPos - actualPos 
      };
    });

    // Sorter etter gjennomsnittlig plassering (lavest tall = 1. plass)
    consensusList.sort((a, b) => a.avgPos - b.avgPos);

    return consensusList.map((item, index) => ({
      ...item,
      consensusRank: index + 1
    }));
  },

  /**
   * Klubb-spesifikk analyse (f.eks. for Ranheim)
   */
  getTeamBeliefReport(teamId, predictions) {
    if (!predictions || predictions.length === 0) return null;

    const rankings = predictions.map(p => {
      const pos = p.table.indexOf(teamId) + 1;
      return {
        author: p.author,
        predictedPos: pos
      };
    });

    // Sorter med de mest optimistiske først
    rankings.sort((a, b) => a.predictedPos - b.predictedPos);

    const highest = rankings[0];
    const lowest = rankings[rankings.length - 1];
    const avg = (rankings.reduce((acc, r) => acc + r.predictedPos, 0) / rankings.length).toFixed(1);

    return {
      teamId,
      highest,
      lowest,
      avgPos: avg,
      all: rankings
    };
  },

  /**
   * Head-to-Head (H2H) duell mellom to venner
   */
  compareH2H(participantAId, participantBId, predictions, fasit, activeSystem = 'innertier') {
    const pA = predictions.find(p => p.id === participantAId);
    const pB = predictions.find(p => p.id === participantBId);

    if (!pA || !pB) return null;

    const evalA = window.evaluatePrediction(pA.table, fasit, activeSystem);
    const evalB = window.evaluatePrediction(pB.table, fasit, activeSystem);

    let identicalPositions = 0;
    const comparisons = [];

    for (let i = 0; i < 16; i++) {
      const pos = i + 1;
      const teamA = pA.table[i];
      const teamB = pB.table[i];
      const actualTeam = fasit[i];

      if (teamA === teamB) identicalPositions++;

      comparisons.push({
        position: pos,
        teamA,
        teamB,
        actualTeam,
        isIdentical: teamA === teamB
      });
    }

    let leader = 'Uavgjort';
    if (activeSystem === 'klassisk') {
      if (evalA.score < evalB.score) leader = pA.author;
      else if (evalB.score < evalA.score) leader = pB.author;
      else if (evalA.exactHits > evalB.exactHits) leader = pA.author;
      else if (evalB.exactHits > evalA.exactHits) leader = pB.author;
    } else {
      if (evalA.score > evalB.score) leader = pA.author;
      else if (evalB.score > evalA.score) leader = pB.author;
      else if (evalA.exactHits > evalB.exactHits) leader = pA.author;
      else if (evalB.exactHits > evalA.exactHits) leader = pB.author;
    }

    return {
      userA: {
        id: pA.id,
        author: pA.author,
        score: evalA.score,
        exactHits: evalA.exactHits,
        totalDiff: evalA.totalDiff,
        ranheimPos: evalA.ranheimPredictedPos
      },
      userB: {
        id: pB.id,
        author: pB.author,
        score: evalB.score,
        exactHits: evalB.exactHits,
        totalDiff: evalB.totalDiff,
        ranheimPos: evalB.ranheimPredictedPos
      },
      leader,
      identicalPositions,
      comparisons
    };
  },

  /**
   * Evaluer historikk gjennom alle mockup-runder for alle deltakere
   */
  evaluateSeasonRounds(predictions, activeSystem = 'innertier') {
    const rounds = window.SEASON_ROUNDS || [];
    const timeline = [];

    rounds.forEach(round => {
      const ranked = window.rankLeaderboard(predictions, round.standings, activeSystem);
      timeline.push({
        roundId: round.id,
        roundNumber: round.roundNumber,
        title: round.title,
        dateLabel: round.dateLabel,
        description: round.description,
        standings: round.standings,
        leaderboard: ranked
      });
    });

    return timeline;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StatsEngine;
} else if (typeof window !== 'undefined') {
  window.StatsEngine = StatsEngine;
}
