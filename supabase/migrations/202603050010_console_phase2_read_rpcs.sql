-- Console phase 2 read RPCs

create or replace function public.console_orders_list(
  p_include_archived boolean default false
)
returns table (
  id uuid,
  order_number text,
  customer_id uuid,
  checkout_id uuid,
  status text,
  payment_status text,
  fulfillment_status text,
  subtotal_amount numeric,
  discount_amount numeric,
  tax_amount numeric,
  shipping_amount numeric,
  total_amount numeric,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz,
  lifecycle_status text,
  items_count bigint,
  items_quantity_total bigint,
  items_total_amount numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    o.id,
    o.order_number,
    o.customer_id,
    o.checkout_id,
    o.status,
    o.payment_status,
    o.fulfillment_status,
    o.subtotal_amount,
    o.discount_amount,
    o.tax_amount,
    o.shipping_amount,
    o.total_amount,
    o.created_by,
    o.created_at,
    o.updated_at,
    o.deleted_at,
    o.lifecycle_status,
    count(oi.id)::bigint as items_count,
    coalesce(sum(oi.quantity), 0)::bigint as items_quantity_total,
    coalesce(sum(oi.line_total), 0)::numeric as items_total_amount
  from public.orders o
  left join public.order_items oi
    on oi.order_id = o.id
   and oi.deleted_at is null
   and oi.lifecycle_status = 'active'
  where p_include_archived or o.deleted_at is null
  group by
    o.id,
    o.order_number,
    o.customer_id,
    o.checkout_id,
    o.status,
    o.payment_status,
    o.fulfillment_status,
    o.subtotal_amount,
    o.discount_amount,
    o.tax_amount,
    o.shipping_amount,
    o.total_amount,
    o.created_by,
    o.created_at,
    o.updated_at,
    o.deleted_at,
    o.lifecycle_status
  order by o.created_at desc;
$$;

grant execute on function public.console_orders_list(boolean) to authenticated;

create or replace function public.console_transactions_list(
  p_include_archived boolean default false
)
returns table (
  id uuid,
  order_id uuid,
  checkout_id uuid,
  status text,
  total_amount numeric,
  currency text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz,
  lifecycle_status text,
  items_count bigint,
  items_total_amount numeric,
  item_kinds_csv text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    t.id,
    t.order_id,
    t.checkout_id,
    t.status,
    t.total_amount,
    t.currency,
    t.created_by,
    t.created_at,
    t.updated_at,
    t.deleted_at,
    t.lifecycle_status,
    count(ti.id)::bigint as items_count,
    coalesce(sum(ti.amount), 0)::numeric as items_total_amount,
    coalesce(string_agg(distinct ti.kind, ', ' order by ti.kind), '')::text as item_kinds_csv
  from public.transactions t
  left join public.transaction_items ti
    on ti.transaction_id = t.id
   and ti.deleted_at is null
   and ti.lifecycle_status = 'active'
  where p_include_archived or t.deleted_at is null
  group by
    t.id,
    t.order_id,
    t.checkout_id,
    t.status,
    t.total_amount,
    t.currency,
    t.created_by,
    t.created_at,
    t.updated_at,
    t.deleted_at,
    t.lifecycle_status
  order by t.created_at desc;
$$;

grant execute on function public.console_transactions_list(boolean) to authenticated;

create or replace function public.console_shipments_list(
  p_include_archived boolean default false
)
returns table (
  id uuid,
  order_id uuid,
  status text,
  carrier text,
  tracking_number text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz,
  lifecycle_status text,
  items_count bigint,
  items_quantity_total bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    s.id,
    s.order_id,
    s.status,
    s.carrier,
    s.tracking_number,
    s.shipped_at,
    s.delivered_at,
    s.created_by,
    s.created_at,
    s.updated_at,
    s.deleted_at,
    s.lifecycle_status,
    count(si.id)::bigint as items_count,
    coalesce(sum(si.quantity), 0)::bigint as items_quantity_total
  from public.shipments s
  left join public.shipment_items si
    on si.shipment_id = s.id
   and si.deleted_at is null
   and si.lifecycle_status = 'active'
  where p_include_archived or s.deleted_at is null
  group by
    s.id,
    s.order_id,
    s.status,
    s.carrier,
    s.tracking_number,
    s.shipped_at,
    s.delivered_at,
    s.created_by,
    s.created_at,
    s.updated_at,
    s.deleted_at,
    s.lifecycle_status
  order by s.created_at desc;
$$;

grant execute on function public.console_shipments_list(boolean) to authenticated;
