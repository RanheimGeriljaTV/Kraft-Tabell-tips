# ⚽ OBOS Tabell-tipper & Gamification Hub 2026
### Skreddersydd for Ranheim Kraft Vennegjeng & Kollegatabell

En moderne, interaktiv klient-side webapplikasjon bygget for vennegjengen og kollegaer. Null stress med brukerkontoer, passord eller e-post. Skriv inn kallenavnet ditt, dra de 16 OBOS-lagene på plass, og følg sesongdramaet live med offisielle klubbmerker, FIFA/FUT-aktige spillerkort, XP-nivåer og NFF playoff-tipping!

---

## 🌟 Nøkkelfunksjoner

### 1. ⚡ Live 2026-tabell (Etter 28 av 30 runder)
- **Reell tabell for 2026:**
  - **1.** Haugesund (62p)
  - **2.** Strømsgodset (60p)
  - **3.** Kongsvinger (59p)
  - **4.** Stabæk (55p)
  - **5.** Odd (45p)
  - **6.** Bryne (40p)
  - **7. 💙 Ranheim (38p) — KUN 2 POENG BAK KVALIK!**
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
- **Ingen kunstig simulering:** Tabellen følger den ekte sesongvirkeligheten. Ingen vinner kåres før sesong og playoff er ferdig!

---

### 2. 🎮 Gamification: Spillernivåer, XP & FUT-Spillerkort
- **5 Spillernivåer & XP-stige:**
  - 🥉 **Nivå 1: Benkesliter** (0 – 119 XP)
  - 🥈 **Nivå 2: Roteringsspiller** (120 – 249 XP)
  - 🥇 **Nivå 3: Fast i Startelleveren** (250 – 399 XP)
  - ⭐ **Nivå 4: Publikumsyndling** (400 – 599 XP)
  - 👑 **Nivå 5: Klubblegende** (600+ XP)
- **FUT / Sorare-stil Spillerkort for alle venner:**
  - Hver deltaker har sitt eget holografiske samlekort med **OVR (Overall Rating, 45–99)**.
  - **4 Power Stats:**
    - **ACC (Treffsikkerhet):** Eksakte fulltreffere og presisjon.
    - **PAT (Ranheim-Patriot):** Hvor høyt deltakeren har tippet Ranheim.
    - **STA (Stabilitet):** Evnen til å unngå store skivebommer.
    - **TAK (Taktisk Sans):** Treff i opprykks-, kvalik- og nedrykkssoner.
  - Viser "🔥 I FORM" for deltakere på seiersrekke.
  - Knapp for å laste ned PNG eller kopiere spillerkortet rett til utklippstavlen!

---

### 3. 🏆 Trofé-rom & Prestasjoner (Achievements)
- 6 låsbare utmerkelser med sanntids fremdriftsindikator:
  1. 🎯 **Krysseren:** Minst 3 eksakte fulltreffere (+100 XP).
  2. 💙 **Ranheim-Hjertet:** Tipp Ranheim i topp 6 (+80 XP).
  3. 🛡️ **Forsvarsklippe:** Maks 2 plasser avvik på begge direkte nedrykkslag (+70 XP).
  4. 🚀 **Pallen i Sikte:** Ligg på topp 3 på foreløpig tabell (+90 XP).
  5. 💎 **Sonemester:** Tipp minst 4 lag i riktig OBOS-sone (+120 XP).
  6. ⚡ **Is i Årene:** Tipp et overraskelseslag opp på direkte opprykk (+60 XP).

---

### 4. ⚔️ Offisiell NFF Playoff 2026 (Kvalifiserings-tipping)
- Følger det offisielle NFF-reglementet for 2026:
  - **Eliteserien Kvalik:**
    - Kamp 1 (22. nov): Nr. 5 i OBOS vs. Nr. 6 i OBOS
    - Kamp 2 (26. nov): Nr. 4 i OBOS vs. Vinner Kamp 1
    - Kamp 3 (30. nov): Nr. 3 i OBOS vs. Vinner Kamp 2
    - Kamp 4 & 5 (7. & 11. des): Nr. 14 i Eliteserien vs. Vinner Kamp 3
  - **OBOS Nedrykkskvalik:**
    - Kamp 3 & 4 (23. & 29. nov): Nr. 14 i OBOS vs. Vinner PostNord-kvalik
- **Interaktiv Playoff-tipping:** Vennegjengen kan klikke inn sine playoff-vinnere og få **+15 bonuspoeng & +50 XP** per riktig tips!

---

### 5. 🏆 4 Valgbare Poengsystemer & Foreløpig Podium
- **Foreløpig 1., 2. og 3. plass** på et 3D-podium med OVR-rating, nivå-merke og XP.
- **Bytt poengsystem med ett klikk:**
  1. **Klassisk Avvik:** $\sum |\text{tippet} - \text{fasit}|$. Lavest sum vinner!
  2. **Poeng + Fulltreffer:** 256p base, minus avvik, $+5$ bonus per eksakt treff. Høyest vinner!
  3. **Sone-bonus:** Ekstra bonus for direkte opprykk ($+10$), kvalik ($+5$) og nedrykk ($+10$).
  4. **Forza Ranheim 2x:** Avvik og bonuser på **Ranheim** teller dobbelt (2x)!

