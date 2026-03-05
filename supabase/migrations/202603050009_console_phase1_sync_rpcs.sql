-- Console phase 1 sync RPCs

create or replace function public.console_profile_roles_detail(
  p_user_id uuid
)
returns table (
  role_id uuid
)
language sql
stable
security invoker
set search_path = public
as $$
  select ur.role_id
  from public.user_roles ur
  where ur.user_id = p_user_id
    and ur.deleted_at is null
    and ur.lifecycle_status = 'active'
  order by ur.role_id;
$$;

grant execute on function public.console_profile_roles_detail(uuid) to authenticated;

create or replace function public.console_customer_groups_detail(
  p_customer_id uuid
)
returns table (
  group_id uuid
)
language sql
stable
security invoker
set search_path = public
as $$
  select cgm.customer_group_id as group_id
  from public.customer_group_memberships cgm
  where cgm.customer_id = p_customer_id
    and cgm.deleted_at is null
    and cgm.lifecycle_status = 'active'
  order by cgm.customer_group_id;
$$;

grant execute on function public.console_customer_groups_detail(uuid) to authenticated;

create or replace function public.console_profile_roles_sync(
  p_user_id uuid,
  p_role_ids uuid[]
)
returns table (
  target_count integer,
  active_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role_ids uuid[] := coalesce(
    array(
      select distinct role_id
      from unnest(coalesce(p_role_ids, '{}'::uuid[])) as role_id
      where role_id is not null
    ),
    '{}'::uuid[]
  );
begin
  perform app_private.require_operator();

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.deleted_at is null
  ) then
    raise exception 'Profile not found';
  end if;

  if exists (
    select 1
    from unnest(v_role_ids) as selected_role_id
    left join public.roles r
      on r.id = selected_role_id
     and r.deleted_at is null
     and r.lifecycle_status = 'active'
    where r.id is null
  ) then
    raise exception 'One or more roles are invalid or archived';
  end if;

  update public.user_roles ur
  set
    deleted_at = timezone('utc', now()),
    lifecycle_status = 'archived',
    updated_at = timezone('utc', now())
  where ur.user_id = p_user_id
    and ur.deleted_at is null
    and ur.lifecycle_status = 'active'
    and not (ur.role_id = any(v_role_ids));

  update public.user_roles ur
  set
    deleted_at = null,
    lifecycle_status = 'active',
    updated_at = timezone('utc', now())
  where ur.user_id = p_user_id
    and ur.role_id = any(v_role_ids)
    and (ur.deleted_at is not null or ur.lifecycle_status <> 'active');

  insert into public.user_roles (
    user_id,
    role_id,
    created_at,
    updated_at,
    lifecycle_status
  )
  select
    p_user_id,
    selected_role_id,
    timezone('utc', now()),
    timezone('utc', now()),
    'active'
  from unnest(v_role_ids) as selected_role_id
  where not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = p_user_id
      and ur.role_id = selected_role_id
  );

  return query
  select
    coalesce(array_length(v_role_ids, 1), 0)::integer as target_count,
    (
      select count(*)::integer
      from public.user_roles ur
      where ur.user_id = p_user_id
        and ur.deleted_at is null
        and ur.lifecycle_status = 'active'
    ) as active_count;
end;
$$;

grant execute on function public.console_profile_roles_sync(uuid, uuid[]) to authenticated;

create or replace function public.console_customer_groups_sync(
  p_customer_id uuid,
  p_group_ids uuid[]
)
returns table (
  target_count integer,
  active_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_ids uuid[] := coalesce(
    array(
      select distinct group_id
      from unnest(coalesce(p_group_ids, '{}'::uuid[])) as group_id
      where group_id is not null
    ),
    '{}'::uuid[]
  );
begin
  perform app_private.require_operator();

  if not exists (
    select 1
    from public.customers c
    where c.id = p_customer_id
      and c.deleted_at is null
  ) then
    raise exception 'Customer not found';
  end if;

  if exists (
    select 1
    from unnest(v_group_ids) as selected_group_id
    left join public.customer_groups cg
      on cg.id = selected_group_id
     and cg.deleted_at is null
     and cg.lifecycle_status = 'active'
    where cg.id is null
  ) then
    raise exception 'One or more customer groups are invalid or archived';
  end if;

  update public.customer_group_memberships cgm
  set
    deleted_at = timezone('utc', now()),
    lifecycle_status = 'archived',
    updated_at = timezone('utc', now())
  where cgm.customer_id = p_customer_id
    and cgm.deleted_at is null
    and cgm.lifecycle_status = 'active'
    and not (cgm.customer_group_id = any(v_group_ids));

  update public.customer_group_memberships cgm
  set
    deleted_at = null,
    lifecycle_status = 'active',
    updated_at = timezone('utc', now())
  where cgm.customer_id = p_customer_id
    and cgm.customer_group_id = any(v_group_ids)
    and (cgm.deleted_at is not null or cgm.lifecycle_status <> 'active');

  insert into public.customer_group_memberships (
    customer_id,
    customer_group_id,
    created_by,
    created_at,
    updated_at,
    lifecycle_status
  )
  select
    p_customer_id,
    selected_group_id,
    auth.uid(),
    timezone('utc', now()),
    timezone('utc', now()),
    'active'
  from unnest(v_group_ids) as selected_group_id
  where not exists (
    select 1
    from public.customer_group_memberships cgm
    where cgm.customer_id = p_customer_id
      and cgm.customer_group_id = selected_group_id
  );

  return query
  select
    coalesce(array_length(v_group_ids, 1), 0)::integer as target_count,
    (
      select count(*)::integer
      from public.customer_group_memberships cgm
      where cgm.customer_id = p_customer_id
        and cgm.deleted_at is null
        and cgm.lifecycle_status = 'active'
    ) as active_count;
end;
$$;

grant execute on function public.console_customer_groups_sync(uuid, uuid[]) to authenticated;
