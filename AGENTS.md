# AGENTS.md - Ops vNext Assistant Guide

## Project scope

Ops is a desktop manager aligned to Dost project operations. The app is Supabase-only and single-context (no `shopId` runtime routing).

## Architectural rules

1. Use Supabase API (`from`, `rpc`, `auth`) for all business data access.
2. Do not add SQLite, `sqlx`, local SQL plugins, or local business databases.
3. Keep strict JWT + RLS assumptions in frontend and schema.
4. Prefer transactional RPCs for critical flows (inventory reservation, sale finalization, refunds, status transitions).
5. Keep the Electron main process thin; business CRUD belongs in Supabase.
6. Expose native capabilities only through the typed `window.ops` preload bridge.

## Directory map

- `electron/main`: Electron main process, app protocol, native IPC handlers, updater.
- `electron/preload`: `contextBridge` exposure for `window.ops`.
- `electron/shared`: shared IPC names and bridge types.
- `src/routes`: flat app routes (`/login`, `/products`, `/orders`, `/inventory`, `/settings`).
- `src/lib/supabase`: Supabase client/auth/error handling.
- `src/lib/db/repositories`: repository wrappers over Supabase API.
- `src/types`: local app and Supabase-generated types.

## Development commands

```bash
pnpm install
pnpm dev
pnpm dev:web
pnpm build
pnpm test
pnpm typecheck
```

## Database workflow

1. Backup existing Supabase data before reset.
2. Apply schema changes in the connected Supabase project; this checkout does not currently include migrations.
3. Regenerate or update `src/types/database.ts`.
4. Validate RLS and RPC behavior with authenticated users.

## Important constraints

- No `shop-store`, `use-shop`, `/shops/:shopId/*` routes.
- No mobile/pairing/offline-network architecture.
- No `@ops/types` workspace package; use local types in `src/types`.
- No renderer imports from `electron`, `ipcRenderer`, Node APIs, or main-process files.
