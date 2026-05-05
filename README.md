# Ops

Ops is an Electron desktop operations manager backed by Supabase. It provides a schema-driven workspace for product catalog, customers, inventory, orders, payments, shipments, support operations, and analytics without adding a local business database to the desktop app.

The repository is a single-package desktop/web app. The renderer is built with React, TanStack Router, TanStack Table, Tailwind CSS, and Supabase JS. The native shell is built with Electron and stays intentionally thin: business data access goes through Supabase `from`, `rpc`, and `auth` calls.

## Current Status

- Active desktop app.
- Medium-sized single application, not a monorepo.
- Supabase-only business data layer.
- No local SQLite, `sqlx`, or desktop SQL plugin usage.
- No root-level Supabase migrations directory is present in this checkout.
- No first-party HTTP API server is present in this checkout.

## Main Features

- Runtime Supabase connection onboarding for installed desktop usage.
- Supabase Auth sign-in, sign-out, first-admin bootstrap, and role lookup.
- Schema-driven data console for 31 Supabase tables.
- CRUD forms generated from `src/lib/schema-registry.ts`.
- Relation selectors, table filtering, sorting, pagination, column visibility, and CSV export.
- Join editors for user roles, customer groups, product tags and sizes, order items, transaction items, and shipment items.
- Transactional RPC actions for order status updates and inventory reserve/release flows.
- Analytics dashboard backed by Supabase RPCs for sales, payments, checkout, inventory, products, and operations.
- Electron-backed local settings and runtime connection persistence.
- Electron auto-update integration with GitHub Releases through `electron-builder` and `electron-updater`.
- Browser translation protection through `notranslate` metadata and `translate="no"` on the document body.

## Technology Stack

| Area | Technology |
| --- | --- |
| Desktop shell | Electron, electron-vite, electron-builder, electron-updater |
| Renderer | React 19, TypeScript, Vite, TanStack Router |
| Data tables | TanStack Table |
| Styling | Tailwind CSS 4, shadcn-style components, Radix UI, Base UI, lucide-react |
| Charts | Recharts |
| Local UI settings | Electron IPC-backed JSON settings, browser localStorage fallback |
| Backend service | Supabase Auth, Postgres tables, RLS, RPC functions |
| Tests | Vitest |
| Release automation | GitHub Actions, electron-builder GitHub publishing |

## Screenshots

<p align="center">
  <img src="./docs/images/example.png" alt="Data console with table navigation" width="700" />
  <br />
  <em>Schema-driven data console with table navigation.</em>
</p>

<p align="center">
  <img src="./docs/images/example2.png" alt="Analytics dashboard" width="700" />
  <br />
  <em>Analytics dashboard with business metrics.</em>
</p>

## Project Structure

```text
ops/
|-- electron/
|   |-- main/                    # Electron main process, native IPC, protocol, updater
|   |-- preload/                 # contextBridge exposure for window.ops
|   `-- shared/                  # Shared IPC and bridge types
|-- src/
|   |-- routes/                  # TanStack Router routes
|   |-- components/app/          # Product-specific app and onboarding components
|   |-- components/ui/           # shadcn-style UI primitives and DataTable
|   |-- lib/
|   |   |-- desktop/             # window.ops bridge access
|   |   |-- supabase/            # Supabase client, auth, runtime config, errors
|   |   |-- db/repositories/     # Supabase table and RPC repositories
|   |   |-- analytics/           # Analytics range helpers
|   |   `-- schema-registry.ts   # Table metadata that drives the console UI
|   `-- types/                   # Supabase-generated and domain TypeScript types
|-- build/                       # Electron icon resources
|-- docs/                        # Project documentation
|-- scripts/reset-config.sh      # Local runtime config reset helper
|-- electron.vite.config.ts      # Main, preload, and renderer build config
|-- electron-builder.yml         # macOS package and update publishing config
|-- .github/workflows/           # Release automation
`-- install.sh                   # macOS release installer
```

## Runtime Model

Ops does not ship with a local business database. The desktop renderer resolves a Supabase connection in this order:

1. One-time bootstrap payload consumed by `window.ops.config.consumeSupabaseBootstrapPayload()`.
2. Saved runtime connection persisted through the Electron settings bridge under `supabase.runtime.connection`.
3. Development-only Vite environment fallback from `.env.local`.

