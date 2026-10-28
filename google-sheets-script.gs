/**
 * Google Apps Script for Ranheim Kraft OBOS Tabell-tipper 2026
 * 
 * BRUKSANVISNING:
 * 1. Åpne Google Disk (drive.google.com) og opprett et nytt Google Regneark ("OBOS Tabelltips 2026").
 * 2. Gi arket to faner i bunnen:
 *    - Fane 1: "Tips"
 *    - Fane 2: "Fasit"
 * 3. I toppmenyen: Klikk "Utvidelser" (Extensions) -> "Apps Script".
 * 4. Slett all eksisterende kode i editoren, lim inn ALL denne koden, og lagre (Ctrl+S).
 * 5. Klikk "Distribuer" (Deploy) -> "Ny distribusjon" (New deployment).
 *    - Type: "Nettapp" (Web app)
 *    - Utfør som: "Meg" (Me)
 *    - Hvem har tilgang: "Alle" (Anyone)
 * 6. Klikk "Distribuer" og godkjenn tillatelser.
 * 7. Kopier Nettapp-URL-en (slutter på /exec) og lim den inn i `js/config.js` som `GOOGLE_SCRIPT_URL`.
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'get_all';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tipsSheet = ss.getSheetByName("Tips") || ss.insertSheet("Tips");
  var fasitSheet = ss.getSheetByName("Fasit") || ss.insertSheet("Fasit");
  
  // Hent alle tips
  var tipsData = tipsSheet.getDataRange().getValues();
  var tips = [];
  
  if (tipsData.length > 1) {
    for (var i = 1; i < tipsData.length; i++) {
      var row = tipsData[i];
      if (row[0]) {
        try {
          var tableArray = JSON.parse(row[2]);
          tips.push({
            id: row[0],
            author: row[1],
            table: tableArray,
            updatedAt: row[3]
          });
        } catch (err) {}
      }
    }
  }
  
  // Hent fasit
  var fasitData = fasitSheet.getDataRange().getValues();
  var fasit = [];
  if (fasitData.length > 0) {
    for (var j = 0; j < fasitData.length; j++) {
      if (fasitData[j][0]) {
        fasit.push(String(fasitData[j][0]).trim());
      }
    }
  }
  
  var response = {
    status: "success",
    action: action,
    round: 28,
    tips: tips,
    fasit: fasit.length === 16 ? fasit : null
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tipsSheet = ss.getSheetByName("Tips") || ss.insertSheet("Tips");
  var fasitSheet = ss.getSheetByName("Fasit") || ss.insertSheet("Fasit");
  
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Ugyldig JSON" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (data.action === "save_tip" && data.tip) {
    var tip = data.tip;
    var tipsData = tipsSheet.getDataRange().getValues();
    
    if (tipsData.length === 0 || tipsData[0][0] !== "ID") {
      tipsSheet.clear();
      tipsSheet.appendRow(["ID", "Forfatter", "Tabell (JSON)", "Oppdatert"]);
      tipsData = tipsSheet.getDataRange().getValues();
    }
    
    var rowIndex = -1;
    for (var i = 1; i < tipsData.length; i++) {
      if (String(tipsData[i][0]) === String(tip.id) || 
          String(tipsData[i][1]).toLowerCase() === String(tip.author).toLowerCase()) {
        rowIndex = i + 1;
        break;
      }
    }
    
    var jsonTable = JSON.stringify(tip.table);
    var now = new Date().toISOString();
    
    if (rowIndex > 0) {
      tipsSheet.getRange(rowIndex, 1, 1, 4).setValues([[tip.id, tip.author, jsonTable, now]]);
    } else {
      tipsSheet.appendRow([tip.id, tip.author, jsonTable, now]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Tips lagret" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (data.action === "save_fasit" && Array.isArray(data.fasit)) {
    fasitSheet.clear();
    for (var k = 0; k < data.fasit.length; k++) {
      fasitSheet.appendRow([data.fasit[k]]);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Fasit lagret" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Ukjent handling" }))
    .setMimeType(ContentService.MimeType.JSON);
}
