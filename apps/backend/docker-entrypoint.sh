#!/usr/bin/env sh
set -e
# se placer dans le dossier backend
cd "$(dirname "$0")"

echo "== Prisma migrate deploy =="
pnpm prisma migrate deploy || true

echo "== Start API =="
pnpm tsx src/index.ts
