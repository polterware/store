# Getting Started

This guide covers local setup for the current Ops repository. Ops is an Electron desktop app with a React/TanStack renderer and Supabase as the external backend.

## Prerequisites

- Node.js 22 or newer.
- pnpm.
- A Supabase project with the schema represented by `src/types/database.ts`.
- Publishable/default Supabase key for development and runtime configuration.

The repository does not include Supabase migrations or seed scripts. The connected Supabase project must provide the tables, RLS policies, and RPC functions expected by the app.

## Install Dependencies

```bash
pnpm install
```

## Optional Development Environment

Copy the example environment file if you want a browser/development fallback:

```bash
cp .env.example .env.local
```

Supported variables:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

Do not use a Supabase service-role key. This is a client-side desktop app.

## Runtime Supabase Connection

Installed users configure Supabase through the onboarding flow or an imported bootstrap payload. Saved runtime config is persisted locally through the Electron settings bridge. In browser-only development, the same runtime connection can be stored in localStorage.

Runtime config resolution order:

1. A one-time bootstrap payload consumed by `window.ops.config.consumeSupabaseBootstrapPayload()`.
2. Saved Electron settings under `supabase.runtime.connection`.
3. Development/browser fallback from `.env.local`.

The Electron main process looks for the preferred bootstrap payload under the app data directory at `bootstrap/supabase.json`, then checks a legacy `uru/bootstrap/supabase.json` location.

Example payload:

```json
{
  "url": "https://your-project-ref.supabase.co",
  "publishableKey": "your-publishable-key",
  "projectRef": "your-project-ref",
  "updatedAt": "2026-05-05T00:00:00.000Z",
  "source": "bootstrap"
}
```

The payload is deleted after successful consumption.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Start the Electron desktop app in development mode. |
| `pnpm dev:web` | Start only the renderer dev server on port `3000`. |
| `pnpm build` | Build Electron main, preload, and renderer output into `out/`. |
| `pnpm preview` | Preview the Electron app from built output. |
| `pnpm dist:mac` | Build and package macOS assets. |
| `pnpm test` | Run Vitest tests. |
| `pnpm typecheck` | Run TypeScript without emitting files. |
| `pnpm lint` | Run ESLint. |
| `pnpm check` | Mutates files by running Prettier write and ESLint fix. |

## Local Data Reset

Use the reset helper when runtime config gets stale:

```bash
./scripts/reset-config.sh
```

The script removes:

- Electron settings under `~/Library/Application Support/com.polterware.ops/settings.json`.
- Bootstrap payloads under `~/Library/Application Support/com.polterware.ops/bootstrap/supabase.json`.
- Legacy bootstrap payloads under `~/Library/Application Support/uru/bootstrap/supabase.json`.
- Local `.env.local`.

Restart the renderer or desktop app after running it.

## Common First Run Flow

1. Install dependencies.
2. Start the app.
3. Complete onboarding with the Supabase URL and publishable key.
4. Sign in with a Supabase Auth user.
5. Bootstrap the first admin if the connected project allows `bootstrap_first_admin`.
6. Open the products, orders, inventory, or analytics workspace.

## Current Unknowns

- TODO: not identified in the current codebase: checked-in Supabase migration/reset workflow.
- TODO: not identified in the current codebase: production Supabase project promotion process.
- TODO: not identified in the current codebase: required seed data for a fresh Supabase project.
