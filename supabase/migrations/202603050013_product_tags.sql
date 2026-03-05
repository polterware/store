-- Add tags and product_tags (many-to-many)

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.product_tags (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived')),
  unique (product_id, tag_id)
);

-- Triggers for updated_at
create trigger trg_tags_updated_at before update on public.tags for each row execute function app_private.set_updated_at();
create trigger trg_product_tags_updated_at before update on public.product_tags for each row execute function app_private.set_updated_at();

-- RLS
alter table public.tags enable row level security;
alter table public.product_tags enable row level security;

create policy tags_select on public.tags for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy tags_write on public.tags for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy product_tags_select on public.product_tags for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy product_tags_write on public.product_tags for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

-- Helper RPC for reading product tags
create or replace function public.console_product_tags_detail(
  p_product_id uuid
)
returns table (
  tag_id uuid
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    pt.tag_id
  from public.product_tags pt
  where pt.product_id = p_product_id
    and pt.deleted_at is null
    and pt.lifecycle_status = 'active';
$$;

grant execute on function public.console_product_tags_detail(uuid) to authenticated;

-- Helper RPC for syncing tags (similar to other console sync RPCs)
create or replace function public.console_product_tags_sync(
  p_product_id uuid,
  p_tag_ids uuid[]
)
returns table (
  tags_count integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform app_private.require_operator();

  if not exists (
    select 1
    from public.products p
    where p.id = p_product_id
      and p.deleted_at is null
  ) then
    raise exception 'Product not found';
  end if;

  -- Archive tags not in the new list
  update public.product_tags
  set
    deleted_at = timezone('utc', now()),
    lifecycle_status = 'archived',
    updated_at = timezone('utc', now())
  where product_id = p_product_id
    and deleted_at is null
    and lifecycle_status = 'active'
    and not (tag_id = any(p_tag_ids));

  -- Reactivate or Insert new tags
  insert into public.product_tags (product_id, tag_id, lifecycle_status)
  select p_product_id, t.id, 'active'
  from unnest(p_tag_ids) as t(id)
  on conflict (product_id, tag_id) do update
  set
    deleted_at = null,
    lifecycle_status = 'active',
    updated_at = timezone('utc', now());

  return query
  select count(*)::integer
  from public.product_tags
  where product_id = p_product_id
    and deleted_at is null
    and lifecycle_status = 'active';
end;
$$;

grant execute on function public.console_product_tags_sync(uuid, uuid[]) to authenticated;
