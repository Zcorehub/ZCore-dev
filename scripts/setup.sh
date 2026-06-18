#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "=== ZCore setup ==="

echo ""
echo "[1/5] Creating .env files from examples..."

if [ ! -f "$ROOT/Server/.env" ]; then
  cp "$ROOT/Server/.env.example" "$ROOT/Server/.env"
  echo "  Created Server/.env"
else
  echo "  Server/.env already exists - skipped"
fi

if [ ! -f "$ROOT/Front/.env.local" ]; then
  cp "$ROOT/Front/.env.example" "$ROOT/Front/.env.local"
  echo "  Created Front/.env.local"
else
  echo "  Front/.env.local already exists - skipped"
fi

echo ""
echo "[2/5] Starting MySQL (Docker)..."
MYSQL_READY=false
if docker info >/dev/null 2>&1; then
  docker compose up -d
  echo "  Waiting for MySQL to be ready..."
  for i in $(seq 1 30); do
    health=$(docker inspect --format='{{.State.Health.Status}}' zcore-mysql 2>/dev/null || echo "")
    if [ "$health" = "healthy" ]; then
      MYSQL_READY=true
      break
    fi
    sleep 2
  done
  if [ "$MYSQL_READY" = true ]; then
    echo "  MySQL is ready."
  else
    echo "  MySQL started but healthcheck timed out — continuing anyway."
    MYSQL_READY=true
  fi
else
  echo "  Docker is not running. Start Docker, then: npm run db:up"
fi

echo ""
echo "[3/5] Installing dependencies..."
(cd "$ROOT/Server" && npm install)
(cd "$ROOT/Front" && npm install --legacy-peer-deps)

echo ""
echo "[4/5] Running database migrations and seed..."
(cd "$ROOT/Server" && npx prisma generate)
if [ "$MYSQL_READY" = true ]; then
  (cd "$ROOT/Server" && npx prisma migrate deploy && npm run prisma:seed)
  echo "  Database migrated and seeded."
else
  echo "  Skipped migrations — MySQL not available."
  echo "  After starting Docker: npm run db:up && npm run prisma:migrate && npm run prisma:seed"
fi

echo ""
echo "[5/5] Setup complete!"
echo ""
echo "  Terminal 1: npm run dev:server   (API  -> http://localhost:3000)"
echo "  Terminal 2: npm run dev:front    (DApp -> http://localhost:3001)"
echo ""
echo "  Dev API keys: dev_tw_key_local | dev_blend_key_local | dev_vaquita_key_local"
echo ""
