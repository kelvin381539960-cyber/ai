#!/bin/bash
set -euo pipefail
[ $# -eq 1 ]||{ echo "Usage: $0 /path/to/project";exit 2; }
TARGET="$(cd "$1"&&pwd)";D="$(cd "$(dirname "$0")"&&pwd)";ROOT="$(cd "$D/../.."&&pwd)";DST="$TARGET/.agents/skills";STAMP="$(date +%Y%m%d-%H%M%S)";BACKUP="$TARGET/.page-screenshot-skill-backup/$STAMP";mkdir -p "$DST"
for name in aix-page-gallery-e2e expo-router-page-gallery chrome-cdp-page-capture page-screenshot-audit aix-preview-adapter;do
 if [ -e "$DST/$name" ];then mkdir -p "$BACKUP";mv "$DST/$name" "$BACKUP/$name";fi
 cp -R "$ROOT/$name" "$DST/$name"
done
echo "Installed to $DST";[ ! -d "$BACKUP" ]||echo "Backup: $BACKUP"
