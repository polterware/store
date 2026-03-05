-- Console phase 2 sync RPCs

create or replace function public.console_order_items_detail(
  p_order_id uuid
)
returns table (
  id uuid,
  product_id uuid,
  quantity integer,
  unit_price numeric,
  line_total numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    oi.id,
    oi.product_id,
    oi.quantity,
    oi.unit_price,
    oi.line_total
  from public.order_items oi
  where oi.order_id = p_order_id
    and oi.deleted_at is null
    and oi.lifecycle_status = 'active'
  order by oi.created_at asc;
$$;

grant execute on function public.console_order_items_detail(uuid) to authenticated;

create or replace function public.console_transaction_items_detail(
  p_transaction_id uuid
)
returns table (
  id uuid,
  kind text,
  reference_id uuid,
  amount numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    ti.id,
    ti.kind,
    ti.reference_id,
    ti.amount
  from public.transaction_items ti
  where ti.transaction_id = p_transaction_id
    and ti.deleted_at is null
    and ti.lifecycle_status = 'active'
  order by ti.created_at asc;
$$;

grant execute on function public.console_transaction_items_detail(uuid) to authenticated;

create or replace function public.console_shipment_items_detail(
  p_shipment_id uuid
)
returns table (
  id uuid,
  order_item_id uuid,
  quantity integer
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    si.id,
    si.order_item_id,
    si.quantity
  from public.shipment_items si
  where si.shipment_id = p_shipment_id
    and si.deleted_at is null
    and si.lifecycle_status = 'active'
  order by si.created_at asc;
$$;

grant execute on function public.console_shipment_items_detail(uuid) to authenticated;

create or replace function public.console_order_items_sync(
  p_order_id uuid,
  p_items jsonb
)
returns table (
  items_count integer,
  subtotal_amount numeric,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_subtotal numeric;
  v_total numeric;
begin
  perform app_private.require_operator();

  select *
  into v_order
  from public.orders o
  where o.id = p_order_id
    and o.deleted_at is null
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, product_id uuid, quantity integer, unit_price numeric)
    where i.product_id is null
      or i.quantity is null
      or i.quantity <= 0
      or i.unit_price is null
      or i.unit_price < 0
  ) then
    raise exception 'Each order item must contain product_id, quantity > 0 and unit_price >= 0';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, product_id uuid, quantity integer, unit_price numeric)
    where i.id is not null
      and not exists (
        select 1
        from public.order_items oi
        where oi.id = i.id
          and oi.order_id = p_order_id
      )
  ) then
    raise exception 'One or more order items do not belong to this order';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, product_id uuid, quantity integer, unit_price numeric)
    left join public.products p
      on p.id = i.product_id
     and p.deleted_at is null
     and p.lifecycle_status = 'active'
    where p.id is null
  ) then
    raise exception 'One or more products are invalid or archived';
  end if;

  update public.order_items oi
  set
    deleted_at = timezone('utc', now()),
    lifecycle_status = 'archived',
    updated_at = timezone('utc', now())
  where oi.order_id = p_order_id
    and oi.deleted_at is null
    and oi.lifecycle_status = 'active'
    and not (
      oi.id = any(
        coalesce(
          array(
            select i.id
            from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, product_id uuid, quantity integer, unit_price numeric)
            where i.id is not null
          ),
          '{}'::uuid[]
        )
      )
    );

  update public.order_items oi
  set
    product_id = i.product_id,
    quantity = i.quantity,
    unit_price = i.unit_price,
    line_total = (i.quantity::numeric * i.unit_price)::numeric,
    deleted_at = null,
    lifecycle_status = 'active',
    updated_at = timezone('utc', now())
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, product_id uuid, quantity integer, unit_price numeric)
  where i.id is not null
    and oi.id = i.id
    and oi.order_id = p_order_id;

  insert into public.order_items (
    order_id,
    product_id,
    quantity,
    unit_price,
    line_total,
    created_by,
    created_at,
    updated_at,
    lifecycle_status
  )
  select
    p_order_id,
    i.product_id,
    i.quantity,
    i.unit_price,
    (i.quantity::numeric * i.unit_price)::numeric,
    auth.uid(),
    timezone('utc', now()),
    timezone('utc', now()),
    'active'
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, product_id uuid, quantity integer, unit_price numeric)
  where i.id is null;

  select coalesce(sum(oi.line_total), 0)::numeric
  into v_subtotal
  from public.order_items oi
  where oi.order_id = p_order_id
    and oi.deleted_at is null
    and oi.lifecycle_status = 'active';

  v_total := (v_subtotal - coalesce(v_order.discount_amount, 0) + coalesce(v_order.tax_amount, 0) + coalesce(v_order.shipping_amount, 0))::numeric;

  update public.orders o
  set
    subtotal_amount = v_subtotal,
    total_amount = v_total,
    updated_at = timezone('utc', now())
  where o.id = p_order_id;

  return query
  select
    (
      select count(*)::integer
      from public.order_items oi
      where oi.order_id = p_order_id
        and oi.deleted_at is null
        and oi.lifecycle_status = 'active'
    ) as items_count,
    v_subtotal as subtotal_amount,
    v_total as total_amount;
end;
$$;

grant execute on function public.console_order_items_sync(uuid, jsonb) to authenticated;

