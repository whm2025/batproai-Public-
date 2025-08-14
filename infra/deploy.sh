#!/usr/bin/env bash
set -euo pipefail

# Charger l'owner GHCR
if [ -f ".env.deploy" ]; then
  set -a
  . ./.env.deploy
  set +a
fi

echo "== Pull images =="
docker compose -f infra/docker-compose.prod.yml --env-file .env.deploy pull

echo "== Up (detached) =="
docker compose -f infra/docker-compose.prod.yml --env-file .env.deploy up -d

echo "== Status =="
docker compose -f infra/docker-compose.prod.yml --env-file .env.deploy ps
