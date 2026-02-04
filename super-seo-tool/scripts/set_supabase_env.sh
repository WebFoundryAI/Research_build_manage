#!/usr/bin/env bash
set -euo pipefail

read -r -p "SUPABASE_URL: " SUPABASE_URL
read -r -s -p "SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
printf "\n"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/../apps/frontend"
mkdir -p "$ENV_DIR"

cat <<ENVFILE > "$ENV_DIR/.env.local"
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
VITE_SUPABASE_PUBLISHABLE_KEY=${SUPABASE_ANON_KEY}
ENVFILE

echo "WROTE super-seo-tool/apps/frontend/.env.local"
