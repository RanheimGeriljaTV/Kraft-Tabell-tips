/**
 * OBOS-ligaen & Eliteserien Kvalifisering (Playoff) Motor
 * Basert på offisielle NFF-regler og trekning:
 * 
 * Kvalifisering til Eliteserien 2026:
 * - Kamp 1 (22. nov): Nr. 5 i OBOS (H) vs. Nr. 6 i OBOS (B)
 * - Kamp 2 (26. nov): Nr. 4 i OBOS (H) vs. Vinner Kamp 1 (B)
 * - Kamp 3 (30. nov): Nr. 3 i OBOS (H) vs. Vinner Kamp 2 (B)
 * - Kamp 4 (7. des):  Nr. 14 i Eliteserien (H) vs. Vinner Kamp 3 (B)
 * - Kamp 5 (11. des): Vinner Kamp 3 (H) vs. Nr. 14 i Eliteserien (B)
 * 
 * Kvalifisering til OBOS-ligaen 2026:
 * - Kamp 1 & 2 (1./2. nov & 8./9. nov): Nr. 2 avd. 1 PostNord vs. Nr. 2 avd. 2 PostNord
 * - Kamp 3 (23. nov): Nr. 14 i OBOS (H) vs. Vinner PostNord (B)
 * - Kamp 4 (29. nov): Vinner PostNord (H) vs. Nr. 14 i OBOS (B)
 */

const PlayoffEngine = {
  // Tilstand for simulerte playoff-vinnere
  state: {
    match1WinnerId: null, // Vinner Kamp 1 (5 vs 6)
    match2WinnerId: null, // Vinner Kamp 2 (4 vs Vinner 1)
    match3WinnerId: null, // Vinner Kamp 3 (3 vs Vinner 2)
    eliteserieQualifiedId: null, // Vinner av Kamp 4 & 5 (spiller i Eliteserien)
    eliteserieTeam14: 'Eliteserie-lag', // Nr. 14 i Eliteserien
    postNordWinner: 'PostNord-lag',
    obosRelegationWinnerId: null // Vinner av OBOS-kvalik
  },

  /**
   * Generer struktur for playoff-kamper basert på en gitt tabell
   * @param {Array<string>} standings - 16 lag-IDer i rekkefølge (0 = 1. plass, 2 = 3. plass, osv)
   */
  getPlayoffMatches(standings) {
    if (!standings || standings.length < 14) return null;
    const team3Id = standings[2]; // Nr. 3
    const team4Id = standings[3]; // Nr. 4
    const team5Id = standings[4]; // Nr. 5
    const team6Id = standings[5]; // Nr. 6
    const team14Id = standings[13]; // Nr. 14 (Nedrykkskvalik)

    // Kamp 1: Nr. 5 vs Nr. 6
    let k1Winner = this.state.match1WinnerId;
    if (k1Winner !== team5Id && k1Winner !== team6Id) {
      k1Winner = team5Id;
      this.state.match1WinnerId = k1Winner;
    }

    // Kamp 2: Nr. 4 vs Vinner K1
    let k2Winner = this.state.match2WinnerId;
    if (k2Winner !== team4Id && k2Winner !== k1Winner) {
      k2Winner = team4Id;
      this.state.match2WinnerId = k2Winner;
    }

    // Kamp 3: Nr. 3 vs Vinner K2
    let k3Winner = this.state.match3WinnerId;
    if (k3Winner !== team3Id && k3Winner !== k2Winner) {
      k3Winner = team3Id;
      this.state.match3WinnerId = k3Winner;
    }

    // Finale: Eliteserie-lag vs Vinner K3
    let finalPromoted = this.state.eliteserieQualifiedId;
    if (finalPromoted !== this.state.eliteserieTeam14 && finalPromoted !== k3Winner) {
      finalPromoted = k3Winner;
      this.state.eliteserieQualifiedId = finalPromoted;
    }

    // OBOS Kvalik: Nr. 14 i OBOS vs PostNord-lag
    let obosSurviver = this.state.obosRelegationWinnerId;
    if (obosSurviver !== team14Id && obosSurviver !== this.state.postNordWinner) {
      obosSurviver = team14Id;
      this.state.obosRelegationWinnerId = obosSurviver;
    }

    return {
      eliteseriePlayoff: [
        {
          matchNumber: 1,
          date: '22. nov',
          homeTeamId: team5Id,
          homeRank: 5,
          awayTeamId: team6Id,
          awayRank: 6,
          title: 'Kamp 1: Nr. 5 vs. Nr. 6',
          winnerId: k1Winner,
          stage: 'Kvartfinale'
        },
        {
          matchNumber: 2,
          date: '26. nov',
          homeTeamId: team4Id,
          homeRank: 4,
          awayTeamId: k1Winner,
          awayRank: 'Vinner K1',
          title: 'Kamp 2: Nr. 4 vs. Vinner Kamp 1',
          winnerId: k2Winner,
          stage: 'Semifinale'
        },
        {
          matchNumber: 3,
          date: '30. nov',
          homeTeamId: team3Id,
          homeRank: 3,
          awayTeamId: k2Winner,
          awayRank: 'Vinner K2',
          title: 'Kamp 3: Nr. 3 vs. Vinner Kamp 2',
          winnerId: k3Winner,
          stage: 'OBOS-finale'
        },
        {
          matchNumber: 4,
          date: '7. des & 11. des',
          homeTeamId: this.state.eliteserieTeam14,
          homeRank: 'Nr. 14 Eliteserien',
          awayTeamId: k3Winner,
          awayRank: 'OBOS Playoff-vinner',
          title: 'Kvalik-finale (Dobbeltkamp)',
          winnerId: finalPromoted,
          stage: 'Avgjørende om Eliteserien 2026'
        }
      ],
      obosPlayoff: {
        date: '23. nov & 29. nov',
        homeTeamId: team14Id,
        homeRank: 'Nr. 14 i OBOS',
        awayTeamId: this.state.postNordWinner,
        awayRank: 'Vinner PostNord-kvalik',
        title: 'Kvalifisering til OBOS-ligaen 2026',
        winnerId: obosSurviver
      }
    };
  },

  /**
   * Sett vinner for en playoff-kamp
   */
  setWinner(matchNum, winnerId) {
    if (matchNum === 1) {
      this.state.match1WinnerId = winnerId;
      // Nullstill videre hvis endret
      this.state.match2WinnerId = null;
      this.state.match3WinnerId = null;
      this.state.eliteserieQualifiedId = null;
    } else if (matchNum === 2) {
      this.state.match2WinnerId = winnerId;
      this.state.match3WinnerId = null;
      this.state.eliteserieQualifiedId = null;
    } else if (matchNum === 3) {
      this.state.match3WinnerId = winnerId;
      this.state.eliteserieQualifiedId = null;
    } else if (matchNum === 4) {
      this.state.eliteserieQualifiedId = winnerId;
    } else if (matchNum === 'obos') {
      this.state.obosRelegationWinnerId = winnerId;
    }
  },

  resetWinners() {
    this.state.match1WinnerId = null;
    this.state.match2WinnerId = null;
    this.state.match3WinnerId = null;
    this.state.eliteserieQualifiedId = null;
    this.state.obosRelegationWinnerId = null;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayoffEngine;
} else if (typeof window !== 'undefined') {
  window.PlayoffEngine = PlayoffEngine;
}
