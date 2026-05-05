#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────
# Ops Installer
# curl-installable script for macOS
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/polterware/ops/main/install.sh | bash
#   curl -fsSL ... | bash -s -- --version v1.2.0
# ──────────────────────────────────────────────────────────────

VERSION=""
REPO="polterware/ops"
TMP_DIR=""

# ── Helpers ───────────────────────────────────────────────────

info()  { printf '  \033[1;34m>\033[0m %s\n' "$*"; }
ok()    { printf '  \033[1;32m✓\033[0m %s\n' "$*"; }
warn()  { printf '  \033[1;33m!\033[0m %s\n' "$*" >&2; }
error() { printf '  \033[1;31mx\033[0m %s\n' "$*" >&2; exit 1; }

cleanup() {
  if [[ -n "$TMP_DIR" && -d "$TMP_DIR" ]]; then
    rm -rf "$TMP_DIR"
  fi
}
trap cleanup EXIT

usage() {
  cat <<'HELP'
Ops Installer — installs the Ops macOS app to /Applications.

Usage:
  install.sh [OPTIONS]

Options:
  --version <tag>   Install a specific release (e.g. v1.2.0).
                    Defaults to the latest release.
  --help            Show this help message.

Environment:
  GITHUB_TOKEN      If set, used for GitHub API requests (required
                    for private repos, avoids rate limits).

Examples:
  # Latest release
  curl -fsSL https://raw.githubusercontent.com/polterware/ops/main/install.sh | bash

  # Pinned version
  curl -fsSL ... | bash -s -- --version v1.2.0

  # Private repo
  GITHUB_TOKEN=ghp_xxx curl -fsSL ... | bash
HELP
  exit 0
}

# ── Argument parsing ──────────────────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      [[ -z "${2:-}" ]] && error "--version requires a value (e.g. v1.2.0)"
      VERSION="$2"
      shift 2
      ;;
    --help|-h)
      usage
      ;;
    *)
      error "Unknown option: $1. Use --help for usage."
      ;;
  esac
done

# ── OS detection ──────────────────────────────────────────────

detect_platform() {
  local os
  os="$(uname -s)"

  if [[ "$os" != "Darwin" ]]; then
    error "This installer only supports macOS. Detected OS: $os"
  fi

  ARCH="$(uname -m)"
  case "$ARCH" in
    arm64)  ARCH="arm64" ;;
    x86_64) ARCH="x86_64" ;;
    *)      error "Unsupported architecture: $ARCH" ;;
  esac

  ok "Detected macOS ($ARCH)"
}

# ── GitHub API helpers ────────────────────────────────────────

gh_api_headers() {
  local headers=(-H "Accept: application/vnd.github+json")
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    headers+=(-H "Authorization: Bearer $GITHUB_TOKEN")
  fi
  printf '%s\n' "${headers[@]}"
}

gh_curl() {
  local url="$1"
  local -a curl_args=(curl -fsSL)

  curl_args+=(-H "Accept: application/vnd.github+json")
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    curl_args+=(-H "Authorization: Bearer $GITHUB_TOKEN")
  fi

  "${curl_args[@]}" "$url"
}

# ── Fetch release metadata ───────────────────────────────────

fetch_release() {
  local api_url

  if [[ -n "$VERSION" ]]; then
    api_url="https://api.github.com/repos/${REPO}/releases/tags/${VERSION}"
    info "Fetching release $VERSION ..."
  else
    api_url="https://api.github.com/repos/${REPO}/releases/latest"
    info "Fetching latest release ..."
  fi

  RELEASE_JSON="$(gh_curl "$api_url" 2>&1)" || {
    if [[ "$RELEASE_JSON" == *"404"* || "$RELEASE_JSON" == *"Not Found"* ]]; then
      error "Release not found. Check the version tag or ensure GITHUB_TOKEN is set for private repos."
    fi
    error "Failed to fetch release from GitHub API: $RELEASE_JSON"
  }

  RELEASE_TAG="$(printf '%s' "$RELEASE_JSON" | grep '"tag_name"' | head -1 | sed 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')"
  [[ -z "$RELEASE_TAG" ]] && error "Could not parse release tag from API response."

  ok "Found release: $RELEASE_TAG"
}

# ── Artifact selection ────────────────────────────────────────
#
# Artifact selection rules:
#   - Supported format: .zip
#   - Must contain a macOS hint or match the Electron builder ops-<version>-<arch>.zip shape
#   - Architecture matching:
#       arm64  -> arm64 | aarch64
#       x86_64 -> x64   | x86_64 | amd64
#   - Universal builds match any architecture
# ──────────────────────────────────────────────────────────────

