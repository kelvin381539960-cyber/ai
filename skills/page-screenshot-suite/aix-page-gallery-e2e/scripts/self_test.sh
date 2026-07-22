#!/bin/bash
set -euo pipefail
D="$(cd "$(dirname "$0")"&&pwd)";ROOT="$(cd "$D/../.."&&pwd)"
cleanup(){ find "$ROOT" -name '__pycache__' -type d -prune -exec rm -rf {} + 2>/dev/null||true;find "$ROOT" -name '*.pyc' -delete 2>/dev/null||true; }
trap cleanup EXIT
for name in aix-page-gallery-e2e expo-router-page-gallery chrome-cdp-page-capture page-screenshot-audit aix-preview-adapter;do test -f "$ROOT/$name/SKILL.md";done
python3 -m py_compile "$ROOT/chrome-cdp-page-capture/scripts/capture_cdp.py" "$ROOT/chrome-cdp-page-capture/scripts/serve_static.py" "$ROOT/page-screenshot-audit/scripts/audit_screenshots.py" "$ROOT/page-screenshot-audit/scripts/build_gallery_index.py" "$ROOT/aix-preview-adapter/scripts/install_aix_adapter.py"
node --check "$ROOT/expo-router-page-gallery/scripts/scan_routes.js"
for f in "$ROOT/aix-page-gallery-e2e/scripts/"*.sh;do bash -n "$f";done
printf 'PASS: 5 skills, Python/Node/Shell syntax valid\n'
