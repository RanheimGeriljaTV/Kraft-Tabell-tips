/**
 * OBOS Tabell-tipper Profesjonell Excel-rapport (xlsx-js-style)
 * Skreddersydd for Ranheim Kraft Vennegjeng & Kollegatabell
 * KUN FOR ADMINISTRATOR
 */

const ExportManager = {
  /**
   * Genererer og laster ned en designet Excel-arbeidsbok (.xlsx) med 5 ark og formatering.
   */
  exportToExcel() {
    if (typeof StorageManager !== 'undefined' && !StorageManager.isAdmin()) {
      alert('🔒 Tilgang nektet: Kun administrator har tilgang til å laste ned denne offisielle Excel-rapporten.');
      return;
    }

    const tips = StorageManager.getTips() || [];
    const fasit = StorageManager.getFasit() || [];
    const teams = window.TEAMS || [];
    const getTeam = (id) => teams.find(t => t.id === id) || { name: id, shortName: id };

    if (!window.XLSX) {
      alert('Excel-biblioteket lastes inn... Prøv igjen om et sekund.');
      return;
    }

    if (tips.length === 0) {
      alert('Ingen tips er registrert i databasen ennå.');
      return;
    }

    const wb = window.XLSX.utils.book_new();

    // =========================================================================
    // STIL-DEFINISJONER (xlsx-js-style)
    // =========================================================================
    const thinBorder = {
      top: { style: 'thin', color: { rgb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } }
    };

    const titleStyle = {
      font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '003366' } }, // Ranheim Blue
      alignment: { vertical: 'center', horizontal: 'center' }
    };

    const subTitleStyle = {
      font: { name: 'Calibri', sz: 10, italic: true, color: { rgb: 'E2E8F0' } },
      fill: { fgColor: { rgb: '002244' } },
      alignment: { vertical: 'center', horizontal: 'center' }
    };

    const headerStyle = {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '0284C7' } }, // Ranheim Sky Blue
      alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
      border: thinBorder
    };

    const headerDarkStyle = {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '003366' } },
      alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
      border: thinBorder
    };

    const kpiBoxStyle = {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '0F172A' } },
      fill: { fgColor: { rgb: 'F1F5F9' } },
      alignment: { vertical: 'center', horizontal: 'center' },
      border: thinBorder
    };

    const cellDefault = {
      font: { name: 'Calibri', sz: 10, color: { rgb: '1E293B' } },
      alignment: { vertical: 'center', horizontal: 'left' },
      border: thinBorder
    };

    const cellCenter = {
      font: { name: 'Calibri', sz: 10, color: { rgb: '1E293B' } },
      alignment: { vertical: 'center', horizontal: 'center' },
      border: thinBorder
    };

    const cellGold = {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '78350F' } },
      fill: { fgColor: { rgb: 'FEF3C7' } },
      alignment: { vertical: 'center', horizontal: 'center' },
      border: thinBorder
    };

    const cellSilver = {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '334155' } },
      fill: { fgColor: { rgb: 'F1F5F9' } },
      alignment: { vertical: 'center', horizontal: 'center' },
      border: thinBorder
    };

    const cellBronze = {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '7C2D12' } },
      fill: { fgColor: { rgb: 'FFEDD5' } },
      alignment: { vertical: 'center', horizontal: 'center' },
      border: thinBorder
    };

    const cellBlink = {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '065F46' } },
      fill: { fgColor: { rgb: 'D1FAE5' } },
      alignment: { vertical: 'center', horizontal: 'left' },
      border: thinBorder
    };

    const cellNearBlink = {
      font: { name: 'Calibri', sz: 10, color: { rgb: '854D0E' } },
      fill: { fgColor: { rgb: 'FEF9C3' } },
      alignment: { vertical: 'center', horizontal: 'left' },
      border: thinBorder
    };

    const cellRanheim = {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '003366' } },
      alignment: { vertical: 'center', horizontal: 'left' },
      border: thinBorder
    };

    const cellPromotion = {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '065F46' } },
      fill: { fgColor: { rgb: 'ECFDF5' } },
      alignment: { vertical: 'center', horizontal: 'center' },
      border: thinBorder
    };

    const cellPlayoff = {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '0369A1' } },
      fill: { fgColor: { rgb: 'F0F9FF' } },
      alignment: { vertical: 'center', horizontal: 'center' },
      border: thinBorder
    };

    const cellRelegation = {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '991B1B' } },
      fill: { fgColor: { rgb: 'FEF2F2' } },
      alignment: { vertical: 'center', horizontal: 'center' },
      border: thinBorder
    };

    // Hjelpefunksjon for å bygge et styled sheet fra et 2D-array av celleobjekter
    function createStyledSheet(grid, colWidths = [], rowHeights = [], merges = []) {
      const ws = {};
      const numRows = grid.length;
      let maxCols = 0;

      for (let r = 0; r < numRows; r++) {
        const row = grid[r] || [];
        if (row.length > maxCols) maxCols = row.length;
        for (let c = 0; c < row.length; c++) {
          const cell = row[c];
          if (cell === null || cell === undefined) continue;
          const cellRef = window.XLSX.utils.encode_cell({ r, c });

          if (typeof cell === 'object' && cell.v !== undefined) {
            ws[cellRef] = cell;
          } else {
            ws[cellRef] = {
              v: cell,
              t: typeof cell === 'number' ? 'n' : 's',
              s: cellDefault
            };
          }
        }
      }

      const range = { s: { r: 0, c: 0 }, e: { r: Math.max(0, numRows - 1), c: Math.max(0, maxCols - 1) } };
      ws['!ref'] = window.XLSX.utils.encode_range(range);
      if (colWidths.length) ws['!cols'] = colWidths;
      if (rowHeights.length) ws['!rows'] = rowHeights;
      if (merges.length) ws['!merges'] = merges;
      return ws;
    }

    const nowStr = new Date().toLocaleString('no-NO');

    // =========================================================================
    // ARK 1: 👑 RESULTATTAVLE & POENG (LEDERTRØYE, BLINKER & STATISTIKK)
    // =========================================================================
    const rankedKlassisk = window.rankLeaderboard ? window.rankLeaderboard(tips, fasit, 'klassisk') : [];
    const rankedInnertier = window.rankLeaderboard ? window.rankLeaderboard(tips, fasit, 'innertier') : [];
    const rankedSone = window.rankLeaderboard ? window.rankLeaderboard(tips, fasit, 'sone') : [];
    const rankedRanheim = window.rankLeaderboard ? window.rankLeaderboard(tips, fasit, 'ranheim_joker') : [];

    const bestLeader = rankedKlassisk[0] || { author: '-', totalDiff: 0 };
    const mostBlinksUser = [...rankedKlassisk].sort((a, b) => b.exactHits - a.exactHits)[0] || { author: '-', exactHits: 0 };
    const avgDeviation = (rankedKlassisk.reduce((acc, r) => acc + r.totalDiff, 0) / (rankedKlassisk.length || 1)).toFixed(1);

    const sheet1Grid = [];

    // Rad 0: Hovedtittel
    sheet1Grid.push([
      { v: '🏆 OBOS-LIGAEN 2026 | RANHEIM KRAFT TABELLTIPS', t: 's', s: titleStyle },
      ...Array(12).fill({ v: '', t: 's', s: titleStyle })
    ]);

    // Rad 1: Undertittel
    sheet1Grid.push([
      { v: `Offisiell Resultattavle • Administrator-rapport • Generert ${nowStr} • ${tips.length} deltakere`, t: 's', s: subTitleStyle },
      ...Array(12).fill({ v: '', t: 's', s: subTitleStyle })
    ]);

    // Rad 2: Tom rad
    sheet1Grid.push([]);

    // Rad 3: Nøkkeltall / KPI-bokser
    sheet1Grid.push([
      { v: 'LEDARE (Lavest bom):', t: 's', s: kpiBoxStyle },
      { v: `${bestLeader.author} (${bestLeader.totalDiff}p avvik)`, t: 's', s: cellGold },
      { v: '', t: 's', s: cellDefault },
      { v: 'FLEST ISBJØRN-BLINK:', t: 's', s: kpiBoxStyle },
      { v: `${mostBlinksUser.author} (${mostBlinksUser.exactHits} blink)`, t: 's', s: cellBlink },
      { v: '', t: 's', s: cellDefault },
      { v: 'GJENNOMSNITTSAVVIK:', t: 's', s: kpiBoxStyle },
      { v: `${avgDeviation} plasser`, t: 's', s: cellCenter },
      ...Array(5).fill({ v: '', t: 's', s: cellDefault })
    ]);

    // Rad 4: Tom rad
    sheet1Grid.push([]);

    // Rad 5: Tabelloverskrifter
    const headers1 = [
      'Nr',
      'Deltaker (Kallenavn)',
      'E-postadresse',
      'Klassisk Avvik (Lavest = Best)',
      'Isbjørn-Blink (Fulltreffere)',
      'Isbjørn-Poeng (Start 256p)',
      'Fjæra-Sonen Poeng',
      'Forza Ranheim 2x Poeng',
      'Ranheim Tippet',
      'Snitt per lag',
      'Største Fulltreffer',
      'Største Skivebom',
      'Sist Oppdatert'
    ];
    sheet1Grid.push(headers1.map(h => ({ v: h, t: 's', s: headerStyle })));

    // Rader med data
    rankedKlassisk.forEach((r, idx) => {
      const innertierItem = rankedInnertier.find(x => x.author === r.author);
      const soneItem = rankedSone.find(x => x.author === r.author);
      const ranheimItem = rankedRanheim.find(x => x.author === r.author);
      const tipObj = tips.find(t => t.author === r.author) || {};
      const ranheimPos = (tipObj.table || []).indexOf('ranheim') + 1;
      const avgPerTeam = (r.totalDiff / 16).toFixed(1);

      // Finn største blink og største bom
      let bestHits = [];
      let worstDiff = -1;
      let worstTeamName = '-';

      (tipObj.table || []).forEach((tId, pIdx) => {
        const actualP = fasit.indexOf(tId) + 1;
        const diff = Math.abs((pIdx + 1) - actualP);
        if (diff === 0) bestHits.push(getTeam(tId).name);
        if (diff > worstDiff) {
          worstDiff = diff;
          worstTeamName = `${getTeam(tId).name} (bom ${diff} pl.)`;
        }
      });

      const bestHitsStr = bestHits.length ? bestHits.slice(0, 2).join(', ') : 'Ingen fulltreffer';

      let rankStyle = cellCenter;
      let nameStyle = cellDefault;
      if (idx === 0) { rankStyle = cellGold; nameStyle = cellGold; }
      else if (idx === 1) { rankStyle = cellSilver; nameStyle = cellSilver; }
      else if (idx === 2) { rankStyle = cellBronze; nameStyle = cellBronze; }

      sheet1Grid.push([
        { v: idx + 1, t: 'n', s: rankStyle },
        { v: r.author, t: 's', s: nameStyle },
        { v: tipObj.userEmail || '-', t: 's', s: cellDefault },
        { v: r.totalDiff, t: 'n', s: cellCenter },
        { v: r.exactHits, t: 'n', s: cellCenter },
        { v: innertierItem ? innertierItem.score : 0, t: 'n', s: cellCenter },
        { v: soneItem ? soneItem.score : 0, t: 'n', s: cellCenter },
        { v: ranheimItem ? ranheimItem.score : 0, t: 'n', s: cellCenter },
        { v: ranheimPos > 0 ? `${ranheimPos}. plass` : '-', t: 's', s: cellCenter },
        { v: `${avgPerTeam} pl.`, t: 's', s: cellCenter },
        { v: bestHitsStr, t: 's', s: cellDefault },
        { v: worstTeamName, t: 's', s: cellDefault },
        { v: tipObj.updatedAt ? new Date(tipObj.updatedAt).toLocaleString('no-NO') : '-', t: 's', s: cellCenter }
      ]);
    });

    const colWidths1 = [
      { wch: 6 },
      { wch: 22 },
      { wch: 26 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
      { wch: 16 },
      { wch: 14 },
      { wch: 22 },
      { wch: 24 },
      { wch: 20 }
    ];

    const merges1 = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }
    ];

    const ws1 = createStyledSheet(sheet1Grid, colWidths1, [{ hpt: 28 }, { hpt: 20 }, { hpt: 10 }, { hpt: 24 }], merges1);
    window.XLSX.utils.book_append_sheet(wb, ws1, 'Resultattavle & Poeng');

    // =========================================================================
    // ARK 2: 📋 ALLE TABELLTIPS (SAMMENLIGNINGSMATRISE SIDE-OM-SIDE)
    // =========================================================================
    const consensus = window.StatsEngine ? StatsEngine.calculateConsensus(tips, fasit) : [];
    const sheet2Grid = [];

    sheet2Grid.push([
      { v: '📋 OBOS-LIGAEN 2026 | SAMMENLIGNINGSMATRISE FOR ALLE DELTAKERE', t: 's', s: titleStyle },
      ...Array(tips.length + 3).fill({ v: '', t: 's', s: titleStyle })
    ]);
    sheet2Grid.push([
      { v: 'Blink = Eksakt fulltreffer (Grønn) • Blå = Ranheim • Gul = 1 plass unna', t: 's', s: subTitleStyle },
      ...Array(tips.length + 3).fill({ v: '', t: 's', s: subTitleStyle })
    ]);
    sheet2Grid.push([]);

    const headers2 = [
      { v: 'Plass', t: 's', s: headerDarkStyle },
      { v: 'Sone', t: 's', s: headerDarkStyle },
      { v: 'Reell Tabell (Nå)', t: 's', s: headerDarkStyle },
      { v: 'Folkets Snitt', t: 's', s: headerDarkStyle },
      ...tips.map(t => ({ v: t.author || 'Deltaker', t: 's', s: headerStyle }))
    ];
    sheet2Grid.push(headers2);

    for (let pos = 1; pos <= 16; pos++) {
      const fasitTeamId = fasit[pos - 1];
      const fasitTeam = getTeam(fasitTeamId);
      const isRanheimFasit = (fasitTeamId === 'ranheim');

      let zoneName = 'Trygg grunn';
      let zoneStyle = cellDefault;
      if (pos <= 2) { zoneName = 'Direkte opprykk'; zoneStyle = cellPromotion; }
      else if (pos <= 6) { zoneName = 'Opprykkskvalik'; zoneStyle = cellPlayoff; }
      else if (pos === 14) { zoneName = 'Kvalik nedrykk'; zoneStyle = cellNearBlink; }
      else if (pos >= 15) { zoneName = 'Direkte nedrykk'; zoneStyle = cellRelegation; }

      const cItem = consensus[pos - 1];
      const cText = cItem ? `${getTeam(cItem.teamId).name} (#${cItem.avgPos})` : '-';

      const row = [
        { v: pos, t: 'n', s: cellCenter },
        { v: zoneName, t: 's', s: zoneStyle },
        { v: fasitTeam.name, t: 's', s: isRanheimFasit ? cellRanheim : cellDefault },
        { v: cText, t: 's', s: cellDefault }
      ];

      tips.forEach(t => {
        const teamId = (t.table && t.table[pos - 1]) || '';
        const team = getTeam(teamId);
        const actualPos = fasit.indexOf(teamId) + 1;
        const diff = Math.abs(pos - actualPos);

        let cStyle = cellDefault;
        let suffix = '';

        if (diff === 0) {
          cStyle = cellBlink;
          suffix = ' 🎯';
        } else if (diff === 1) {
          cStyle = cellNearBlink;
        }

        if (teamId === 'ranheim') {
          cStyle = cellRanheim;
        }

        row.push({
          v: team.name + suffix,
          t: 's',
          s: cStyle
        });
      });

      sheet2Grid.push(row);
    }

    sheet2Grid.push([]);
    sheet2Grid.push([
      { v: '🎯 Isbjørn-Blinker', t: 's', s: headerDarkStyle },
      { v: '', t: 's', s: cellDefault },
      { v: 'Fulltreffere totalt', t: 's', s: cellDefault },
      { v: '', t: 's', s: cellDefault },
      ...tips.map(t => {
        let blinks = 0;
        (t.table || []).forEach((tId, idx) => {
          if (fasit.indexOf(tId) === idx) blinks++;
        });
        return { v: `${blinks} stk`, t: 's', s: cellBlink };
      })
    ]);

    sheet2Grid.push([
      { v: '⛳ Klassisk Avvik', t: 's', s: headerDarkStyle },
      { v: '', t: 's', s: cellDefault },
      { v: 'Lavest tall vinner', t: 's', s: cellDefault },
      { v: '', t: 's', s: cellDefault },
      ...tips.map(t => {
        let diff = 0;
        (t.table || []).forEach((tId, idx) => {
          diff += Math.abs((idx + 1) - (fasit.indexOf(tId) + 1));
        });
        return { v: `${diff}p`, t: 's', s: cellCenter };
      })
    ]);

    sheet2Grid.push([
      { v: '💙 Ranheim Tippet', t: 's', s: headerDarkStyle },
      { v: '', t: 's', s: cellDefault },
      { v: `Reell: ${fasit.indexOf('ranheim') + 1}. plass`, t: 's', s: cellRanheim },
      { v: '', t: 's', s: cellDefault },
      ...tips.map(t => {
        const rPos = (t.table || []).indexOf('ranheim') + 1;
        return { v: rPos > 0 ? `${rPos}. plass` : '-', t: 's', s: cellRanheim };
      })
    ]);

    const colWidths2 = [
      { wch: 6 },
      { wch: 16 },
      { wch: 22 },
      { wch: 24 },
      ...tips.map(() => ({ wch: 20 }))
    ];

    const merges2 = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: tips.length + 3 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: tips.length + 3 } }
    ];

    const ws2 = createStyledSheet(sheet2Grid, colWidths2, [{ hpt: 28 }, { hpt: 20 }], merges2);
    window.XLSX.utils.book_append_sheet(wb, ws2, 'Alle Tabelltips');

    // =========================================================================
    // ARK 3: 💙 RANHEIM I FJÆRA (SPESIALANALYSE FOR VÅRE BLÅ HELTER)
    // =========================================================================
    const ranheimPositions = [];
    tips.forEach(t => {
      const p = (t.table || []).indexOf('ranheim') + 1;
      if (p > 0) ranheimPositions.push({ author: t.author, email: t.userEmail, pos: p });
    });

    ranheimPositions.sort((a, b) => a.pos - b.pos);
    const ranheimAvg = ranheimPositions.length ? (ranheimPositions.reduce((acc, x) => acc + x.pos, 0) / ranheimPositions.length).toFixed(1) : '-';
    const top2Count = ranheimPositions.filter(x => x.pos <= 2).length;
    const playoffCount = ranheimPositions.filter(x => x.pos >= 3 && x.pos <= 6).length;
    const safeCount = ranheimPositions.filter(x => x.pos >= 7 && x.pos <= 13).length;
    const dangerCount = ranheimPositions.filter(x => x.pos >= 14).length;
    const actualRanheimPos = fasit.indexOf('ranheim') + 1;

    const sheet3Grid = [];

    sheet3Grid.push([
      { v: '💙 RANHEIM I FJÆRA | HVOR HAVNER DE BLÅ HELTENE IFØLGE GJENGEN?', t: 's', s: titleStyle },
      ...Array(5).fill({ v: '', t: 's', s: titleStyle })
    ]);
    sheet3Grid.push([
      { v: `Reell tabellplassering nå: #${actualRanheimPos} • Gjennomsnittlig tips i gjengen: #${ranheimAvg}`, t: 's', s: subTitleStyle },
      ...Array(5).fill({ v: '', t: 's', s: subTitleStyle })
    ]);
    sheet3Grid.push([]);

    sheet3Grid.push([
      { v: 'TRO PÅ DIREKTE OPPRYKK (Topp 2):', t: 's', s: kpiBoxStyle },
      { v: `${top2Count} deltakere (${((top2Count / (tips.length || 1)) * 100).toFixed(0)}%)`, t: 's', s: cellPromotion },
      { v: '', t: 's', s: cellDefault },
      { v: 'TRO PÅ KVALIK (3.–6. plass):', t: 's', s: kpiBoxStyle },
      { v: `${playoffCount} deltakere (${((playoffCount / (tips.length || 1)) * 100).toFixed(0)}%)`, t: 's', s: cellPlayoff },
      { v: '', t: 's', s: cellDefault }
    ]);
    sheet3Grid.push([
      { v: 'MIDTSJIKT (7.–13. plass):', t: 's', s: kpiBoxStyle },
      { v: `${safeCount} deltakere`, t: 's', s: cellDefault },
      { v: '', t: 's', s: cellDefault },
      { v: 'BUNNSTRID (14.–16. plass):', t: 's', s: kpiBoxStyle },
      { v: `${dangerCount} deltakere`, t: 's', s: dangerCount > 0 ? cellRelegation : cellDefault },
      { v: '', t: 's', s: cellDefault }
    ]);
    sheet3Grid.push([]);

    sheet3Grid.push([
      { v: 'Rangering', t: 's', s: headerDarkStyle },
      { v: 'Deltaker', t: 's', s: headerDarkStyle },
      { v: 'E-post', t: 's', s: headerDarkStyle },
      { v: 'Tippet plass for Ranheim', t: 's', s: headerDarkStyle },
      { v: 'Avvik mot reell plassering (#' + actualRanheimPos + ')', t: 's', s: headerDarkStyle },
      { v: 'Vurdering / Patriot-grad', t: 's', s: headerDarkStyle }
    ]);

    ranheimPositions.forEach((rp, idx) => {
      const diff = Math.abs(rp.pos - actualRanheimPos);
      let badge = 'Realist';
      let rowStyle = cellDefault;

      if (rp.pos === 1) { badge = '👑 Klubbens største optimist (GULL)'; rowStyle = cellGold; }
      else if (rp.pos === 2) { badge = '🚀 Direkte Eliteserien-troende'; rowStyle = cellPromotion; }
      else if (rp.pos <= 6) { badge = '⭐ Kvalik-optimist'; rowStyle = cellPlayoff; }
      else if (rp.pos >= 14) { badge = '⚠️ Fjæra-pessimist'; rowStyle = cellRelegation; }

      sheet3Grid.push([
        { v: idx + 1, t: 'n', s: cellCenter },
        { v: rp.author, t: 's', s: cellDefault },
        { v: rp.email || '-', t: 's', s: cellDefault },
        { v: `${rp.pos}. plass`, t: 's', s: rp.pos <= 2 ? cellPromotion : cellCenter },
        { v: diff === 0 ? '0 (Fulltreffer! 🎯)' : `${diff} plasser avvik`, t: 's', s: diff === 0 ? cellBlink : cellCenter },
        { v: badge, t: 's', s: rowStyle }
      ]);
    });

    const colWidths3 = [
      { wch: 10 },
      { wch: 22 },
      { wch: 26 },
      { wch: 24 },
      { wch: 26 },
      { wch: 32 }
    ];

    const merges3 = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }
    ];

    const ws3 = createStyledSheet(sheet3Grid, colWidths3, [{ hpt: 28 }, { hpt: 20 }], merges3);
    window.XLSX.utils.book_append_sheet(wb, ws3, 'Ranheim i Fjæra');

    // =========================================================================
    // ARK 4: 📊 KLUBB-STATISTIKK & FOLKETS KONSENSUS (ALLE 16 LAG)
    // =========================================================================
    const sheet4Grid = [];

    sheet4Grid.push([
      { v: '📊 OBOS-LIGAEN 2026 | KLUBB-STATISTIKK & FOLKETS KONSENSUS', t: 's', s: titleStyle },
      ...Array(9).fill({ v: '', t: 's', s: titleStyle })
    ]);
    sheet4Grid.push([
      { v: 'Beregnet på bakgrunn av samtlige innleverte tabelltips i vennegjengen', t: 's', s: subTitleStyle },
      ...Array(9).fill({ v: '', t: 's', s: subTitleStyle })
    ]);
    sheet4Grid.push([]);

    const headers4 = [
      'Klubb',
      'Reell Plass (Nå)',
      'Folkets Snittplass',
      'Folkets Bom (Avvik)',
      'Høyeste Tips',
      'Laveste Tips',
      'Stemmer 1. plass (Gull)',
      'Stemmer Topp 2 (Opprykk)',
      'Stemmer Topp 6 (Kvalik)',
      'Stemmer Bunn 2 (Nedrykk)'
    ];
    sheet4Grid.push(headers4.map(h => ({ v: h, t: 's', s: headerDarkStyle })));

    teams.forEach(team => {
      const positions = [];
      tips.forEach(t => {
        if (t.table) {
          const p = t.table.indexOf(team.id) + 1;
          if (p > 0) positions.push(p);
        }
      });

      const avg = positions.length ? parseFloat((positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(2)) : 0;
      const minPos = positions.length ? Math.min(...positions) : 0;
      const maxPos = positions.length ? Math.max(...positions) : 0;
      const champVotes = positions.filter(p => p === 1).length;
      const promoVotes = positions.filter(p => p <= 2).length;
      const playoffVotes = positions.filter(p => p <= 6).length;
      const relegVotes = positions.filter(p => p >= 15).length;
      const actualPos = fasit.indexOf(team.id) + 1;
      const deviation = actualPos > 0 ? parseFloat(Math.abs(avg - actualPos).toFixed(2)) : 0;
      const isRanheim = (team.id === 'ranheim');

      sheet4Grid.push([
        { v: team.name, t: 's', s: isRanheim ? cellRanheim : cellDefault },
        { v: actualPos, t: 'n', s: cellCenter },
        { v: avg, t: 'n', s: cellCenter },
        { v: deviation, t: 'n', s: cellCenter },
        { v: `${minPos}. plass`, t: 's', s: cellCenter },
        { v: `${maxPos}. plass`, t: 's', s: cellCenter },
        { v: champVotes, t: 'n', s: champVotes > 0 ? cellGold : cellCenter },
        { v: promoVotes, t: 'n', s: promoVotes > 0 ? cellPromotion : cellCenter },
        { v: playoffVotes, t: 'n', s: cellCenter },
        { v: relegVotes, t: 'n', s: relegVotes > 0 ? cellRelegation : cellCenter }
      ]);
    });

    const colWidths4 = [
      { wch: 22 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 }
    ];

    const merges4 = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }
    ];

    const ws4 = createStyledSheet(sheet4Grid, colWidths4, [{ hpt: 28 }, { hpt: 20 }], merges4);
    window.XLSX.utils.book_append_sheet(wb, ws4, 'Klubb-statistikk & Snitt');

    // =========================================================================
    // ARK 5: ⚔️ HEAD-TO-HEAD MATRISE (HVEM SLÅR HVEM?)
    // =========================================================================
    const sheet5Grid = [];

    sheet5Grid.push([
      { v: '⚔️ INNBYRDES DUELLER (HEAD-TO-HEAD) | HVEM SLÅR HVEM?', t: 's', s: titleStyle },
      ...Array(tips.length + 1).fill({ v: '', t: 's', s: titleStyle })
    ]);
    sheet5Grid.push([
      { v: 'Raden representerer spilleren. Grønn = Seier (Lavere avvik) • Rød = Tap • Grå = Uavgjort', t: 's', s: subTitleStyle },
      ...Array(tips.length + 1).fill({ v: '', t: 's', s: subTitleStyle })
    ]);
    sheet5Grid.push([]);

    const headers5 = [
      { v: 'Deltaker \\ Motstander', t: 's', s: headerDarkStyle },
      ...tips.map(t => ({ v: t.author, t: 's', s: headerStyle }))
    ];
    sheet5Grid.push(headers5);

    tips.forEach((tA) => {
      const row = [{ v: tA.author, t: 's', s: headerDarkStyle }];
      const diffA = rankedKlassisk.find(x => x.author === tA.author)?.totalDiff ?? 999;

      tips.forEach((tB) => {
        if (tA.author === tB.author) {
          row.push({ v: '—', t: 's', s: cellCenter });
        } else {
          const diffB = rankedKlassisk.find(x => x.author === tB.author)?.totalDiff ?? 999;
          if (diffA < diffB) {
            row.push({ v: `VUNNET (${diffA} mot ${diffB})`, t: 's', s: cellPromotion });
          } else if (diffA > diffB) {
            row.push({ v: `TAPT (${diffA} mot ${diffB})`, t: 's', s: cellRelegation });
          } else {
            row.push({ v: `UAVGJORT (${diffA}p)`, t: 's', s: cellCenter });
          }
        }
      });

      sheet5Grid.push(row);
    });

    const colWidths5 = [
      { wch: 24 },
      ...tips.map(() => ({ wch: 22 }))
    ];

    const merges5 = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: tips.length } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: tips.length } }
    ];

    const ws5 = createStyledSheet(sheet5Grid, colWidths5, [{ hpt: 28 }, { hpt: 20 }], merges5);
    window.XLSX.utils.book_append_sheet(wb, ws5, 'Head-to-Head Matrise');

    // =========================================================================
    // SKRIV TIL FIL OG LAST NED
    // =========================================================================
    const today = new Date().toISOString().slice(0, 10);
    const filename = `Ranheim-OBOS-Tabelltips-2026-Offisiell-Adminrapport-${today}.xlsx`;
    window.XLSX.writeFile(wb, filename);
  },

  /**
   * Generer en ryddig tekstoppsummering for utklippstavlen (Messenger/Slack/SMS)
   */
  copyTableSummary() {
    const tips = StorageManager.getTips() || [];
    const fasit = StorageManager.getFasit() || [];
    if (tips.length === 0) {
      alert('Ingen tips registrert ennå.');
      return;
    }

    const ranked = window.rankLeaderboard ? window.rankLeaderboard(tips, fasit, 'klassisk') : [];

    let text = `🏆 OBOS TABELLTIPS 2026 (Ranheim Kraft)\n`;
    text += `Stilling etter runde (Klassisk avvik - lavest er best):\n\n`;

    ranked.forEach((r, idx) => {
      const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `${idx + 1}.`));
      text += `${medal} ${r.author}: ${r.totalDiff}p avvik (${r.exactHits} Isbjørn-blinker)\n`;
    });

    text += `\n💙 Forza Ranheim! Registrer ditt tips på nettsiden.`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Stillingen er kopiert til utklippstavlen! Klar til å limes inn i Messenger eller chat.');
      }).catch(() => {
        alert('Kunne ikke kopiere automatisk.');
      });
    } else {
      alert('Utklippstavle støttes ikke i denne nettleseren.');
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportManager;
} else if (typeof window !== 'undefined') {
  window.ExportManager = ExportManager;
}
