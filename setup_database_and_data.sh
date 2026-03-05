#!/usr/bin/env bash
set -euo pipefail

# URU vNext database operations (Supabase-only).
#
# Modes:
#   linked-reset (default): reset remote linked project and apply local migrations
#   linked-push:            push local migrations to remote linked project (no full reset)
#   linked-lint:            run lint against remote linked project
#   local-reset:            reset local docker stack (requires supabase start/docker)
#
# Usage:
#   ./setup_database_and_data.sh
#   ./setup_database_and_data.sh linked-reset
#   ./setup_database_and_data.sh linked-push
#   ./setup_database_and_data.sh linked-lint
#   ./setup_database_and_data.sh local-reset
#
# Safety:
#   For linked-reset, set URU_CONFIRM_RESET=YES to skip interactive confirmation.
#   Optionally set SUPABASE_DB_PASSWORD to avoid password prompts.

MODE="${1:-linked-reset}"
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

run_link() {
  if [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
    supabase link --password "$SUPABASE_DB_PASSWORD"
  else
    supabase link
  fi
}

run_db_reset_linked() {
  if [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
    supabase db reset --linked --password "$SUPABASE_DB_PASSWORD"
  else
    supabase db reset --linked
  fi
}

run_db_push_linked() {
  if [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
    supabase db push --linked --password "$SUPABASE_DB_PASSWORD"
  else
    supabase db push --linked
  fi
}

case "$MODE" in
  linked-reset)
    echo "1) Linking project (if needed)"
    run_link

    echo "2) Backup reminder"
    echo "Before running reset, ensure a backup was exported from the current Dost project."

    if [[ "${URU_CONFIRM_RESET:-}" != "YES" ]]; then
      echo
      echo "WARNING: This will DROP user-created entities in the LINKED remote database and reapply migrations."
      read -r -p "Type RESET to continue: " CONFIRM
      if [[ "$CONFIRM" != "RESET" ]]; then
        echo "Aborted."
        exit 1
      fi
    fi

    echo "3) Running remote migration reset (--linked)"
    run_db_reset_linked
    ;;

  linked-push)
    echo "1) Linking project (if needed)"
    run_link

    echo "2) Applying pending migrations to linked project"
    run_db_push_linked
    ;;

  linked-lint)
    echo "1) Linking project (if needed)"
    run_link

    echo "2) Running lint in linked project"
    supabase db lint --linked
    ;;

  local-reset)
    echo "Running local reset (requires local supabase stack/docker)"
    supabase db reset --local
    ;;

  *)
    echo "Unknown mode: $MODE"
    echo "Valid modes: linked-reset | linked-push | local-reset"
    exit 1
    ;;
esac

echo "Done."
