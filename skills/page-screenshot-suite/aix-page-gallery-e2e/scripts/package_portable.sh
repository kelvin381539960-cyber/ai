#!/bin/bash
set -euo pipefail
usage(){ echo "Usage: $0 --project DIR --site DIR --registry FILE --output FILE.tgz"; exit 2; }
PROJECT='';SITE='';REGISTRY='';OUTPUT=''
while [ $# -gt 0 ];do case "$1" in --project)PROJECT="$2";shift 2;;--site)SITE="$2";shift 2;;--registry)REGISTRY="$2";shift 2;;--output)OUTPUT="$2";shift 2;;*)usage;;esac;done
[ -n "$PROJECT" ]&&[ -n "$SITE" ]&&[ -n "$REGISTRY" ]&&[ -n "$OUTPUT" ]||usage
PROJECT="$(cd "$PROJECT"&&pwd)";[[ "$SITE" = /* ]]||SITE="$PROJECT/$SITE";[[ "$REGISTRY" = /* ]]||REGISTRY="$PROJECT/$REGISTRY"
[ -d "$SITE" ]||{ echo "Missing site: $SITE";exit 3; };[ -f "$REGISTRY" ]||{ echo "Missing registry: $REGISTRY";exit 3; }
D="$(cd "$(dirname "$0")"&&pwd)";ROOT="$(cd "$D/../.."&&pwd)";TMP="$(mktemp -d)";trap 'rm -rf "$TMP"' EXIT;P="$TMP/.gallery-portable";mkdir -p "$P/config"
cp -R "$SITE" "$P/site";cp "$REGISTRY" "$P/config/pageRegistry.json"
cp "$ROOT/chrome-cdp-page-capture/scripts/capture_cdp.py" "$P/";cp "$ROOT/chrome-cdp-page-capture/scripts/serve_static.py" "$P/";cp "$ROOT/chrome-cdp-page-capture/scripts/requirements.txt" "$P/"
cp "$ROOT/page-screenshot-audit/scripts/audit_screenshots.py" "$P/";cp "$ROOT/page-screenshot-audit/scripts/build_gallery_index.py" "$P/"
printf '{"formatVersion":1,"project":"%s","site":"%s","registry":"%s"}\n' "$PROJECT" "$SITE" "$REGISTRY" > "$P/bundle-manifest.json"
mkdir -p "$(dirname "$OUTPUT")";tar -C "$TMP" -czf "$OUTPUT" .gallery-portable;printf '%s\n' "$OUTPUT"
