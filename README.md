# ⚽ OBOS Tabell-tipper & Stats Hub 2026
### Skreddersydd for Ranheim Kraft Vennegjeng & Kollegatabell

En råkul, moderne og interaktiv klient-side webapplikasjon designet for vennegjengen og kollegaer. Null styr med brukerkontoer, passord eller e-post. Skriv inn kallenavnet ditt, dra de 16 OBOS-lagene på plass, og følg sesongen med sanntidsstatistikk, dueller og historikk!

---

## 🌟 Hva er nytt & Høydepunkter

### 1. ⏰ Automatisk Sperre ved Seriestart (Lockdown)
- **Digital Nedtellingsklokke:** Ticker ned dager, timer, minutter og sekunder til seriestart (f.eks. `5. april 2026 kl. 15:00`).
- **Skrivebeskyttet etter frist:** Så snart seriestarten inntreffer (eller når sperren aktiveres), låses tippingen automatisk:
  - Drag-and-drop deaktiveres.
  - "Lagre tabelltips"-knappen erstattes av et skrivebeskyttet merke.
  - Man kan fortsatt bla gjennom alle venners innsendte tips og generere delbare bilder.
- **🧪 Mockup Test-veksler:** En egen testbryter i topplinjen lar deg veksle mellom *"Simuler før seriestart (åpen)"* og *"Simuler i sesong (låst)"* med ett klikk for mockup-testing!

---

### 2. 📊 Sesong-Stats & Analyse Hub (Ny Fane 3!)
- **📅 Spol gjennom Serierundene (Mockup):**
  - Velg mellom *Før seriestart*, *Runde 8 (Vårstart)*, *Runde 16 (Halvspilt)*, *Runde 24 (Høstdrama)* og *Runde 30 (Sluttabell)*.
  - Se hvordan stillingen, poengene og podiet forandrer seg runde for runde!
- **🥧 Folkets Tabell (Kollektivt Konsensus-tips):**
  - Gjengens gjennomsnittlige tabelltips beregnet automatisk.
  - Sammenlignet mot reell tabell for å avdekke hvilke lag som *overpresterer* (▲) eller *skuffer* (▼) i forhold til forhåndstipsene.
- **⚔️ H2H Kompis-Duell (Head-to-Head):**
  - Velg to venner for en direkte innbyrdes duell med poengsammenligning, antall treff, hvor de har tippet Ranheim TF, og hvem som leder.
- **💙 Ranheim TF Tro & Patriotisme:**
  - Viser hvem i gjengen som er den største optimisten (tippet Ranheim høyest), hvem som er skeptikeren, og hva gjengens gjennomsnittstro på Ranheim er.

---

### 3. 🏆 4 Valgbare Poengsystemer & 3D Podium
- **Visuelt Podium:** 🥇 Gull i midten (med pulserende kongekrone), 🥈 Sølv til venstre, 🥉 Bronse til høyre.
- **Bytt poengsystem med ett klikk:**
  1. **⛳ Klassisk Avvik:** $\sum |\text{tippet} - \text{fasit}|$. Lavest sum vinner!
  2. **🎯 Poeng + Innertier:** 256p base minus avvik, $+5$ bonuspoeng per eksakt treff. Høyest vinner!
  3. **🔥 Sone-jegeren:** Samme som over pluss $+10$ poeng for riktig lag på direkte opprykk/nedrykk, og $+5$ for kvalik.
  4. **💙 Ranheim-Jokeren:** Avvik og bonuser på **Ranheim TF** teller dobbelt (2x)!

---

### 4. 🔍 Tippe-røntgen & Morsomme Badges
- Klikk på hvilken som helst kompis på podiet eller i tabellen for å åpne side-om-side analyse:
  - 🎯 **Grønn:** Eksakt treff ($0$ bom)
  - 🟡 **Gul:** Nesten-treff ($\pm 1–2$ plasser)
  - 🔴 **Rød:** Skivebom ($\ge 3$ plasser feil)
- **Badges:**
  - 🔮 *Synsk* (Flest innertiere i gjengen)
  - 💙 *Ekte Ranheim-patriot* (Tippet Ranheim høyest)
  - 💀 *Største skivebom* (Gjengens mest brutale enkelt-bom)
  - ⚖️ *Mr. Stabilitet* (Minst totalavvik)

---

### 5. 🔒 Adgangskontroll for ranheimkraft.no
- **Gruppekode:** Standard kode `ranheim1901` (konfigurerbar i `js/config.js`).
- **1-klikk magisk lenke for gjengen:**
  Send denne lenken i chatten:
  `https://ranheimkraft.no/tipping/?kode=ranheim1901`
  *(eller lokalt: `http://localhost:8000/?kode=ranheim1901`)*
  Når kompisene trykker på lenken, **låses appen opp umiddelbart og huskes for alltid** på mobilen via `localStorage`!
- **Admin-PIN for fasit & tømming:** `1901`.

---

### 6. 📸 Delbart Bilde (`html2canvas`)
- Lager et lekkert kort av tabelltipset ditt med kallenavn, klubbfarger og soner – klart til å lagres som PNG eller kopieres rett til utklippstavlen for posting i Messenger/Spond/Slack.

---

## 🚀 Kom i gang

### Test lokalt på din PC:
Ingen installasjon eller Node.js er nødvendig!
- Dobbeltklikk direkte på `index.html` for å åpne i nettleseren.
- Eller kjør i terminalen:
  ```powershell
  python -m http.server 8000
  ```
  Åpne deretter `http://localhost:8000?kode=ranheim1901` i nettleseren.

---

## 🛠️ Filoversikt

```
├── index.html                  # Hovedapplikasjon (4 faner, låseskjerm, modaler)
├── css/
│   └── styles.css              # Cyber-sports dark UI, neon-glød, podium-lys
├── js/
│   ├── config.js               # Koder, tidsfrister, sesongnavn og Google Script URL
│   ├── data.js                 # 16 OBOS-lag, farger, soner, mockup-runder og demotips
│   ├── scoring.js              # 4 poengberegningsalgoritmer
│   ├── badges.js               # Automatiske utmerkelser
│   ├── stats.js                # Sesongstatistikk, konsensus, H2H dueller og klubbanalyse
│   ├── storage.js              # localStorage, JSON og sky-synkronisering
│   └── app.js                  # Hovedkontroller, nedtellingsur og hendelser
├── config.example.js           # Konfigurasjonsmal
├── google-sheets-script.gs     # Google Apps Script for live Google Sheets
├── .gitignore                  # Git ignorering
└── README.md                   # Denne bruksanvisningen
```

---

*Laget med 💙 for Ranheim TF og OBOS-ligaen 2026.*