---

### 6. 🔒 Sikker Adgang, Sesonglås & Duplikatbeskyttelse
- **Gruppekode:** Standard `ranheim2026` (eller tilpasset i `config.js`).
- **1-klikk magisk lenke for gjengen:**
  `https://ranheimkraft.no/tipping/?kode=ranheim2026`
  *(eller lokalt: `http://localhost:8000/?kode=ranheim2026`)*
  Huskes automatisk på telefonen via `localStorage`!
- **🔒 Hardlock ved Sesongstart:** 
  Total skrivelås som aktiveres på datoen for seriestart (eller manuelt av admin). Ingen deltakere kan endre tips etter fristen – kun administrator kan oppdatere offisielle fasit-tabeller.
- **🛡️ Streng Duplikatbeskyttelse (1 tips per deltaker):**
  - Kallenavn er unike (case-insensitive) for å unngå forveksling eller kapring av navn.
  - Hver e-postadresse er knyttet til nøyaktig ett offisielt tabelltips.
  - Ved gjeninnlogging gjenkjennes eksisterende deltakere automatisk ("Velkommen tilbake!").
- **Admin-PIN for fasit og sletting:** `1901`.

---

### 7. 📊 Eksklusiv Admin Excel-rapport (`xlsx-js-style`)
- **Kun tilgjengelig for Admin (PIN `1901`):**
  Ligger under Admin-panelet i Fane 5 for å gi arrangementsansvarlig full kontroll over premieutdeling og tallknusing.
- **5 profesjonelt formaterte ark i samme `.xlsx`-arbeidsbok:**
  1. 📋 **Resultattavle & Poeng:** Komplett ranking over alle 4 poengsystemer, avvik, antall blinktreff, største fulltreffer og verste skivebom. Formatert med gull, sølv og bronse-pallfarger.
  2. 🧩 **Alle Tabelltips (Matrise):** Hver deltaker i egen kolonne over alle 16 OBOS-plasseringer med grønn utheving på blink-treff.
  3. 💙 **Ranheim i Fjæra:** Patriotisme-indeks, hvor mange som spår Ranheim til opprykk, kvalik eller nedrykk, og hvem som har størst tro på klubben.
  4. 📈 **Klubb-statistikk & Snitt:** Gjennomsnittlig tippet tabellplassering, konsensus og spredning for samtlige 16 klubber.
  5. ⚔️ **Head-to-Head Matrise:** Innbyrdes duelloversikt som viser hvem som slår hvem blant alle deltakerne.

---

### 8. 🎲 Tips-matrise & Terning-knapp (Shuffle)
- **🎲 Terning-knapp i Fane 1:** Hurtigknapp som stokker om tabellen for rask inspirasjon når man skal sette opp tipset sitt.
- **🧩 Sammenlign & Tips-matrise i Fane 3:** Gjør det enkelt for alle deltakere å se samtlige tips side om side direkte i appen uten å laste ned eksterne filer.

---

## ☁️ Sky-synkronisering & Brukerlogging (Supabase)

Supabase gir deg en felles database i skyen med et visuelt dashbord (som et Excel-ark i nettleseren) der du ser alle som har logget inn og levert tips:

1. **Opprett prosjekt:** Gå til [supabase.com](https://supabase.com), logg inn gratis med GitHub eller e-post, og trykk **"New project"**.
2. **Kjør databaseskriptet:**
   - I menyen til venstre, trykk på **SQL Editor** (ikonet med `>_`).
   - Trykk på **New query** (eller `+`).
   - Åpne filen [`supabase-schema.sql`](supabase-schema.sql), kopier alt innholdet, lim inn og trykk den grønne **Run**-knappen.
   - Skriptet oppretter tabellene `tips`, `fasit`, `users` og `user_logs`.
3. **Koble appen til Supabase:**
   - I Supabase, gå til **Project Settings** (tannhjulet nederst til venstre) -> **API**.
   - Kopier **Project URL** og **anon public key**.
   - Lim dem inn i [`js/config.js`](js/config.js):
     ```js
     SUPABASE_URL: 'https://xxxx.supabase.co',
     SUPABASE_ANON_KEY: 'eyJhbGciOi...'
     ```
4. **Se alle deltakere og logger visuelt:**
   - I Supabase-menyen til venstre, trykk på **Table Editor** (tabell-ikonet).
   - Klikk på **`users`** for å se alle registrerte deltakere med kallenavn, e-post og sist aktiv.
   - Klikk på **`user_logs`** for å se aktivitetsloggen over hvem som logget inn eller lagret tips.
   - Klikk på **`tips`** for å se alle innsendte tabelltips.

## 🚀 Kjøring lokalt
Åpne `index.html` direkte i nettleseren eller kjør:
```powershell
python -m http.server 8000
```
Gå til: `http://localhost:8000/?kode=ranheim1901`.
