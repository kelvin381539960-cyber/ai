#!/bin/bash
set -euo pipefail
usage(){ echo "Usage: $0 --bundle FILE.tgz --output DIR [--chrome PATH]";exit 2; }
BUNDLE='';OUTPUT='';CHROME=''
while [ $# -gt 0 ];do case "$1" in --bundle)BUNDLE="$2";shift 2;;--output)OUTPUT="$2";shift 2;;--chrome)CHROME="$2";shift 2;;*)usage;;esac;done
[ -f "$BUNDLE" ]&&[ -n "$OUTPUT" ]||usage;mkdir -p "$OUTPUT";WORK="$OUTPUT/work";rm -rf "$WORK";mkdir -p "$WORK";tar -C "$WORK" -xzf "$BUNDLE";P="$WORK/.gallery-portable"
[ -d "$P/site" ]&&[ -f "$P/config/pageRegistry.json" ]||{ echo 'Invalid bundle';exit 3; }
python3 - <<'PY' >/dev/null 2>&1||python3 -m pip install -r "$P/requirements.txt"
import websocket
from PIL import Image
PY
export GALLERY_OUTPUT="$OUTPUT/screenshots";[ -z "$CHROME" ]||export CHROME_PATH="$CHROME";(cd "$P"&&python3 capture_cdp.py)
cp "$P/capture-results.json" "$P/capture-results.csv" "$P/CAPTURE_REPORT.md" "$OUTPUT/";python3 "$P/audit_screenshots.py" --results "$OUTPUT/capture-results.json" --screenshots "$OUTPUT/screenshots" --output "$OUTPUT/audit";python3 "$P/build_gallery_index.py" --results "$OUTPUT/capture-results.json" --screenshots "$OUTPUT/screenshots" --output "$OUTPUT/index.html";echo "Capture complete: $OUTPUT"
