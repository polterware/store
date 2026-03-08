-- Change all created_by / author_id / opened_by FKs from RESTRICT to SET NULL
-- so that deleting a user from auth.users does not fail.

ALTER TABLE public.brands
  DROP CONSTRAINT brands_created_by_fkey,
  ADD CONSTRAINT brands_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.categories
  DROP CONSTRAINT categories_created_by_fkey,
  ADD CONSTRAINT categories_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.checkouts
  DROP CONSTRAINT checkouts_created_by_fkey,
  ADD CONSTRAINT checkouts_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.customer_addresses
  DROP CONSTRAINT customer_addresses_created_by_fkey,
  ADD CONSTRAINT customer_addresses_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.customer_group_memberships
  DROP CONSTRAINT customer_group_memberships_created_by_fkey,
  ADD CONSTRAINT customer_group_memberships_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.customer_groups
  DROP CONSTRAINT customer_groups_created_by_fkey,
  ADD CONSTRAINT customer_groups_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.customers
  DROP CONSTRAINT customers_created_by_fkey,
  ADD CONSTRAINT customers_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.inquiries
  DROP CONSTRAINT inquiries_created_by_fkey,
  ADD CONSTRAINT inquiries_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.inquiry_messages
  DROP CONSTRAINT inquiry_messages_author_id_fkey,
  ADD CONSTRAINT inquiry_messages_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.inventory_levels
  DROP CONSTRAINT inventory_levels_created_by_fkey,
  ADD CONSTRAINT inventory_levels_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.inventory_movements
  DROP CONSTRAINT inventory_movements_created_by_fkey,
  ADD CONSTRAINT inventory_movements_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.locations
  DROP CONSTRAINT locations_created_by_fkey,
  ADD CONSTRAINT locations_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.order_items
  DROP CONSTRAINT order_items_created_by_fkey,
  ADD CONSTRAINT order_items_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.orders
  DROP CONSTRAINT orders_created_by_fkey,
  ADD CONSTRAINT orders_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.payments
  DROP CONSTRAINT payments_created_by_fkey,
  ADD CONSTRAINT payments_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.pos_sessions
  DROP CONSTRAINT pos_sessions_opened_by_fkey,
  ADD CONSTRAINT pos_sessions_opened_by_fkey
    FOREIGN KEY (opened_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.products
  DROP CONSTRAINT products_created_by_fkey,
  ADD CONSTRAINT products_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.refunds
  DROP CONSTRAINT refunds_created_by_fkey,
  ADD CONSTRAINT refunds_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.shipment_events
  DROP CONSTRAINT shipment_events_created_by_fkey,
  ADD CONSTRAINT shipment_events_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.shipment_items
  DROP CONSTRAINT shipment_items_created_by_fkey,
  ADD CONSTRAINT shipment_items_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.shipments
  DROP CONSTRAINT shipments_created_by_fkey,
  ADD CONSTRAINT shipments_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.transaction_items
  DROP CONSTRAINT transaction_items_created_by_fkey,
  ADD CONSTRAINT transaction_items_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.transactions
  DROP CONSTRAINT transactions_created_by_fkey,
  ADD CONSTRAINT transactions_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
