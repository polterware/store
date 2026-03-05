-- Console phase 1 read RPCs

create or replace function public.console_profiles_list(
  p_include_archived boolean default false
)
returns table (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz,
  lifecycle_status text,
  roles_count bigint,
  role_names_csv text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    p.deleted_at,
    p.lifecycle_status,
    count(distinct r.id)::bigint as roles_count,
    coalesce(string_agg(distinct r.name, ', ' order by r.name), '')::text as role_names_csv
  from public.profiles p
  left join public.user_roles ur
    on ur.user_id = p.id
   and ur.deleted_at is null
   and ur.lifecycle_status = 'active'
  left join public.roles r
    on r.id = ur.role_id
   and r.deleted_at is null
   and r.lifecycle_status = 'active'
  where p_include_archived or p.deleted_at is null
  group by p.id, p.email, p.full_name, p.avatar_url, p.created_at, p.updated_at, p.deleted_at, p.lifecycle_status
  order by p.updated_at desc;
$$;

grant execute on function public.console_profiles_list(boolean) to authenticated;

create or replace function public.console_customers_list(
  p_include_archived boolean default false
)
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  notes text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz,
  lifecycle_status text,
  groups_count bigint,
  group_names_csv text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.id,
    c.full_name,
    c.email,
    c.phone,
    c.notes,
    c.created_by,
    c.created_at,
    c.updated_at,
    c.deleted_at,
    c.lifecycle_status,
    count(distinct cg.id)::bigint as groups_count,
    coalesce(string_agg(distinct cg.name, ', ' order by cg.name), '')::text as group_names_csv
  from public.customers c
  left join public.customer_group_memberships cgm
    on cgm.customer_id = c.id
   and cgm.deleted_at is null
   and cgm.lifecycle_status = 'active'
  left join public.customer_groups cg
    on cg.id = cgm.customer_group_id
   and cg.deleted_at is null
   and cg.lifecycle_status = 'active'
  where p_include_archived or c.deleted_at is null
  group by c.id, c.full_name, c.email, c.phone, c.notes, c.created_by, c.created_at, c.updated_at, c.deleted_at, c.lifecycle_status
  order by c.updated_at desc;
$$;

grant execute on function public.console_customers_list(boolean) to authenticated;