In a browser-only development session, runtime config falls back to localStorage under `ops.supabase.runtime.connection`. In packaged Electron builds, environment fallback is disabled unless the app is running in development mode.

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Redirects to onboarding, login, or analytics depending on runtime config and session state. |
| `/onboarding` | Runtime Supabase connection setup and first administrator bootstrap. |
| `/login` | Supabase Auth email/password sign-in. |
| `/analytics` | RPC-backed dashboard for sales, payments, checkout, inventory, products, and operations. |
| `/tables/$table` | Schema-driven CRUD console for configured Supabase tables. |
| `/products` | Redirects to `/tables/products`. |
| `/orders` | Redirects to `/tables/orders`. |
| `/inventory` | Redirects to `/tables/inventory_levels`. |
| `/settings` | Runtime connection, local settings, identity context, and app update checks. |

## Prerequisites

- Node.js 22 or newer.
- pnpm.
- A Supabase project with the tables and RPC functions described by `src/types/database.ts`.
- macOS signing credentials for production auto-update releases.

The Supabase schema itself is not stored in this checkout. `src/types/database.ts` is the local TypeScript contract used by the app, but migrations and seed/reset scripts are not present here.

## Installation

```bash
pnpm install
```

Optional development fallback config can be created from `.env.example`:

```bash
cp .env.example .env.local
```

`.env.local` supports:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

Use only publishable/default Supabase keys in client-side configuration. Do not place service-role keys in this app.

## Available Scripts

| Script | Purpose |
| --- | --- |
| `pnpm install` | Install Node dependencies. |
| `pnpm dev` | Start the Electron desktop app in development mode. |
| `pnpm dev:web` | Start the Vite renderer development server only. |
| `pnpm build` | Build Electron main, preload, and renderer output into `out/`. |
| `pnpm preview` | Preview the Electron app from built output. |
| `pnpm dist:mac` | Build and package macOS assets with electron-builder. |
| `pnpm test` | Run Vitest tests. |
| `pnpm typecheck` | Run TypeScript without emitting files. |
| `pnpm lint` | Run ESLint. |
| `pnpm format` | Run the configured Prettier CLI. The package script does not pass a target path. |
| `pnpm check` | Runs `prettier --write .` and `eslint --fix`; this command mutates files. |

## Testing

Tests live next to TypeScript modules and use Vitest. Current coverage focuses on:

- Electron bridge-backed runtime Supabase config resolution and persistence.
- Browser fallback runtime config and local settings behavior.
- Supabase client cache/reset behavior.
- Schema registry coverage for all 31 table contracts.
- Hidden join route redirects.
- Table CRUD payload normalization, archive behavior, and lookup labels.
- Console read RPC fallback behavior.
- Console join RPC payload normalization.
- CSV helpers used by the data table export.
- Updater wrapper serialization.

Run tests with:

```bash
pnpm test
```

## Build and Release

The Electron build script is:

```bash
pnpm build
```

Packaging is configured in `electron-builder.yml`. The GitHub Actions workflow `.github/workflows/release-macos.yml` builds macOS assets with `electron-builder`, publishes GitHub Release artifacts, and uploads the update metadata used by `electron-updater`.

macOS auto-update requires a signed app. Configure these GitHub Actions secrets before relying on update installation:

- `CSC_LINK`
- `CSC_KEY_PASSWORD`

Optional notarization secrets:

- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

See `docs/deployment.md` for release details and current unknowns.

## Documentation

- `docs/getting-started.md`: local setup and runtime configuration.
- `docs/architecture.md`: technical architecture and data flow.
- `docs/database.md`: Supabase data contract and schema-driven UI model.
- `docs/api.md`: internal Supabase and Electron bridge contracts.
- `docs/deployment.md`: release and updater workflow.
- `docs/troubleshooting.md`: common setup and runtime issues.
- `SECURITY.md`: project-specific security considerations.

## Known Limitations

- The Supabase schema, migrations, and seed/reset workflow are not present in this checkout.
- RLS policies are assumed by the frontend and type contract, but policy SQL cannot be reviewed from this repository alone.
- The app stores publishable Supabase runtime connection data locally for desktop usage.
- Local app data can survive reinstall/uninstall and may need manual reset with `scripts/reset-config.sh`.
