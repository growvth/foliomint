#!/usr/bin/env bash
# Run full local setup and start FolioMint (Next.js dev server).
# From repo root: ./scripts/run-app.sh   or   bash scripts/run-app.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "error: node is not installed or not on PATH" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "error: npm is not installed or not on PATH" >&2
  exit 1
fi

if [[ ! -f .env.local ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env.local
    echo "Created .env.local from .env.example — edit it with your keys (GROQ_API_KEY, NEXTAUTH_SECRET, OAuth, etc.)."
  else
    echo "warning: no .env.local and no .env.example; create .env.local before relying on auth or AI features." >&2
  fi
fi

mkdir -p data

echo "Installing dependencies..."
npm install

echo "Pushing database schema..."
npm run db:push

echo "Starting development server..."
exec npm run dev
