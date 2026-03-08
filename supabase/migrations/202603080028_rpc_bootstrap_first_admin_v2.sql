-- RPC: bootstrap_first_admin (v2)
-- Now accepts p_user_email so it can be called without auth.
-- Auto-confirms email and assigns admin role, but ONLY if no active admin exists.

create or replace function public.bootstrap_first_admin(p_user_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_admin_role_id uuid;
  v_has_admin boolean;
begin
  -- Find the user by email
  select u.id into v_user_id
  from auth.users u
  where lower(u.email) = lower(p_user_email)
  limit 1;

  if v_user_id is null then
    raise exception 'User not found';
  end if;

  -- Find the admin role
  select r.id into v_admin_role_id
  from public.roles r
  where r.code = 'admin'
    and r.deleted_at is null
    and r.lifecycle_status = 'active'
  limit 1;

  if v_admin_role_id is null then
    raise exception 'Admin role not found in public.roles';
  end if;

  -- Check if any active admin already exists
  select exists(
    select 1
    from public.user_roles ur
    where ur.role_id = v_admin_role_id
      and ur.deleted_at is null
      and ur.lifecycle_status = 'active'
  ) into v_has_admin;

  if v_has_admin then
    return false;
  end if;

  -- Auto-confirm the user's email so they can sign in immediately
  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
  where id = v_user_id;

  -- Assign admin role to the user
  insert into public.user_roles (user_id, role_id, deleted_at, lifecycle_status)
  values (v_user_id, v_admin_role_id, null, 'active')
  on conflict (user_id, role_id) do update
    set deleted_at = null,
        lifecycle_status = 'active',
        updated_at = now();

  return true;
end;
$$;

-- Drop the old overload (no params) so there's no ambiguity
drop function if exists public.bootstrap_first_admin();
