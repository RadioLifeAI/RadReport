#!/usr/bin/env bash
set -euo pipefail
FILE=${1:?"Informe o arquivo .dump"}
pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" "$FILE"
echo "Restauração concluída de $FILE"