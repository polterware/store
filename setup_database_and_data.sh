#!/usr/bin/env bash
set -euo pipefail

# Resets and applies URU vNext Supabase migrations.
# Requires Supabase CLI and authenticated project context.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPABASE_DIR="$ROOT_DIR/supabase"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Error: Supabase CLI is not installed."
  echo "Install: https://supabase.com/docs/guides/cli"
  exit 1
fi

if [[ ! -d "$SUPABASE_DIR/migrations" ]]; then
  echo "Error: migration directory not found: $SUPABASE_DIR/migrations"
  exit 1
fi

echo "1) Linking project (if needed)"
supabase link || true

echo "2) Backup reminder"
echo "Before running reset, ensure a backup was exported from the current Dost project."

echo "3) Running migration reset"
supabase db reset

echo "Done. Supabase project reset and URU vNext migrations applied."
