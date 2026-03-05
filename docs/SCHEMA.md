# Supabase Schema Contract

Base migration is in:

- `supabase/migrations/202603040001_uru_vnext_init.sql`

The migration includes:

- Full table baseline for URU vNext
- Lifecycle columns: `created_at`, `updated_at`, `deleted_at`, `lifecycle_status`
- Soft-delete convention (`deleted_at`)
- Performance indexes for orders, payments, inventory and analytics
- Strict RLS activation and policies
- Transactional RPCs:
  - `reserve_inventory_stock`
  - `release_inventory_stock`
  - `create_order_with_items`
  - `finalize_sale`
  - `cancel_order_with_restock`
  - `request_refund`
  - `update_order_status`
