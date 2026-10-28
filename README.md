# ⚽ OBOS Tabell-tipper & Live Resultattavle 2026
### Skreddersydd for Ranheim Kraft Vennegjeng & Kollegatabell

En moderne, interaktiv klient-side webapplikasjon bygget for vennegjengen og kollegaer. Null stress med brukerkontoer, passord eller e-post. Skriv inn kallenavnet ditt, dra de 16 OBOS-lagene på plass, og følg sesongdramaet live med offisielle klubbmerker og sesongavslutningssimulator!

---

## 🌟 Nøkkelfunksjoner

### 1. ⚡ Live 2026-tabell & API-oppdatering
- **Reell tabell for 2026 (etter 28 runder):**
  - **1.** Haugesund (62p)
  - **2.** Strømsgodset (60p)
  - **3.** Kongsvinger (59p)
  - **4.** Stabæk (55p)
  - **5.** Odd (45p)
  - **6.** Bryne (40p)
  - **7. 💙 Ranheim TF (38p) — KUN 2 POENG BAK KVALIK!**
  - **8.** Hødd (38p)
  - **9.** Strømmen IF (36p)
  - **10.** Egersunds IK (35p)
  - **11.** Lyn (31p)
  - **12.** Sogndal (30p)
  - **13.** Sandnes Ulf (29p)
  - **14.** Moss FK (29p)
  - **15.** Åsane (25p)
  - **16.** Raufoss (20p)
- **Knapp: "🔄 Hent fersk tabell fra API":**
  - Oppdaterer stillingen direkte fra live feed med ett klikk.
  - Viser reelle tall for Kamper, Seire, Uavgjort, Tap, Mål og Poeng.

---

### 2. 🔥 Siste Kampene Simulator (Runde 28, 29 og 30)
I Fane 3 (**"Siste Kampene & Analyse"**) kan dere teste sesongavslutningen nå som kun 2 runder gjenstår:
- **Runde 28 (Live nå):** Den reelle stillingen i dag.
- **Runde 29 (Nest siste runde):** Ranheim vinner 3–1 på EXTRA Arena og klatrer opp på 6. plass (opprykkskvalik!).
- **Runde 30 (Siste serierunde / Finale):** Ranheim sikrer kvalifiseringen til Eliteserien!
- Se i sanntid hvordan vennegjengens poeng og podium endrer seg hvis sesongen avgjøres slik!

---

### 3. 🛡️ Ekte Offisielle Klubbmerker
- Hver av de 16 klubbene har sitt offisielle, høyoppløselige emblem hentet direkte fra FotMobs bildearkiv. Ingen AI-genererte symboler.

---

### 4. 🏆 4 Valgbare Poengsystemer & 3D Podium
- **Gull, Sølv og Bronse** på et 3D-podium med animert glød.
- **Bytt poengsystem med ett klikk:**
  1. **Klassisk Avvik:** $\sum |\text{tippet} - \text{fasit}|$. Lavest sum vinner!
  2. **Poeng + Fulltreffer:** 256p base, minus avvik, $+5$ bonus per eksakt treff. Høyest vinner!
  3. **Sone-bonus:** Ekstra bonus for direkte opprykk ($+10$), kvalik ($+5$) og nedrykk ($+10$).
  4. **Ranheim-Jokeren:** Avvik og bonuser på **Ranheim TF** teller dobbelt (2x)!

---

### 5. 📊 Tipsanalyse & Utmerkelser
- Klikk på en hvilken som helst kompis for å se en **Detaljert Tipsanalyse** rad for rad mot fasiten:
  - 🎯 **Eksakt treff** (grønn)
  - 🟡 **Nesten-treff** ($\pm 1–2$ plasser)
  - 🔴 **Avvik** ($\ge 3$ plasser feil)
- **Klubb- og sportsutmerkelser:**
  - *🎯 Flest Fulltreffere*
  - *💙 Ranheim-tro*
  - *⚡ Høyeste Risiko*
  - *⚖️ Mest Presis*

---

### 6. 🔒 Sikker Adgang for ranheimkraft.no
- **Gruppekode:** Standard `ranheim1901`.
- **1-klikk magisk lenke for gjengen:**
  `https://ranheimkraft.no/tipping/?kode=ranheim1901`
  *(eller lokalt: `http://localhost:8000/?kode=ranheim1901`)*
  Huskes automatisk på telefonen via `localStorage`!
- **Admin-PIN for fasit:** `1901`.

---

## 🚀 Kjøring lokalt
Åpne `index.html` direkte i nettleseren eller kjør:
```powershell
python -m http.server 8000
```
Gå til: `http://localhost:8000/?kode=ranheim1901`.
