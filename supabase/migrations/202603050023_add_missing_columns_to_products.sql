-- Add missing columns to products table that are required by Dost logic
alter table public.products 
add column if not exists has_size_options boolean not null default false,
add column if not exists quantity integer; -- used when has_size_options is false

-- Add a comment to document why these exist
comment on column public.products.has_size_options is 'Legacy field from Dost for UI size toggling';
comment on column public.products.quantity is 'Legacy field from Dost for simple inventory';
