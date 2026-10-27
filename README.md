# ⚽ OBOS-ligaen Tabell-tipper & Live Resultattavle
### Skreddersydd for Ranheim Kraft Vennegjeng & Kollegatabell

En lynrask, interaktiv klient-side webapplikasjon bygget for vennegjengen og kollegaer. Null stress med brukerkontoer, passord eller e-post. Man taster kun inn kallenavnet sitt, drar de 16 OBOS-lagene på plass, og lagrer tipset!

---

## 🌟 Nøkkelfunksjoner

1. **Mobilvennlig Drag-and-Drop (`SortableJS`):**
   - Glatte animasjoner og haptisk følelse på både mobil og PC.
   - Alle 16 OBOS-lag med autentiske klubbfarger, arenaer og hedersmarkering for **Ranheim TF (💙 Hjemmelag)**.
   - Fargekodede soner:
     - 🟢 **Plass 1–2:** Direkte opprykk til Eliteserien
     - 🔵 **Plass 3–6:** Opprykkskvalifisering
     - ⚪ **Plass 7–13:** Sikker midtbane
     - 🟠 **Plass 14:** Nedrykkskvalik
     - 🔴 **Plass 15–16:** Direkte nedrykk til PostNord-ligaen

2. **Råkul Resultattavle med 4 Valgbare Poengsystemer (Bytt live!):**
   - **Visuelt Podium:** 🥇 Gull i midten (med kongekrone og animert glans), 🥈 Sølv til venstre, 🥉 Bronse til høyre.
   - **Bytt poengsystem med ett klikk:**
     1. **⛳ Klassisk Avvik:** $\sum |\text{tippet} - \text{fasit}|$. Lavest sum vinner!
     2. **🎯 Poeng + Innertier:** Start med 256p, trekk fra avvik, $+5$ bonuspoeng per eksakt treff. Høyest vinner!
     3. **🔥 Sone-jegeren:** Som over, pluss $+10$ poeng for riktig lag på direkte opprykk, $+5$ for kvalik, og $+10$ for direkte nedrykk.
     4. **💙 Ranheim-Jokeren:** Avvik og bonuser på **Ranheim TF** teller dobbelt (2x)!

3. **🔍 Tippe-røntgen & Morsomme Badges:**
   - Klikk på hvilken som helst kompis på podiet eller i tabellen for å åpne side-om-side analyse: **Kompisens tips vs. Gjeldende fasit**.
   - Fargekoder per rad: 🎯 Grønn (0 bom), 🟡 Gul (1–2 plasser feil), 🔴 Rød (skivebom).
   - Automatiske utmerkelser:
     - 🔮 *Synsk* (Flest innertiere i gjengen)
     - 💙 *Ekte Ranheim-patriot* (Tippet Ranheim høyest)
     - 💀 *Største skivebom* (Gjengens villeste bom på ett lag)
     - ⚖️ *Mr. Stabilitet* (Minst totalavvik)

4. **🔒 Adgangskontroll for ranheimkraft.no (Skjermet mot uvedkommende):**
   - **Gruppekode:** Standard kode `ranheim1901` (konfigurerbar i `js/config.js`).
   - **1-klikk magisk lenke for gjengen:** Send `ranheimkraft.no/tipping?kode=ranheim1901` i chatten. Når vennene klikker, låses appen opp automatisk og **huskes for alltid** på mobilen via `localStorage`!
   - **Admin-PIN for fasit:** `1901` for å endre offisiell fasittabell eller tilbakestille data.

5. **📸 Delbart Bilde (`html2canvas`):**
   - Lager et lekkert bilde av tabelltipset ditt med kallenavn, klubbfarger og soner – klart til å lagres som PNG eller kopieres rett til utklippstavlen for posting i Messenger/Spond/Slack.

6. **☁️ Dobbel Lagring:**
   - Standard: `localStorage` i nettleseren med JSON backup-eksport og import.
   - Valgfri felles sky-synkronisering med ferdig skrevet **Google Apps Script** (`google-sheets-script.gs`).

