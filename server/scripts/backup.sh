#!/usr/bin/env bash
set -euo pipefail
DATE=$(date +%Y%m%d-%H%M%S)
OUT=${1:-backups}
mkdir -p "$OUT"
pg_dump --no-owner --no-privileges --format=custom "$DATABASE_URL" -t templates -t template_versions -t smart_sentences -t findings -t categories -t text_blocks -t recommendations -t lexicon > "$OUT/catalog-$DATE.dump"
echo "Backup salvo em $OUT/catalog-$DATE.dump"