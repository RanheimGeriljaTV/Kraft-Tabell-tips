# Endringslogg (Changelog)

Alle vesentlige endringer i OBOS Tabell-tipper & Gamification Hub (Ranheim Kraft) dokumenteres i denne filen.
Formatet er basert på [Keep a Changelog](https://keepachangelog.com/no/1.0.0/).

---

## [3.0.0] - 2026-10-31

### Lagt til (feat)
- **Streng duplikatbeskyttelse for kallenavn og e-post:**
  - Kallenavn er unike på tvers av deltakere (case-insensitive sjekk slik at f.eks. «xcq», «XCQ» og «XcQ» blokkeres).
  - Én e-post = ett offisielt tips. Eksisterende deltakere gjenkjennes automatisk med «Velkommen tilbake!» og får hente opp sitt eksisterende tips.
  - Blokkerer registrering dersom en e-post forsøker å kapre et annet kallenavn, eller et opptatt kallenavn forsøkes registrert med ny e-post.
  - Unike indekser lagt til i `supabase-schema.sql` for håndheving helt ned på PostgreSQL-databasenivå.
- **🔒 Hardlock ved sesongstart (Sesonglås):**
  - Total skrivelås som aktiveres på dato for seriestart eller manuelt av administrator.
  - Låser tabellsortering, tilfeldig-knapp og lagring for alle vanlige deltakere.
  - Kun administrator (PIN `1901`) kan gjøre endringer eller oppdatere offisiell fasittabell etter at sesongen er i gang.
- **📊 Eksklusiv Admin Excel-rapport (`xlsx-js-style`):**
  - Genererer en profesjonelt formatert flersidig `.xlsx`-arbeidsbok med fargekoder (Ranheim-blå `#003366`, grønne blinktreff `#D1FAE5`, gull, sølv og bronse-pallfarger).
  - Skjult for vanlige deltakere og kun tilgjengelig i Admin-panelet i Fane 5 (krever PIN `1901`).
  - Inneholder 5 detaljerte ark:
    1. *Resultattavle & Poeng:* Komplett ranking med 4 poengsystemer, avvik, antall blinktreff, beste treff og største skivebom.
    2. *Alle Tabelltips (Matrise):* Hver deltaker i egen kolonne over alle 16 OBOS-plasseringer med grønn utheving på blink.
    3. *Ranheim i Fjæra:* Klubbens patriotisme-indeks, opprykk/playoff-andel og rangering av hvem som har størst tro på Ranheim.
    4. *Klubb-statistikk & Snitt:* Gjennomsnittlig tippet tabellplassering, konsensus og spredning for alle 16 klubber.
    5. *Head-to-Head Matrise:* Innbyrdes duelloversikt (hvem slår hvem).
- **🧩 Sammenlign & Tips-matrise i Fane 3:**
  - Viser en fullverdig tabellmatrise direkte i nettleseren med alle deltakernes tips side om side, med blink-ikoner og avvik.
- **🎲 Terning-knapp for tilfeldig tabell (Shuffle):**
  - Egen hurtigknapp i Fane 1 som stokker om tabellen for rask inspirasjon når man skal sette opp et tips.
- **☁️ Supabase PostgreSQL Cloud-synkronisering:**
  - Ekte sky-synkronisering med tabellene `tips`, `fasit`, `users` og `user_logs`.
  - Fallback til `localStorage` dersom nettverk eller skyløsning er utilgjengelig.

### Forbedret (enhancement)
- **Ranheim-identitet & terminologi:**
  - Konsekvent omdøpt fra «Ranheim TF» til kun **«Ranheim»** i hele systemet, databasen og rapportene.
  - Klubbterminologi tilpasset Ranheim-sjargong (*Fjæra*, *Isbjørn*, *Forza Ranheim*).
- **Bruker-switcher:**
  - Mulighet til å bytte aktiv bruker med umiddelbar validering mot duplikater.

### Rettet (fix)
- **Forsvunne lag ved innlasting av tips:**
  - Fikset valideringsfeil der manglende eller ufullstendige laglister fra eldre sesonger kunne tømme tips-grensesnittet.
  - Innført `isValidTable`-sjekk som krever nøyaktig de 16 offisielle 2026-lagene.

---

## [2.0.0] - 2026-10-28

### Lagt til (feat)
- **🎮 FUT-inspirerte spillerkort for alle deltakere:**
  - Holografiske samlekort med OVR (Overall Rating 45–99).
  - 4 Power Stats: ACC (Treffsikkerhet), PAT (Ranheim-Patriot), STA (Stabilitet) og TAK (Taktisk sans).
  - Eksport av spillerkort som bilde (PNG) eller kopi til utklippstavle.
- **⭐ 5 Spillernivåer & XP-stige:**
  - Benkesliter, Roteringsspiller, Fast i Startelleveren, Publikumsyndling og Klubblegende.
- **🏆 Trofé-rom med 6 prestasjoner:**
  - Krysseren, Ranheim-Hjertet, Forsvarsklippe, Pallen i Sikte, Sonemester og Is i Årene.
- **⚔️ Offisiell NFF 2026 Playoff-tipping:**
  - Interaktiv kvalifiseringsstige for Eliteserien- og OBOS-kvalik etter gjeldende NFF-reglement.
- **🏆 4 Valgbare poengsystemer:**
  - Klassisk Avvik, Poeng + Fulltreffer, Sone-bonus og Forza Ranheim 2x.
- **3D-Podium:**
  - Foreløpig 1., 2. og 3. plass med grafisk podiumsvisning.

---

## [1.0.0] - 2026-10-27

### Lagt til (feat)
- Første offisielle versjon av OBOS Tabell-tipper for Ranheim Kraft.
- Enkel drag-and-drop sortering av alle 16 OBOS-lag.
- Gruppe-adgangskode (`ranheim2026` / `ranheim1901`) og Admin-PIN (`1901`).
- Lokal lagring via nettleserens `localStorage`.
- JSON-eksport og sikkerhetskopiering.
