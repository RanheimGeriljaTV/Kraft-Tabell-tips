#!/usr/bin/env python3
"""
Ranheim Kraft - Automatisk live-oppdatering av OBOS-ligaen & Kvalifisering 2026.
Henter offisielle live-data fra FotMob API:
  - OBOS-ligaen tabell (ID 203)
  - Eliteserien tabell for nr. 14 kvalik-motstander (ID 59)
  - Eliteserien Kvalifisering playoff-kamper (ID 60)
  - OBOS-ligaen Kvalifisering playoff-kamper (ID 9754)
Oppdaterer Supabase fasit (id: 'current' og id: 'playoff'), data.js og index.html.
Kjøres automatisk kl. 23:00 i sesongen (mars-desember).
"""

import os
import sys
import json
import re
import argparse
from datetime import datetime, timezone
import urllib.request
import urllib.error

# Tving UTF-8 på stdout for Windows console og GitHub Actions
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Offisiell mapping fra FotMob ID til appens teamId
FOTMOB_TEAM_MAP = {
    8512: 'haugesund',
    8180: 'stromsgodset',
    8179: 'kongsvinger',
    9918: 'stabaek',
    7988: 'odd',
    8531: 'bryne',
    6563: 'ranheim',
    4722: 'egersund',
    7937: 'hodd',
    4249: 'strommen',
    10224: 'lyn',
    8616: 'sogndal',
    8133: 'sandnesulf',
    8405: 'moss',
    10021: 'aasane',
    9812: 'raufoss'
}

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://cuspqdbjyrywmvherpca.supabase.co')
SUPABASE_KEY = (
    os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or
    os.environ.get('SUPABASE_ANON_KEY') or
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1c3BxZGJqeXJ5d212aGVycGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MTQ4ODksImV4cCI6MjEwODk5MDg4OX0.gMwKsZVysmButhdPeuyaXmi9oFPM4fqko2qq-DMNuUs'
)

HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://www.fotmob.com/"
}


def is_active_season():
    """
    Sjekker om vi er i aktiv norsk fotballsesong (mars til og med desember).
    Januar (1) og februar (2) er off-season/vinterpause uten seriekamper.
    """
    now = datetime.now(timezone.utc)
    return 3 <= now.month <= 12


def fetch_fotmob_standings():
    """Henter ferskeste tabell fra FotMob API for OBOS-ligaen (203)."""
    url = "https://www.fotmob.com/api/data/tltable?leagueId=203"
    req = urllib.request.Request(url, headers=HTTP_HEADERS)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))

    if isinstance(data, list) and len(data) > 0:
        table_raw = data[0].get('data', {}).get('table', {}).get('all', [])
    elif isinstance(data, dict):
        sub = data.get('table', [])
        table_raw = sub[0].get('data', {}).get('table', {}).get('all', []) if sub else []
    else:
        table_raw = []

    if len(table_raw) != 16:
        raise ValueError(f"Uventet antall lag fra FotMob: {len(table_raw)} (forventet 16)")

    ordered_team_ids = []
    table_details = []
    max_played = 0

    for row in table_raw:
        f_id = row.get('id')
        app_id = FOTMOB_TEAM_MAP.get(f_id)
        if not app_id:
            raise ValueError(f"Ukjent FotMob lag-ID {f_id} ({row.get('name')})")

        played = row.get('played', 0)
        if played > max_played:
            max_played = played

        ordered_team_ids.append(app_id)
        table_details.append({
            'id': app_id,
            'rank': row.get('idx'),
            'played': played,
            'won': row.get('wins', 0),
            'draw': row.get('draws', 0),
            'lost': row.get('losses', 0),
            'goals': str(row.get('scoresStr', '')),
            'points': row.get('pts', 0)
        })

    return ordered_team_ids, table_details, max_played


