-- ============================================================================
-- Migration 001 — Kickstarter Order Flow + Order Backbone
-- ----------------------------------------------------------------------------
-- Phase 1, scope item #1 (Kickstarter Order Flow) + the relational backbone
-- that items #2, #4, #5, #6, #7, #8 build on top of.
--
-- Design decisions (confirmed with client):
--   * 1 backer = 1 order with N sub-orders (one sub-order per garment/slot).
--   * Backer data ingested via CSV import (standard Kickstarter backer-report
--     columns) behind a swappable source adapter. No official KS backer API
--     exists, so CSV is the reliable Phase 1 feeder.
--   * `orders` is origin-agnostic (kickstarter | shopify | manual) so the
--     dashboard, exports and status tracking are built once.
--   * Raw backer rows are preserved verbatim (raw_json) so a bad column
--     mapping never loses data — we just re-map and re-import idempotently.
--
-- Measurements (item #4) and the article-code lookup engine (item #5) get
-- their own migrations. Here, sub_orders carry a nullable measurement_id and
-- plain article-code text columns so this backbone is usable immediately and
-- those phases attach to it without rework.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ─── Customers ──────────────────────────────────────────────────────────────
create table if not exists customers (
  id                      uuid primary key default uuid_generate_v4(),
  email                   text not null,
  name                    text not null default '',
  phone                   text,
  shipping_address        jsonb,                 -- {line1,line2,city,state,postal,country}
  source                  text not null default 'manual'
                            check (source in ('kickstarter','shopify','manual')),
  kickstarter_backer_uid  text,                  -- KS backer number, dedupe key for KS source
  shopify_customer_id     text,
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- One customer per email (the natural identity across KS / Shopify / manual).
create unique index if not exists uniq_customers_email
  on customers (lower(email));
-- Fast dedupe by KS backer number during import.
create unique index if not exists uniq_customers_ks_backer
  on customers (kickstarter_backer_uid)
  where kickstarter_backer_uid is not null;

-- ─── Packages (pledge-tier definitions + item rules) ─────────────────────────
-- A package is a reusable tier definition. `garment_count` drives how many
-- sub-orders an order spawns; `item_rules` (jsonb) holds allowed/forbidden
-- fabrics, options and per-option limits so the configurator can enforce them
-- without a schema change every time the rules evolve.
create table if not exists packages (
  id                    uuid primary key default uuid_generate_v4(),
  code                  text not null unique,    -- e.g. 'KS-2JKT'
  name                  text not null,           -- e.g. '2-Jacket Backer Tier'
  description           text,
  garment_count         int not null default 1 check (garment_count >= 1),
  allowed_garment_types text[] not null default '{}',  -- e.g. {jacket}
  item_rules            jsonb not null default '{}'::jsonb,
  base_value            numeric(10,2) not null default 0,
  currency              text not null default 'EUR',
  is_active             boolean not null default true,
  sort_order            int not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ─── Kickstarter Imports (batch audit + idempotency) ─────────────────────────
create table if not exists kickstarter_imports (
  id              uuid primary key default uuid_generate_v4(),
  source          text not null default 'kickstarter_csv'
                    check (source in ('kickstarter_csv','backerkit','crowdox','manual')),
  filename        text,
  file_hash       text,                          -- sha256 of upload; skip exact re-uploads
  raw_row_count   int not null default 0,
  imported_count  int not null default 0,        -- new orders created
  updated_count   int not null default 0,        -- existing orders matched/updated
  skipped_count   int not null default 0,
  column_mapping  jsonb,                          -- the mapping used for this run
  status          text not null default 'completed'
                    check (status in ('pending','completed','failed')),
  error_message   text,
  created_by      uuid references admin_users(id),
  created_at      timestamptz not null default now()
);

-- ─── Kickstarter Backers (raw rows, kept verbatim) ───────────────────────────
create table if not exists kickstarter_backers (
  id                  uuid primary key default uuid_generate_v4(),
  import_id           uuid not null references kickstarter_imports(id) on delete cascade,
  backer_uid          text,                       -- KS backer number
  email               text,
  name                text,
  pledge_tier_label   text,                       -- raw tier/reward name from KS
  quantity            int not null default 1,      -- units of the reward ordered
  pledge_amount       numeric(10,2),
  currency            text,
  reward_title        text,
  addons_raw          text,
  raw_json            jsonb not null,             -- full original row, never lossy
  matched_customer_id uuid references customers(id) on delete set null,
  matched_order_id    uuid,                       -- FK added after orders table below
  created_at          timestamptz not null default now()
);

create index if not exists idx_ks_backers_import on kickstarter_backers(import_id);
create index if not exists idx_ks_backers_uid    on kickstarter_backers(backer_uid);

-- ─── Orders (origin-agnostic) ────────────────────────────────────────────────
create table if not exists orders (
  id                     uuid primary key default uuid_generate_v4(),
  order_number           text not null unique,    -- human friendly, e.g. 'KS-0001'
  customer_id            uuid not null references customers(id) on delete restrict,
  package_id             uuid references packages(id) on delete set null,
  origin                 text not null default 'manual'
                            check (origin in ('kickstarter','shopify','manual')),
  kickstarter_backer_id  uuid references kickstarter_backers(id) on delete set null,
  shopify_draft_order_id text,                     -- links to existing draft-order flow; nullable
  status                 text not null default 'pledge_received'
                            check (status in (
                              'pledge_received','configuring','confirmed',
                              'in_production','shipped','cancelled')),
  total_value            numeric(10,2) not null default 0,
  currency               text not null default 'EUR',
  notes                  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_orders_status   on orders(status);
create index if not exists idx_orders_origin   on orders(origin);

-- Now wire the backer → order back-reference.
alter table kickstarter_backers
  add constraint fk_ks_backers_order
  foreign key (matched_order_id) references orders(id) on delete set null;

-- ─── Sub-Orders (one garment instance per package slot) ──────────────────────
create table if not exists sub_orders (
  id                       uuid primary key default uuid_generate_v4(),
  order_id                 uuid not null references orders(id) on delete cascade,
  package_slot_index       int not null default 0,   -- 0..garment_count-1
  garment_type             text not null,            -- jacket | shirt | pants
  product_id               text,                     -- matches hardcoded product ids
  configurator_selections  jsonb not null default '{}'::jsonb,  -- fabric, styles, monogram, fit...
  measurement_id           uuid,                     -- FK added in measurement-system migration
  article_code_human       text,                     -- set by article-code engine (item #5)
  article_code_barcode     text,
  status                   text not null default 'pending'
                            check (status in (
                              'pending','configuring','confirmed',
                              'in_production','completed','cancelled')),
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (order_id, package_slot_index)
);

create index if not exists idx_sub_orders_order on sub_orders(order_id);

-- ─── Updated_at triggers (reuse the existing function from schema.sql) ────────
create trigger customers_updated_at  before update on customers
  for each row execute function update_updated_at();
create trigger packages_updated_at   before update on packages
  for each row execute function update_updated_at();
create trigger orders_updated_at     before update on orders
  for each row execute function update_updated_at();
create trigger sub_orders_updated_at before update on sub_orders
  for each row execute function update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Customer-facing reads/writes go through server routes using the service-role
-- key (bypasses RLS). RLS here protects the tables from the public anon key:
-- only admin_users may read/write directly. Two admin levels (admin/operator)
-- are enforced in the app layer via admin_users.role for now.
alter table customers            enable row level security;
alter table packages             enable row level security;
alter table kickstarter_imports  enable row level security;
alter table kickstarter_backers  enable row level security;
alter table orders               enable row level security;
alter table sub_orders           enable row level security;

-- Packages are publicly readable (configurator needs tier rules); the rest are admin-only.
create policy "Public read packages" on packages for select using (is_active = true);

do $$
declare t text;
begin
  foreach t in array array['customers','packages','kickstarter_imports',
                           'kickstarter_backers','orders','sub_orders']
  loop
    execute format($f$
      create policy "Admin all %1$s" on %1$s
        for all
        using (auth.uid() in (select auth_user_id from admin_users))
        with check (auth.uid() in (select auth_user_id from admin_users));
    $f$, t);
  end loop;
end $$;
