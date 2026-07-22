#!/bin/bash
set -euo pipefail
usage(){ echo "Usage: $0 --project DIR --site DIR --registry FILE --output DIR [--build COMMAND] [--chrome PATH]";exit 2; }
PROJECT='';SITE='';REGISTRY='';OUTPUT='';BUILD='';CHROME=''
while [ $# -gt 0 ];do case "$1" in --project)PROJECT="$2";shift 2;;--site)SITE="$2";shift 2;;--registry)REGISTRY="$2";shift 2;;--output)OUTPUT="$2";shift 2;;--build)BUILD="$2";shift 2;;--chrome)CHROME="$2";shift 2;;*)usage;;esac;done
[ -d "$PROJECT" ]&&[ -n "$SITE" ]&&[ -n "$REGISTRY" ]&&[ -n "$OUTPUT" ]||usage;D="$(cd "$(dirname "$0")"&&pwd)";[ -z "$BUILD" ]||(cd "$PROJECT"&&bash -lc "$BUILD");B="$(mktemp -u).tgz";trap 'rm -f "$B"' EXIT
"$D/package_portable.sh" --project "$PROJECT" --site "$SITE" --registry "$REGISTRY" --output "$B";A=(--bundle "$B" --output "$OUTPUT");[ -z "$CHROME" ]||A+=(--chrome "$CHROME");"$D/run_portable_capture.sh" "${A[@]}"
