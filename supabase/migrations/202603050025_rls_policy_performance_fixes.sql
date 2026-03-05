-- Performance fixes for RLS linter warnings:
-- 1) auth_rls_initplan (wrap auth.uid() in select)
-- 2) multiple_permissive_policies (replace FOR ALL write policies with per-action policies)

-- 1) auth_rls_initplan
alter policy profiles_select on public.profiles
using (
  id = (select auth.uid())
  or app_private.has_role(array['admin'])
);

alter policy profiles_insert on public.profiles
with check (
  id = (select auth.uid())
  or app_private.has_role(array['admin'])
);

alter policy profiles_update on public.profiles
using (
  id = (select auth.uid())
  or app_private.has_role(array['admin'])
)
with check (
  id = (select auth.uid())
  or app_private.has_role(array['admin'])
);

alter policy user_roles_select on public.user_roles
using (
  app_private.has_role(array['admin', 'operator', 'analyst'])
  or user_id = (select auth.uid())
);

-- 2) multiple_permissive_policies
-- Operator/Admin write tables
DO $$
DECLARE
  v_table text;
  v_predicate text := 'app_private.has_role(array[''admin'', ''operator''])';
  v_tables text[] := array[
    'brands',
    'categories',
    'checkouts',
    'customer_addresses',
    'customer_group_memberships',
    'customer_groups',
    'customers',
    'inquiries',
    'inquiry_messages',
    'inventory_levels',
    'inventory_movements',
    'locations',
    'order_items',
    'orders',
    'payments',
    'pos_sessions',
    'product_metrics',
    'product_tags',
    'products',
    'refunds',
    'reviews',
    'shipment_events',
    'shipment_items',
    'shipments',
    'tags',
    'transaction_items',
    'transactions'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_tables
  LOOP
    execute format('drop policy if exists %I on public.%I', v_table || '_write', v_table);
    execute format('drop policy if exists %I on public.%I', v_table || '_write_insert', v_table);
    execute format('drop policy if exists %I on public.%I', v_table || '_write_update', v_table);
    execute format('drop policy if exists %I on public.%I', v_table || '_write_delete', v_table);

    execute format(
      'create policy %I on public.%I for insert with check (%s)',
      v_table || '_write_insert',
      v_table,
      v_predicate
    );

    execute format(
      'create policy %I on public.%I for update using (%s) with check (%s)',
      v_table || '_write_update',
      v_table,
      v_predicate,
      v_predicate
    );

    execute format(
      'create policy %I on public.%I for delete using (%s)',
      v_table || '_write_delete',
      v_table,
      v_predicate
    );
  END LOOP;
END $$;

-- Admin-only write tables
DO $$
DECLARE
  v_table text;
  v_predicate text := 'app_private.has_role(array[''admin''])';
  v_tables text[] := array[
    'roles',
    'user_roles'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_tables
  LOOP
    execute format('drop policy if exists %I on public.%I', v_table || '_write', v_table);
    execute format('drop policy if exists %I on public.%I', v_table || '_write_insert', v_table);
    execute format('drop policy if exists %I on public.%I', v_table || '_write_update', v_table);
    execute format('drop policy if exists %I on public.%I', v_table || '_write_delete', v_table);

    execute format(
      'create policy %I on public.%I for insert with check (%s)',
      v_table || '_write_insert',
      v_table,
      v_predicate
    );

    execute format(
      'create policy %I on public.%I for update using (%s) with check (%s)',
      v_table || '_write_update',
      v_table,
      v_predicate,
      v_predicate
    );

    execute format(
      'create policy %I on public.%I for delete using (%s)',
      v_table || '_write_delete',
      v_table,
      v_predicate
    );
  END LOOP;
END $$;
