#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${TMPDIR:-/tmp}/aix-page-gallery-skill-smoke"
NAME="aix-page-gallery-skill-smoke-delivery"
rm -rf "$OUT" "$(dirname "$OUT")/$NAME"
python3 "$ROOT/scripts/run_gallery.py" --site "$ROOT/tests/fixture-site" --registry "$ROOT/tests/fixture-config/pageRegistry.json" --output "$OUT" --name "$NAME"
python3 - <<PY
import json
from pathlib import Path
d=json.loads(Path('$OUT/audit-report.json').read_text())
assert d['ok'] and d['routeCount']==3 and d['statusCounts']=={'rendered':2,'non-visual':1}, d
print('SMOKE_TEST_PASS',d['statusCounts'])
PY
