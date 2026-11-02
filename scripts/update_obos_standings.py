#!/usr/bin/env python3
"""
Ranheim Kraft - Automatisk live-oppdatering av OBOS-ligaen 2026 tabell.
Henter offisielle live-data fra FotMob API (Liga 203), oppdaterer Supabase fasit,
og synkroniserer data.js samt index.html.
"""

import os
import sys
import json
import re
import argparse
from datetime import datetime, timezone
import urllib.request
import urllib.error

# Tving UTF-8 på stdout for Windows console / actions
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
SUPABASE_KEY = os.environ.get(
    'SUPABASE_ANON_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1c3BxZGJqeXJ5d212aGVycGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MTQ4ODksImV4cCI6MjEwODk5MDg4OX0.gMwKsZVysmButhdPeuyaXmi9oFPM4fqko2qq-DMNuUs'
)


def fetch_fotmob_standings():
    """Henter ferskeste tabell fra FotMob API for OBOS-ligaen (203)."""
    url = "https://www.fotmob.com/api/data/tltable?leagueId=203"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.fotmob.com/"
    }
    req = urllib.request.Request(url, headers=headers)
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


def update_supabase_fasit(ordered_team_ids):
    """Pusher tabell-fasiten til Supabase public.fasit tabellen."""
    payload = json.dumps({
        'id': 'current',
        'table_data': ordered_team_ids,
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

    with urllib.request.urlopen(req, timeout=10) as resp:
        if resp.status in (200, 201, 204):
            print("  ✓ Supabase fasit oppdatert med suksess!")
            return True
        else:
            print(f"  ⚠ Supabase returnerte uventet statuskode: {resp.status}")
            return False


def update_data_js(repo_dir, table_details, max_played):
    """Oppdaterer js/data.js med nye live detaljer og runde-kommentarer."""
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

    # Erstatt array
    updated = re.sub(
        r"const LIVE_TABLE_DETAILS_2026\s*=\s*\[[\s\S]*?\];",
        new_array_block,
        content
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
        print(f"  ✓ {data_path} oppdatert (Runde {max_played}).")
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
    parser = argparse.ArgumentParser(description="Oppdater OBOS-ligaen live tabell fra FotMob.")
    parser.add_argument('--repo-dir', default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    parser.add_argument('--skip-supabase', action='store_true', help='Hopp over Supabase-oppdatering')
    parser.add_argument('--dry-run', action='store_true', help='Vis kun hva som ville blitt oppdatert')
    args = parser.parse_args()

    print("==================================================")
    print("⚽ Ranheim Kraft: Henter OBOS-ligaen tabell fra FotMob...")
    print("==================================================")

    ordered_team_ids, table_details, max_played = fetch_fotmob_standings()

    print(f"Status: Hentet {len(ordered_team_ids)} lag. Høyeste spilte runder: {max_played}")
    for idx, row in enumerate(table_details, 1):
        print(f"  {idx:2d}. {row['id']:<14} {row['points']:2d}p ({row['played']} kamper, målforskjell: {row['goals']})")

    if args.dry_run:
        print("\n[Dry-run aktiv] Ingen endringer lagret.")
        return

    # 1. Supabase fasit
    if not args.skip_supabase:
        print("\nOppdaterer Supabase fasit...")
        update_supabase_fasit(ordered_team_ids)

    # 2. Lokale filer
    print("\nOppdaterer lokale filer...")
    update_data_js(args.repo_dir, table_details, max_played)
    update_index_html(args.repo_dir, max_played)

    print("\n✅ Tabelloppdatering fullført!")


if __name__ == '__main__':
    main()