---

## 📁 Filoversikt

```
├── index.html                  # Hovedapplikasjon (Responsivt grensesnitt)
├── css/
│   └── styles.css              # Glassmorphism, Ranheim-glød og sonestiler
├── js/
│   ├── config.js               # Koder, tittel og Google Script URL
│   ├── data.js                 # 16 OBOS-lag, farger, soner og 6 demotips
│   ├── scoring.js              # 4 poengberegningsalgoritmer
│   ├── badges.js               # Automatiske utmerkelser
│   ├── storage.js              # localStorage, JSON og sky-synkronisering
│   └── app.js                  # Hovedkontroller og modalstyring
├── config.example.js           # Konfigurasjonsmal
├── google-sheets-script.gs     # Google Apps Script for Google Regneark
├── .gitignore                  # Git ignorering
└── README.md                   # Denne bruksanvisningen
```

---

## 🚀 Kom i gang

### 1. Test lokalt på din PC
Ingen installasjon eller Node.js er nødvendig!
- Dobbeltklikk direkte på `index.html` for å åpne i nettleseren.
- Eller kjør en enkel lokal server i terminalen:
  ```powershell
  python -m http.server 8000
  ```
  Åpne deretter `http://localhost:8000?kode=ranheim1901` i nettleseren.

---

### 2. Bruk på ranheimkraft.no

#### Alternativ A: Last opp som underside (Anbefalt)
1. Last opp filene til en undermappe på webhotellet for ranheimkraft.no (f.eks. `/tipping/` eller `/obos/`).
2. Adressen blir da:
   `https://ranheimkraft.no/tipping/`
3. Del den magiske lenken i vennegjengen på Messenger/Spond:
   `https://ranheimkraft.no/tipping/?kode=ranheim1901`

#### Alternativ B: Bygg inn med iframe på en eksisterende side
Hvis du bruker WordPress, Webflow eller et CMS på ranheimkraft.no:
```html
<iframe 
  src="https://ditt-domene-eller-github.io/tipping/?kode=ranheim1901" 
  width="100%" 
  height="900" 
  style="border:none; border-radius: 16px;"
  allow="clipboard-write"
></iframe>
```

---

### 3. Felles Google Sheets-synkronisering (Valgfritt)
Dersom du vil at kompisene skal se hverandres tips i sanntid når de lagrer fra hver sin mobil:

1. Åpne [Google Disk](https://drive.google.com) og opprett et nytt **Google Regneark** (kall det f.eks. *"Ranheim OBOS Tips 2025"*).
2. Opprett to faneark i bunnen:
   - `Tips`
   - `Fasit`
3. I toppmenyen: Klikk på **Utvidelser (Extensions) -> Apps Script**.
4. Åpne filen `google-sheets-script.gs` fra dette prosjektet, kopier alt innholdet, og lim det inn i Apps Script editoren (slett koden som stod der fra før). Trykk Lagre (Ctrl+S).
5. Klikk på **Distribuer (Deploy) -> Ny distribusjon (New deployment)**:
   - Type: Velg **Nettapp (Web app)**
   - Utfør som: **Meg (Me)**
   - Hvem har tilgang: **Alle (Anyone)** *(Viktig! Dette lar venner uten Google-innlogging sende inn tips)*
6. Klikk **Distribuer**, gi tillatelser, og kopier **Nettapp-URL** (slutter på `/exec`).
7. Åpne `js/config.js` og lim inn URL-en:
   ```javascript
   GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx.../exec'
   ```

---

## 🛠️ Tilpasning av koder & passord

I `js/config.js` kan du endre:
- `ACCESS_CODE`: Koden vennegjengen må ha for å åpne appen (standard: `ranheim1901`).
- `ADMIN_PIN`: Koden kun du har for å oppdatere den offisielle fasittabellen (standard: `1901`).
- `COMMUNITY_NAME`: Navnet på gjengen (standard: `Ranheim Kraft`).

---

*Laget med 💙 for Ranheim TF og OBOS-ligaen.*