create or replace function public.console_transaction_items_sync(
  p_transaction_id uuid,
  p_items jsonb
)
returns table (
  items_count integer,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric;
begin
  perform app_private.require_operator();

  if not exists (
    select 1
    from public.transactions t
    where t.id = p_transaction_id
      and t.deleted_at is null
  ) then
    raise exception 'Transaction not found';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, kind text, reference_id uuid, amount numeric)
    where i.kind is null
      or i.kind not in ('product', 'shipping', 'discount', 'tax', 'fee')
      or i.amount is null
  ) then
    raise exception 'Each transaction item must contain valid kind and amount';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, kind text, reference_id uuid, amount numeric)
    where i.id is not null
      and not exists (
        select 1
        from public.transaction_items ti
        where ti.id = i.id
          and ti.transaction_id = p_transaction_id
      )
  ) then
    raise exception 'One or more transaction items do not belong to this transaction';
  end if;

  update public.transaction_items ti
  set
    deleted_at = timezone('utc', now()),
    lifecycle_status = 'archived',
    updated_at = timezone('utc', now())
  where ti.transaction_id = p_transaction_id
    and ti.deleted_at is null
    and ti.lifecycle_status = 'active'
    and not (
      ti.id = any(
        coalesce(
          array(
            select i.id
            from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, kind text, reference_id uuid, amount numeric)
            where i.id is not null
          ),
          '{}'::uuid[]
        )
      )
    );

  update public.transaction_items ti
  set
    kind = i.kind,
    reference_id = i.reference_id,
    amount = i.amount,
    deleted_at = null,
    lifecycle_status = 'active',
    updated_at = timezone('utc', now())
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, kind text, reference_id uuid, amount numeric)
  where i.id is not null
    and ti.id = i.id
    and ti.transaction_id = p_transaction_id;

  insert into public.transaction_items (
    transaction_id,
    kind,
    reference_id,
    amount,
    created_by,
    created_at,
    updated_at,
    lifecycle_status
  )
  select
    p_transaction_id,
    i.kind,
    i.reference_id,
    i.amount,
    auth.uid(),
    timezone('utc', now()),
    timezone('utc', now()),
    'active'
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, kind text, reference_id uuid, amount numeric)
  where i.id is null;

  select coalesce(sum(ti.amount), 0)::numeric
  into v_total
  from public.transaction_items ti
  where ti.transaction_id = p_transaction_id
    and ti.deleted_at is null
    and ti.lifecycle_status = 'active';

  update public.transactions t
  set
    total_amount = v_total,
    updated_at = timezone('utc', now())
  where t.id = p_transaction_id;

  return query
  select
    (
      select count(*)::integer
      from public.transaction_items ti
      where ti.transaction_id = p_transaction_id
        and ti.deleted_at is null
        and ti.lifecycle_status = 'active'
    ) as items_count,
    v_total as total_amount;
end;
$$;

grant execute on function public.console_transaction_items_sync(uuid, jsonb) to authenticated;

create or replace function public.console_shipment_items_sync(
  p_shipment_id uuid,
  p_items jsonb
)
returns table (
  items_count integer,
  items_quantity_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  perform app_private.require_operator();

  select s.order_id
  into v_order_id
  from public.shipments s
  where s.id = p_shipment_id
    and s.deleted_at is null;

  if not found then
    raise exception 'Shipment not found';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, order_item_id uuid, quantity integer)
    where i.order_item_id is null
      or i.quantity is null
      or i.quantity <= 0
  ) then
    raise exception 'Each shipment item must contain order_item_id and quantity > 0';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, order_item_id uuid, quantity integer)
    where i.id is not null
      and not exists (
        select 1
        from public.shipment_items si
        where si.id = i.id
          and si.shipment_id = p_shipment_id
      )
  ) then
    raise exception 'One or more shipment items do not belong to this shipment';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, order_item_id uuid, quantity integer)
    left join public.order_items oi
      on oi.id = i.order_item_id
     and oi.order_id = v_order_id
     and oi.deleted_at is null
     and oi.lifecycle_status = 'active'
    where oi.id is null
  ) then
    raise exception 'One or more order items are invalid for this shipment';
  end if;

  update public.shipment_items si
  set
    deleted_at = timezone('utc', now()),
    lifecycle_status = 'archived',
    updated_at = timezone('utc', now())
  where si.shipment_id = p_shipment_id
    and si.deleted_at is null
    and si.lifecycle_status = 'active'
    and not (
      si.id = any(
        coalesce(
          array(
            select i.id
            from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, order_item_id uuid, quantity integer)
            where i.id is not null
          ),
          '{}'::uuid[]
        )
      )
    );

  update public.shipment_items si
  set
    order_item_id = i.order_item_id,
    quantity = i.quantity,
    deleted_at = null,
    lifecycle_status = 'active',
    updated_at = timezone('utc', now())
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, order_item_id uuid, quantity integer)
  where i.id is not null
    and si.id = i.id
    and si.shipment_id = p_shipment_id;

  insert into public.shipment_items (
    shipment_id,
    order_item_id,
    quantity,
    created_by,
    created_at,
    updated_at,
    lifecycle_status
  )
  select
    p_shipment_id,
    i.order_item_id,
    i.quantity,
    auth.uid(),
    timezone('utc', now()),
    timezone('utc', now()),
    'active'
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(id uuid, order_item_id uuid, quantity integer)
  where i.id is null;

  return query
  select
    (
      select count(*)::integer
      from public.shipment_items si
      where si.shipment_id = p_shipment_id
        and si.deleted_at is null
        and si.lifecycle_status = 'active'
    ) as items_count,
    (
      select coalesce(sum(si.quantity), 0)::integer
      from public.shipment_items si
      where si.shipment_id = p_shipment_id
        and si.deleted_at is null
        and si.lifecycle_status = 'active'
    ) as items_quantity_total;
end;
$$;

grant execute on function public.console_shipment_items_sync(uuid, jsonb) to authenticated;
