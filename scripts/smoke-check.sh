#!/usr/bin/env bash
set -euo pipefail

missing=()
for var in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY; do
  if [[ -z "${!var:-}" ]]; then
    missing+=("$var")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Missing required env vars: ${missing[*]}"
  exit 1
fi

echo "Smoke check passed: Supabase env vars present."
