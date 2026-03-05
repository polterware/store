-- Align products table to Dost requirements
-- Adding slug, images, visibility and logistics attributes

alter table public.products 
add column if not exists slug text unique,
add column if not exists images text[] default '{}',
add column if not exists is_published boolean not null default false,
add column if not exists metadata jsonb not null default '{}',
add column if not exists weight numeric(10,3),
add column if not exists height numeric(10,2),
add column if not exists width numeric(10,2),
add column if not exists depth numeric(10,2);

-- Populate slug for existing products if any
update public.products 
set slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || sku
where slug is null;

-- Make slug not null after population
alter table public.products alter column slug set not null;

-- Add index for slug searches
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_is_published on public.products(is_published) where is_published = true;
