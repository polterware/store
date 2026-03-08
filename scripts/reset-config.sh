#!/usr/bin/env bash
# Reset all Supabase runtime config so the app starts fresh at onboarding.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
APP_DATA="$HOME/Library/Application Support/com.polterware.ops"
SETTINGS_FILE="$APP_DATA/settings.json"
ENV_LOCAL="$PROJECT_ROOT/.env.local"

# 1. Delete Tauri Store settings
if [ -f "$SETTINGS_FILE" ]; then
  rm "$SETTINGS_FILE"
  echo "✔ Deleted $SETTINGS_FILE"
else
  echo "— No settings file found (already clean)"
fi

# 2. Delete .env.local (Supabase keys)
if [ -f "$ENV_LOCAL" ]; then
  rm "$ENV_LOCAL"
  echo "✔ Deleted $ENV_LOCAL"
else
  echo "— No .env.local found (already clean)"
fi

echo ""
echo "Done. Restart the dev server (pnpm dev:web / pnpm dev) for changes to take effect."