def fetch_playoff_data():
    """
    Henter kvalifiseringsstatus fra FotMob:
      1. Eliteserien (ID 59): finner nr. 14 som må spille kvalik
      2. Eliteserien Qualification (ID 60): playoff-kamper og resultater
      3. OBOS-ligaen Qualification (ID 9754): nedrykkskvalik
    """
    playoff_data = {
        'eliteserieTeam14': None,
        'eliteserieMatches': [],
        'obosMatches': [],
        'hasMatches': False,
        'updated_at': datetime.now(timezone.utc).isoformat()
    }

    # 1. Hent Eliteserien nr. 14 (ID 59)
    try:
        req = urllib.request.Request("https://www.fotmob.com/api/data/tltable?leagueId=59", headers=HTTP_HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            d = json.loads(resp.read().decode('utf-8'))
            t = d[0]['data']['table']['all']
            if len(t) >= 14:
                r14 = t[13] # Indeks 13 er plass 14
                playoff_data['eliteserieTeam14'] = {
                    'id': r14.get('id'),
                    'name': r14.get('name'),
                    'rank': 14,
                    'played': r14.get('played', 0),
                    'points': r14.get('pts', 0),
                    'logoUrl': f"https://images.fotmob.com/image_resources/logo/teamlogo/{r14.get('id')}.png"
                }
    except Exception as e:
        print(f"  ⚠ Kunne ikke hente Eliteserien tabell: {e}")

    # 2. Hent Eliteserien Kvalifisering (ID 60)
    try:
        req = urllib.request.Request("https://www.fotmob.com/api/data/leagues?id=60", headers=HTTP_HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            d = json.loads(resp.read().decode('utf-8'))
            matches = d.get('overview', {}).get('leagueOverviewMatches', [])
            if not matches:
                matches = d.get('overview', {}).get('matches', {}).get('allMatches', [])

            for m in matches:
                h = m.get('home', {})
                a = m.get('away', {})
                st = m.get('status', {})
                playoff_data['eliteserieMatches'].append({
                    'id': m.get('id'),
                    'homeTeam': {'id': h.get('id'), 'name': h.get('name'), 'score': h.get('score')},
                    'awayTeam': {'id': a.get('id'), 'name': a.get('name'), 'score': a.get('score')},
                    'score': st.get('scoreStr'),
                    'finished': st.get('finished', False),
                    'started': st.get('started', False),
                    'reason': st.get('reason', {}).get('short', ''),
                    'utcTime': st.get('utcTime')
                })
            if playoff_data['eliteserieMatches']:
                playoff_data['hasMatches'] = True
    except Exception as e:
        print(f"  ⚠ Kunne ikke hente Eliteserien kvalikkamper (ID 60): {e}")

    # 3. Hent OBOS-ligaen Kvalifisering (ID 9754)
    try:
        req = urllib.request.Request("https://www.fotmob.com/api/data/leagues?id=9754", headers=HTTP_HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            d = json.loads(resp.read().decode('utf-8'))
            matches = d.get('overview', {}).get('leagueOverviewMatches', [])
            if not matches:
                matches = d.get('overview', {}).get('matches', {}).get('allMatches', [])

            for m in matches:
                h = m.get('home', {})
                a = m.get('away', {})
                st = m.get('status', {})
                playoff_data['obosMatches'].append({
                    'id': m.get('id'),
                    'homeTeam': {'id': h.get('id'), 'name': h.get('name'), 'score': h.get('score')},
                    'awayTeam': {'id': a.get('id'), 'name': a.get('name'), 'score': a.get('score')},
                    'score': st.get('scoreStr'),
                    'finished': st.get('finished', False),
                    'started': st.get('started', False),
                    'reason': st.get('reason', {}).get('short', ''),
                    'utcTime': st.get('utcTime')
                })
            if playoff_data['obosMatches']:
                playoff_data['hasMatches'] = True
    except Exception as e:
        print(f"  ⚠ Kunne ikke hente OBOS kvalikkamper (ID 9754): {e}")

    return playoff_data


def update_supabase_row(row_id, table_data):
    """Pusher data til Supabase public.fasit tabellen (f.eks. 'current' eller 'playoff')."""
    payload = json.dumps({
        'id': row_id,
        'table_data': table_data,
        'updated_at': datetime.now(timezone.utc).isoformat()
    }).encode('utf-8')

    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/fasit",
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': f"Bearer {SUPABASE_KEY}",
            'Prefer': 'resolution=merge-duplicates'
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in (200, 201, 204)
    except Exception as e:
        print(f"  ⚠ Supabase feil for id='{row_id}': {e}")
        return False


def update_data_js(repo_dir, table_details, max_played, playoff_data):
    """Oppdaterer js/data.js med nye live detaljer, playoff-data og runde-kommentarer."""
    data_path = os.path.join(repo_dir, 'js', 'data.js')
    if not os.path.exists(data_path):
        print(f"  ⚠ Fant ikke {data_path}")
        return False

    with open(data_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Formater ny LIVE_TABLE_DETAILS_2026 array
    lines = ["const LIVE_TABLE_DETAILS_2026 = ["]
    for row in table_details:
        lines.append(
            f"  {{ id: '{row['id']}', rank: {row['rank']}, played: {row['played']}, "
            f"won: {row['won']}, draw: {row['draw']}, lost: {row['lost']}, "
            f"goals: '{row['goals']}', points: {row['points']} }},"
        )
    lines.append("];")
    new_array_block = "\n".join(lines)

    # Erstatt LIVE_TABLE_DETAILS_2026
    updated = re.sub(
        r"const LIVE_TABLE_DETAILS_2026\s*=\s*\[[\s\S]*?\];",
        new_array_block,
        content
    )

    # Formater PLAYOFF_LIVE_DATA_2026 blokk
    playoff_json = json.dumps(playoff_data, indent=2, ensure_ascii=False)
    playoff_block = f"const PLAYOFF_LIVE_DATA_2026 = {playoff_json};\nif (typeof window !== 'undefined') window.PLAYOFF_LIVE_DATA_2026 = PLAYOFF_LIVE_DATA_2026;"

    if "const PLAYOFF_LIVE_DATA_2026" in updated:
        updated = re.sub(
            r"const PLAYOFF_LIVE_DATA_2026\s*=\s*[\s\S]*?window\.PLAYOFF_LIVE_DATA_2026\s*=\s*PLAYOFF_LIVE_DATA_2026;",
            playoff_block,
            updated
        )
    else:
        # Legg til like før window-eksporten på slutten av data.js
        updated = updated.replace(
            "// Standard fasittabell for appen",
            f"{playoff_block}\n\n// Standard fasittabell for appen"
        )

    # Oppdater runde-tekst i kommentarer
    updated = re.sub(
        r"live tabell \(Runde \d+\)",
        f"live tabell (Runde {max_played})",
        updated
    )
    updated = re.sub(
        r"// ÅRETS EKTE LIVE-TABELL 2026 \(Etter \d+ runder spilt\)",
        f"// ÅRETS EKTE LIVE-TABELL 2026 (Etter {max_played} runder spilt)",
        updated
    )

    if updated != content:
        with open(data_path, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f"  ✓ {data_path} oppdatert (Runde {max_played} + Playoff).")
        return True
    else:
        print("  - Ingen endringer i data.js.")
        return False


def update_index_html(repo_dir, max_played):
    """Oppdaterer index.html med spilte runder."""
    html_path = os.path.join(repo_dir, 'index.html')
    if not os.path.exists(html_path):
        return False

    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    updated = re.sub(
        r"<span>\d+ runder spilt</span>",
        f"<span>{max_played} runder spilt</span>",
        content
    )
    updated = re.sub(
        r"Offisiell 2026-tabell \(Runde \d+\)",
        f"Offisiell 2026-tabell (Runde {max_played})",
        updated
    )

    if updated != content:
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f"  ✓ {html_path} oppdatert (Runde {max_played}).")
        return True
    else:
        print("  - Ingen endringer i index.html.")
        return False


def main():
    parser = argparse.ArgumentParser(description="Oppdater OBOS-ligaen og kvalifisering live fra FotMob.")
    parser.add_argument('--repo-dir', default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    parser.add_argument('--skip-supabase', action='store_true', help='Hopp over Supabase-oppdatering')
    parser.add_argument('--dry-run', action='store_true', help='Vis kun hva som ville blitt oppdatert')
    parser.add_argument('--force', action='store_true', help='Kjør selv om det er vinterpause (januar/februar)')
    args = parser.parse_args()

    # 1. Sesongsjekk
    if not is_active_season() and not args.force:
        print("==================================================")
        print("❄️ Vinterpause / Off-season (januar/februar)")
        print("Ingen aktive seriekamper spilles nå.")
        print("Bruk --force for å overstyre.")
        print("==================================================")
        return

    print("==================================================")
    print("⚽ Ranheim Kraft: Henter live-tabell & kvalik fra FotMob...")
    print("==================================================")

    # 2. Hent tabell
    ordered_team_ids, table_details, max_played = fetch_fotmob_standings()

    print(f"Status: Hentet 16 lag. Høyeste spilte runder: {max_played}")
    for idx, row in enumerate(table_details, 1):
        print(f"  {idx:2d}. {row['id']:<14} {row['points']:2d}p ({row['played']} kamper, målforskjell: {row['goals']})")

    # 3. Hent kvalifisering / playoff
    print("\nSjekker kvalifiseringskamper (Playoff & Eliteserien nr. 14)...")
    playoff_data = fetch_playoff_data()
    e14 = playoff_data.get('eliteserieTeam14')
    if e14:
        print(f"  ✓ Nr. 14 i Eliteserien: {e14['name']} ({e14['points']}p)")
    else:
        print("  - Eliteserien nr. 14 ikke tilgjengelig ennå.")

    if playoff_data.get('eliteserieMatches'):
        print(f"  ✓ Fant {len(playoff_data['eliteserieMatches'])} kamper for Eliteserien-kvalik")
        for m in playoff_data['eliteserieMatches']:
            h_name = m['homeTeam']['name']
            a_name = m['awayTeam']['name']
            score = m['score'] or 'Ikke spilt'
            status = 'Ferdig' if m['finished'] else ('Pågår' if m['started'] else 'Kommende')
            print(f"    • {h_name} vs {a_name} [{score}] ({status})")
    else:
        print("  - Ingen oppsatte kamper i Eliteserien-kvalik ennå.")

    if playoff_data.get('obosMatches'):
        print(f"  ✓ Fant {len(playoff_data['obosMatches'])} kamper for OBOS-kvalik")
        for m in playoff_data['obosMatches']:
            h_name = m['homeTeam']['name']
            a_name = m['awayTeam']['name']
            score = m['score'] or 'Ikke spilt'
            print(f"    • {h_name} vs {a_name} [{score}]")
    else:
        print("  - Ingen oppsatte kamper i OBOS-kvalik ennå.")

    if args.dry_run:
        print("\n[Dry-run aktiv] Ingen endringer lagret.")
        return

    # 4. Supabase fasit & playoff
    if not args.skip_supabase:
        print("\nOppdaterer Supabase...")
        res_current = update_supabase_row('current', ordered_team_ids)
        if res_current:
            print("  ✓ Supabase fasit (id='current') oppdatert!")
        res_playoff = update_supabase_row('playoff', playoff_data)
        if res_playoff:
            print("  ✓ Supabase playoff (id='playoff') oppdatert!")

    # 5. Lokale filer
    print("\nOppdaterer lokale filer...")
    update_data_js(args.repo_dir, table_details, max_played, playoff_data)
    update_index_html(args.repo_dir, max_played)

    print("\n✅ Live tabell og kvalifisering er 100 % oppdatert!")


if __name__ == '__main__':
    main()
