#!/usr/bin/env bash
# Reset all Supabase runtime config so the app starts fresh at onboarding.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
APP_DATA="$HOME/Library/Application Support/com.polterware.ops"
SETTINGS_FILE="$APP_DATA/settings.json"
BOOTSTRAP_FILE="$APP_DATA/bootstrap/supabase.json"
LEGACY_BOOTSTRAP_FILE="$HOME/Library/Application Support/uru/bootstrap/supabase.json"
ENV_LOCAL="$PROJECT_ROOT/.env.local"

if [ -f "$SETTINGS_FILE" ]; then
  rm "$SETTINGS_FILE"
  echo "Deleted $SETTINGS_FILE"
else
  echo "No settings file found (already clean)"
fi

if [ -f "$BOOTSTRAP_FILE" ]; then
  rm "$BOOTSTRAP_FILE"
  echo "Deleted $BOOTSTRAP_FILE"
else
  echo "No bootstrap payload found in app config"
fi

if [ -f "$LEGACY_BOOTSTRAP_FILE" ]; then
  rm "$LEGACY_BOOTSTRAP_FILE"
  echo "Deleted legacy payload $LEGACY_BOOTSTRAP_FILE"
else
  echo "No legacy bootstrap payload found"
fi

if [ -f "$ENV_LOCAL" ]; then
  rm "$ENV_LOCAL"
  echo "Deleted $ENV_LOCAL"
else
  echo "No .env.local found (already clean)"
fi

echo ""
echo "Done. Restart the renderer or desktop app for changes to take effect."
