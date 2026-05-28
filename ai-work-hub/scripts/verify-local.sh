#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[1/4] Installing dependencies"
npm install

echo "[2/4] Type checking"
npm run typecheck

echo "[3/4] Building"
npm run build

echo "[4/4] Done"
echo "Run the app with: npm run dev"
echo "Then run smoke checks with: npm run smoke"
