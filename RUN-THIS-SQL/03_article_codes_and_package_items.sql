-- ============================================================================
-- Migration 003 — Article-Code Engine (Layer 1) + Package Items (Layer 2)
-- ----------------------------------------------------------------------------
-- Article code identifies a BASE PRODUCT + FABRIC (a SKU), not the customer's
-- customization. 8 fixed numeric segments:
--   1 target_group(2) 2 product_category(2) 3 fabric_family(2) 4 fabric_type(2)
--   5 supplier(3) 6 supplier_article_no(5) 7 specs_finishing(2) 8 reserved(3)
-- Human = dot-joined segment codes; machine = concatenated (no dots).
--
--   * article_segment_values — editable lookup values per segment (segment 6 is
--     scoped per supplier).
--   * product_skus          — the SKU registry: one row per (product + colour),
--     carrying its 8 segment codes + the generated human/machine strings.
--   * package_items         — what each package contains (item, qty, colour rules)
--     so heterogeneous SAFE CHINO sets (chino+shirt+belt) spawn correct sub-orders.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ─── Article segment value lookups ───────────────────────────────────────────
create table if not exists article_segment_values (
  id            uuid primary key default uuid_generate_v4(),
  segment_no    int  not null check (segment_no between 1 and 8),
  code          text not null,                 -- zero-padded digits matching segment width
  label         text not null,
  -- For segment 6 (supplier_article_no), scope the value to a supplier code so
  -- the same article number can exist under different suppliers.
  supplier_code text,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (segment_no, code, supplier_code)
);
create index if not exists idx_asv_segment on article_segment_values (segment_no);

-- ─── Product SKU registry (article code per product + fabric/colour) ─────────
create table if not exists product_skus (
  id                   uuid primary key default uuid_generate_v4(),
  sku_key              text not null unique,   -- e.g. 'chino:midnight-navy'
  product_category     text not null,          -- chino | shirt | belt
  color                text,                   -- colour value (null for belt families if needed)
  label                text,                   -- human label e.g. 'SAFE CHINO — Midnight Navy'
  fabric_composition   text,                   -- e.g. '70% PES / 30% Viscose'
  -- The 8 segment codes (segment 8 reserved is optional → null omits it).
  target_group_code        text not null,
  product_category_code    text not null,
  fabric_family_code       text not null,
  fabric_type_code         text not null,
  supplier_code            text not null,
  supplier_article_code    text not null,
  specs_code               text not null,
  reserved_code            text,
  article_human        text not null,
  article_machine       text not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists idx_skus_category on product_skus (product_category);

-- ─── Package items (what each package contains) ──────────────────────────────
create table if not exists package_items (
  id              uuid primary key default uuid_generate_v4(),
  package_id      uuid not null references packages(id) on delete cascade,
  item_type       text not null,                       -- chino | shirt | belt
  quantity        int  not null default 1 check (quantity >= 1),
  -- Colour / option constraints for this slot (empty = use the item's full catalog).
  allowed_colors  text[] not null default '{}',
  -- Free-form per-slot constraints the configurator enforces, e.g.
  -- {"sleeve":"short","shirt_color":"white-only"}.
  constraints     jsonb not null default '{}'::jsonb,
  sort_order      int  not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists idx_package_items_pkg on package_items (package_id);

-- Link sub_orders.package_item_id → package_items (column added in migration 002).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'fk_sub_orders_package_item') then
    alter table sub_orders
      add constraint fk_sub_orders_package_item
      foreign key (package_item_id) references package_items(id) on delete set null;
  end if;
end $$;

-- ─── updated_at triggers ─────────────────────────────────────────────────────
create trigger article_segment_values_updated_at before update on article_segment_values
  for each row execute function update_updated_at();
create trigger product_skus_updated_at before update on product_skus
  for each row execute function update_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table article_segment_values enable row level security;
alter table product_skus           enable row level security;
alter table package_items          enable row level security;

-- Catalog reads are public (configurator/preview); writes are admin-only.
create policy "Public read article_segment_values" on article_segment_values for select using (true);
create policy "Public read product_skus"            on product_skus            for select using (true);
create policy "Public read package_items"           on package_items           for select using (true);

do $$
declare t text;
begin
  foreach t in array array['article_segment_values','product_skus','package_items']
  loop
    execute format($f$
      create policy "Admin all %1$s" on %1$s
        for all
        using (auth.uid() in (select auth_user_id from admin_users))
        with check (auth.uid() in (select auth_user_id from admin_users));
    $f$, t);
  end loop;
end $$;
