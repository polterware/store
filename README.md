<p align="center">
  <img src="./docs/images/header.png" alt="URU header" />
</p>

# URU

Open-source project to help people manage their businesses using a desktop app (Tauri + React) integrated with Supabase.

## Overview

- Open source, focused on business operations (catalog, CRM, sales, payments, inventory, and governance)
- Architecture designed for real operations: single desktop app + Supabase backend
- Secure-by-default model: JWT, strict RLS, and RPC for critical transactional flows
- No local SQLite for business data and no domain CRUD in the Tauri backend

## Screenshots

<p align="center">
  <img src="./docs/images/example.png" alt="Schema-driven data console" width="700" />
</p>

<p align="center">
  <img src="./docs/images/example2.png" alt="Analytics dashboard" width="700" />
</p>

## Prerequisites

- Node.js 20+
- `pnpm`
- Rust toolchain (for Tauri desktop build)
- Tauri system dependencies (see Tauri docs for your OS)
- Supabase CLI (`supabase`)
- Docker (optional, only for `db local-reset` mode)

## Recommended Knowledge

It is extremely recommended to have solid software engineering knowledge to use this app in real scenarios. This is not only for contributors: day-to-day operation also requires handling environment variables, Supabase project setup, migrations, and access-control concepts (roles/RLS). We are actively working to simplify these areas so more people can use the app with less technical overhead.

## Quick Start

```bash
pnpm install
pnpm uru setup
```

The setup wizard will check prerequisites, create `.env.local` interactively, install dependencies, link your Supabase project, and push migrations.

Once setup is done:

```bash
pnpm uru dev
```

## CLI Commands

All project operations go through the `pnpm uru` CLI:

| Command | Description |
|---------|-------------|
| `pnpm uru` | Interactive menu |
| `pnpm uru setup` | First-time setup wizard |
| `pnpm uru dev` | Start dev server (web or desktop) |
| `pnpm uru db` | Database operations menu |
| `pnpm uru db push` | Push migrations (non-destructive) |
| `pnpm uru db lint` | Lint migrations |
| `pnpm uru db reset` | Reset linked remote DB (destructive, requires confirmation) |
| `pnpm uru db local-reset` | Reset local Docker stack |
| `pnpm uru check` | Run Prettier + ESLint fix |
| `pnpm uru --help` | Show all commands |

### Database flags

- `--relink` — force `supabase link` before running db commands
- `SUPABASE_DB_PASSWORD` env var — avoid password prompts during link/reset/push

## Other Scripts

- `pnpm build` — production web build
- `pnpm preview` — preview build output
- `pnpm test` — run tests via Vitest

## Project Structure

- `src/routes`: app routes (`/login`, `/products`, `/orders`, `/inventory`, `/settings`)
- `src/lib/supabase`: Supabase client, auth, and error handling
- `src/lib/db/repositories`: data-access layer over Supabase
- `supabase/migrations`: schema, RLS policies, and RPC contract
- `src-tauri/src/lib.rs`: desktop shell (no business DB ownership)
- `cli/`: interactive CLI toolkit

## Security Model

- Authentication source: Supabase Auth
- Role model: `admin`, `operator`, `analyst`
- RLS enabled for business tables
- Critical state transitions implemented as server-side RPC

## Troubleshooting

- `Supabase is not configured...`:
  - Ensure `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - Restart `pnpm dev` after editing env vars
- Auth/network errors in desktop app:
  - Check firewall/VPN/proxy rules
  - Confirm Supabase project URL/key validity
  - Retry after restarting the app
