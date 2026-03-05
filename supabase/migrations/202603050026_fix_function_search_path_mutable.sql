-- Fix linter warning 0011_function_search_path_mutable
-- Pin search_path for trigger/helper functions that were mutable.

alter function app_private.auth_user_id()
  set search_path = auth, pg_catalog;

alter function app_private.set_updated_at()
  set search_path = pg_catalog;

alter function public.sync_profile_names()
  set search_path = pg_catalog, public;

alter function public.handle_new_user()
  set search_path = pg_catalog, public;

alter function public.sync_inventory_to_dost()
  set search_path = pg_catalog, public;
