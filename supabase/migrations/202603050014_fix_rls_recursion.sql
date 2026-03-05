-- Fix RLS recursion causing "stack depth limit exceeded"
-- The has_role function needs to be security definer to bypass RLS when checking roles

create or replace function app_private.has_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public, app_private
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and ur.deleted_at is null
      and ur.lifecycle_status = 'active'
      and r.deleted_at is null
      and r.lifecycle_status = 'active'
      and r.code = any(required_roles)
  );
$$;

-- Ensure require_operator also uses the fixed has_role
create or replace function app_private.require_operator()
returns void
language plpgsql
security definer
set search_path = public, app_private
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not app_private.has_role(array['admin', 'operator']) then
    raise exception 'Operator or admin role required';
  end if;
end;
$$;