select_artifact() {
  # Extract asset names and URLs as "name url" pairs (one per line)
  local assets
  assets="$(printf '%s' "$RELEASE_JSON" \
    | grep '"browser_download_url"' \
    | sed 's/.*"browser_download_url"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' \
    | while IFS= read -r url; do
        name="$(basename "$url")"
        printf '%s %s\n' "$name" "$url"
      done)"

  [[ -z "$assets" ]] && error "No assets found in release $RELEASE_TAG."

  local best_name=""
  local best_url=""
  local best_score=0

  while IFS=' ' read -r name url; do
    [[ -z "$name" ]] && continue

    local lower
    lower="$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]')"

    # Must be a supported format
    local is_zip=false

    if [[ "$lower" == *.zip ]]; then
      is_zip=true
    else
      continue
    fi

    # Must have a macOS hint
    local has_mac_hint=false
    case "$lower" in
      *macos*|*darwin*|*universal*) has_mac_hint=true ;;
    esac
    if [[ "$is_zip" == true && "$lower" == *.app.zip ]]; then
      has_mac_hint=true
    fi
    if [[ "$is_zip" == true && "$lower" == ops-* ]]; then
      has_mac_hint=true
    fi
    [[ "$has_mac_hint" == false ]] && continue

    # Check architecture match
    local is_universal=false
    case "$lower" in
      *universal*) is_universal=true ;;
    esac

    local arch_match=false
    if [[ "$is_universal" == true ]]; then
      arch_match=true
    else
      case "$ARCH" in
        arm64)
          [[ "$lower" == *arm64* || "$lower" == *aarch64* ]] && arch_match=true
          ;;
        x86_64)
          # Match x64, x86_64, amd64 — but avoid matching arm64/aarch64
          if [[ "$lower" == *x86_64* || "$lower" == *amd64* ]]; then
            arch_match=true
          elif [[ "$lower" == *x64* && "$lower" != *arm64* && "$lower" != *aarch64* ]]; then
            arch_match=true
          fi
          ;;
      esac
    fi
    [[ "$arch_match" == false ]] && continue

    local score=1

    if (( score > best_score )); then
      best_score=$score
      best_name="$name"
      best_url="$url"
    fi
  done <<< "$assets"

  [[ -z "$best_url" ]] && error "No compatible macOS $ARCH artifact found in release $RELEASE_TAG."

  ARTIFACT_NAME="$best_name"
  ARTIFACT_URL="$best_url"

  ok "Selected artifact: $ARTIFACT_NAME"
}

# ── Download and install ──────────────────────────────────────

download_and_install() {
  TMP_DIR="$(mktemp -d)"
  local artifact_path="${TMP_DIR}/${ARTIFACT_NAME}"

  info "Downloading $ARTIFACT_NAME ..."

  local -a curl_args=(curl -fSL --progress-bar -o "$artifact_path")
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    curl_args+=(-H "Authorization: Bearer $GITHUB_TOKEN")
  fi
  curl_args+=(-H "Accept: application/octet-stream")
  curl_args+=("$ARTIFACT_URL")

  "${curl_args[@]}" || error "Download failed."
  ok "Downloaded successfully."

  info "Extracting ..."

  local lower
  lower="$(printf '%s' "$ARTIFACT_NAME" | tr '[:upper:]' '[:lower:]')"

  if [[ "$lower" == *.zip ]]; then
    unzip -qo "$artifact_path" -d "$TMP_DIR" || error "Failed to extract .zip archive."
  fi

  # Find the .app bundle
  local app_bundle
  app_bundle="$(find "$TMP_DIR" -maxdepth 2 -name '*.app' -type d | head -1)"
  [[ -z "$app_bundle" ]] && error "No .app bundle found in the extracted archive."

  local app_name
  app_name="$(basename "$app_bundle")"

  # Move to /Applications
  if [[ -d "/Applications/${app_name}" ]]; then
    warn "Replacing existing /Applications/${app_name}"
    rm -rf "/Applications/${app_name}"
  fi

  mv "$app_bundle" "/Applications/" || error "Failed to move ${app_name} to /Applications. You may need to run with sudo."

  ok "Installed /Applications/${app_name}"

  # Remove quarantine attribute so the app can be opened without Gatekeeper warning
  xattr -rd com.apple.quarantine "/Applications/${app_name}" 2>/dev/null || true

  ok "Installation complete! You can open the app from /Applications."
}

# ── Main ──────────────────────────────────────────────────────

main() {
  printf '\n  \033[1mOps Installer\033[0m\n\n'

  detect_platform
  fetch_release
  select_artifact
  download_and_install

  printf '\n'
}

main
