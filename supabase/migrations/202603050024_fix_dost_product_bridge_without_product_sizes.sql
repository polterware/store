-- Fix Dost compatibility bridge when legacy product_sizes table does not exist
-- Uses inventory_levels as stock source and synthesizes a default size entry.

alter table public.products
add column if not exists slug text,
add column if not exists images text[] default '{}',
add column if not exists is_published boolean not null default false,
add column if not exists weight numeric(10,3),
add column if not exists height numeric(10,2),
add column if not exists width numeric(10,2),
add column if not exists depth numeric(10,2),
add column if not exists category text,
add column if not exists subcategory text,
add column if not exists has_size_options boolean not null default false,
add column if not exists quantity integer;

create or replace function public.fetch_dost_products()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_result jsonb;
begin
    select jsonb_agg(p_data)
    into v_result
    from (
        with inventory_totals as (
            select
                il.product_id,
                coalesce(sum(il.quantity_available), 0)::integer as total_quantity
            from public.inventory_levels il
            where il.deleted_at is null
              and il.lifecycle_status = 'active'
            group by il.product_id
        )
        select
            p.id,
            p.sku,
            p.slug,
            p.title,
            p.title as name,
            p.description,
            p.price,
            p.is_published,
            p.lifecycle_status,
            p.created_at,
            p.updated_at,
            p.has_size_options,
            coalesce(inv.total_quantity, p.quantity, 0)::integer as quantity,
            coalesce(p.category, cat.name) as category,
            p.subcategory as subcategory,
            case
                when array_length(p.images, 1) > 0 then
                    (
                        select jsonb_agg(
                            jsonb_build_object('url', img, 'altText', null)
                        )
                        from unnest(p.images) as img
                    )
                else '[]'::jsonb
            end as images,
            jsonb_build_object(
                'weight', coalesce(p.weight, 0),
                'length', coalesce(p.depth, 0),
                'width', coalesce(p.width, 0),
                'height', coalesce(p.height, 0),
                'fragile', false,
                'dangerousGoods', false,
                'requiresSignature', false
            ) as shipping,
            case
                when p.has_size_options then
                    jsonb_build_array(
                        jsonb_build_object(
                            'id', p.id::text || '-default',
                            'product_id', p.id,
                            'size', 'Default',
                            'quantity', coalesce(inv.total_quantity, p.quantity, 0)::integer
                        )
                    )
                else '[]'::jsonb
            end as product_sizes
        from public.products p
        left join public.categories cat on cat.id = p.category_id
        left join inventory_totals inv on inv.product_id = p.id
        where p.deleted_at is null
          and p.lifecycle_status = 'active'
    ) p_data;

    return coalesce(v_result, '[]'::jsonb);
end;
$$;

grant execute on function public.fetch_dost_products() to anon, authenticated;

create or replace function public.sync_inventory_to_dost()
returns trigger as $$
declare
    v_total_available integer;
begin
    select coalesce(sum(quantity_available), 0)::integer
    into v_total_available
    from public.inventory_levels
    where product_id = new.product_id
      and deleted_at is null
      and lifecycle_status = 'active';

    update public.products
    set quantity = v_total_available,
        updated_at = now()
    where id = new.product_id;

    return new;
end;
$$ language plpgsql;

drop trigger if exists tr_sync_inventory_to_dost on public.inventory_levels;
create trigger tr_sync_inventory_to_dost
    after insert or update on public.inventory_levels
    for each row execute function public.sync_inventory_to_dost();
