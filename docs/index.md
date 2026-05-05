# Ops Documentation

This documentation describes the current Ops codebase: a single-package Electron desktop app with a React/TanStack renderer and a Supabase-only business data layer.

## Guides

| Guide | Purpose |
| --- | --- |
| [Getting Started](getting-started.md) | Install dependencies, configure Supabase, understand scripts, and reset local runtime config. |
| [Architecture](architecture.md) | Understand the renderer, schema registry, repositories, Supabase contracts, Electron shell, and update flow. |
| [Database](database.md) | Understand the Supabase data contract, table domains, soft-delete model, and schema registry responsibilities. |
| [API and Internal Contracts](api.md) | Review Supabase calls, RPC dependencies, and Electron bridge contracts used by the app. |
| [Deployment](deployment.md) | Review macOS release automation, updater artifacts, installer behavior, and release unknowns. |
| [Troubleshooting](troubleshooting.md) | Diagnose runtime config, Supabase, Electron, RPC, and updater issues. |
| [Security Policy](../SECURITY.md) | Review project-specific security considerations and reporting guidance. |

## Notes

- Screenshots and static documentation images live under `docs/images/`.
- The repository does not currently include Supabase migrations or seed scripts.
- Keep documentation aligned with `src/lib/schema-registry.ts`, `src/types/database.ts`, and `electron/shared/ops-api.ts` when the app contract changes.
