"""
Last inn transaksjoner til Supabase.

Kjør fra terminalen:
    pip3 install requests
    python3 load_to_supabase.py

Forventer at tx_2level_final.json ligger i samme mappe.
"""

import json, requests, os

SUPABASE_URL = "https://izlvfaugnhkvhbdcfpal.supabase.co"
ANON_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bHZmYXVnbmhrdmhiZGNmcGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MDQ3OTcsImV4cCI6MjA5NjQ4MDc5N30.0KWMDoX4XTGK0BGxfZ5mA8aH0xcLa7YZgxEfmI9caE0"

HEADERS = {
    "apikey":        ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=minimal"
}

# Last JSON-fil
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path  = os.path.join(script_dir, "tx_2level_final.json")

with open(json_path, encoding="utf-8") as f:
    data = json.load(f)

# Bygg rader
rows = []
for t in data:
    rows.append({
        "dato":        t["d"].replace("/", "-"),
        "beskrivelse": t["desc"],
        "belop":       t["amt"],
        "konto_id":    t.get("acc", ""),
        "area":        t.get("area", ""),
        "subcat":      t.get("subcat", ""),
        "kilde":       "nordea_csv"
    })

print(f"Laster inn {len(rows)} transaksjoner...")

# Slett eksisterende data først (for re-kjøring)
r = requests.delete(
    f"{SUPABASE_URL}/rest/v1/transaksjoner?id=gte.0",
    headers=HEADERS
)
if r.status_code in (200, 204):
    print("  Eksisterende data slettet")
else:
    print(f"  Advarsel ved sletting: {r.status_code} {r.text[:100]}")

# Last inn i bolker
BATCH = 500
ok = 0
for i in range(0, len(rows), BATCH):
    batch = rows[i:i+BATCH]
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/transaksjoner",
        headers=HEADERS,
        json=batch
    )
    if r.status_code in (200, 201):
        ok += len(batch)
        print(f"  Batch {i//BATCH+1}: {len(batch)} rader OK  ({ok}/{len(rows)})")
    else:
        print(f"  FEIL batch {i//BATCH+1}: HTTP {r.status_code}")
        print(f"  {r.text[:300]}")
        break

print(f"\n✓ Ferdig: {ok} av {len(rows)} transaksjoner lastet inn")
