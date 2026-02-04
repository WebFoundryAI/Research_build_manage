#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../apps/frontend/.env.local"

if [[ -f "$ENV_FILE" ]]; then
  echo "ENV_FILE_EXISTS=true"
else
  echo "ENV_FILE_EXISTS=false"
fi

if [[ -f "$ENV_FILE" ]] && grep -q '^VITE_SUPABASE_URL=' "$ENV_FILE"; then
  echo "VITE_SUPABASE_URL_PRESENT=true"
else
  echo "VITE_SUPABASE_URL_PRESENT=false"
fi

if [[ -f "$ENV_FILE" ]] && grep -q '^VITE_SUPABASE_ANON_KEY=' "$ENV_FILE"; then
  echo "VITE_SUPABASE_ANON_KEY_PRESENT=true"
else
  echo "VITE_SUPABASE_ANON_KEY_PRESENT=false"
fi

if [[ -f "$ENV_FILE" ]] && grep -q '^VITE_SUPABASE_PUBLISHABLE_KEY=' "$ENV_FILE"; then
  echo "VITE_SUPABASE_PUBLISHABLE_KEY_PRESENT=true"
else
  echo "VITE_SUPABASE_PUBLISHABLE_KEY_PRESENT=false"
fi
