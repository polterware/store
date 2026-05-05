# Deployment

Ops is distributed as an Electron desktop app. The current repository contains macOS release automation and `electron-updater` configuration. It does not contain a web hosting deployment target or a production server deployment process.

## Release Configuration

The desktop release configuration lives in:

- `electron-builder.yml`
- `electron.vite.config.ts`
- `.github/workflows/release-macos.yml`
- `install.sh`

`electron-builder.yml` defines:

- App ID: `com.polterware.ops`.
- Product name: `Ops`.
- Build resources directory: `build`.
- Packaged files: Electron main, preload, renderer output, and `package.json`.
- macOS targets: `dmg` and `zip`.
- GitHub publishing target: `polterware/ops`.

## macOS GitHub Actions Workflow

`.github/workflows/release-macos.yml` runs on:

- Tags matching `v*`.
- Manual `workflow_dispatch`.

The workflow:

1. Checks out the repository.
2. Installs pnpm and Node.js 22.
3. Reads the release version from `package.json`.
4. Creates the GitHub Release if it does not already exist.
5. Installs dependencies with `pnpm install --frozen-lockfile`.
6. Builds Electron main, preload, and renderer output with `pnpm exec electron-vite build`.
7. Packages and publishes macOS x64 and arm64 assets with `pnpm exec electron-builder --mac --x64 --arm64 --publish always`.

## Required Release Secrets

The workflow references:

- `CSC_LINK`
- `CSC_KEY_PASSWORD`
- `GITHUB_TOKEN` provided by GitHub Actions.

`CSC_LINK` and `CSC_KEY_PASSWORD` are required for signed macOS apps and reliable auto-update behavior.

Optional notarization secrets:

- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

Do not commit signing certificates, passwords, API keys, or generated private key files.

## Installer

`install.sh` is a macOS installer script for GitHub Release assets. It:

- Supports latest release installation.
- Supports pinned version installation with `--version`.
- Supports private repositories or rate-limit avoidance through `GITHUB_TOKEN`.
- Detects macOS architecture.
- Selects a compatible Electron `.zip` app asset.
- Installs the `.app` bundle into `/Applications`.
- Removes the quarantine attribute from the installed app.

Example documented by the script:

```bash
curl -fsSL https://raw.githubusercontent.com/polterware/ops/main/install.sh | bash
```

## Build Commands

The repository scripts expose:

```bash
pnpm build
pnpm dist:mac
```

`pnpm build` creates Electron output under `out/`. `pnpm dist:mac` packages macOS assets locally. `pnpm dev` is for local desktop development, not production release.

## Production Configuration

Installed users configure Supabase through the app onboarding flow or an imported bootstrap payload. Production builds should not rely on Vite environment fallback values.

Required runtime values:

- Supabase URL.
- Supabase publishable key.
- Optional Supabase project ref.

The connected Supabase project must provide the tables and RPC functions used by `src/types/database.ts` and `src/lib/db/repositories/`.

## Current Unknowns

- TODO: not identified in the current codebase: exact Apple Developer ID certificate storage procedure.
- TODO: not identified in the current codebase: notarization verification policy.
- TODO: not identified in the current codebase: release promotion policy between staging and production channels.
- TODO: not identified in the current codebase: rollback procedure beyond installing a previous GitHub Release asset.
- TODO: not identified in the current codebase: Windows or Linux release workflow.
