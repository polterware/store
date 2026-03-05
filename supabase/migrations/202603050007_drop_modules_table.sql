-- Remove obsolete modules table and any dependent objects.
-- This keeps existing environments aligned after the feature-flag concept removal.

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'modules'
  ) then
    execute 'drop table public.modules cascade';
  end if;
end;
$$;
