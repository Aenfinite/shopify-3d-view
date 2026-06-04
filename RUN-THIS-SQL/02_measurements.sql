-- ============================================================================
-- Migration 002 — Measurement System (raw → production + version locking)
-- ----------------------------------------------------------------------------
-- SAFE CHINO Phase 1, Layer 4.
--   * Per-garment versioned measurement sets.
--   * raw values (cm) + per-field allowance → frozen production values.
--   * Version locking: a confirmed version is frozen with a timestamp. A later
--     customer edit creates a NEW version; the locked one stays locked until an
--     admin unlocks it. Locked versions are never auto-deleted.
--   * Wires sub_orders.measurement_id → measurements (FK left dangling by 001),
--     and adds the SAFE CHINO sub-order fields (item_type, color, sub_order_ref).
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ─── Measurements (versioned, lockable) ──────────────────────────────────────
create table if not exists measurements (
  id                uuid primary key default uuid_generate_v4(),
  customer_id       uuid not null references customers(id) on delete cascade,
  sub_order_id      uuid,                                  -- the garment item this set is for (nullable)
  garment_type      text not null,                         -- chino | shirt
  raw_values        jsonb not null default '{}'::jsonb,    -- {waist:84, hip:100, ...} as entered (cm)
  allowances        jsonb not null default '{}'::jsonb,    -- {waist:0.5, ...} ease per field
  production_values jsonb not null default '{}'::jsonb,    -- frozen raw+allowance (set on save/lock)
  unit              text not null default 'cm' check (unit in ('cm','in')),
  version           int  not null default 1,
  locked            boolean not null default false,
  locked_at         timestamptz,
  locked_by         uuid references admin_users(id) on delete set null,
  notes             text,
  created_by        uuid references admin_users(id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists idx_measurements_customer
  on measurements (customer_id, garment_type, version desc);
create index if not exists idx_measurements_sub_order on measurements (sub_order_id);

-- Wire the sub_orders back-reference left dangling by migration 001.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'fk_sub_orders_measurement') then
    alter table sub_orders
      add constraint fk_sub_orders_measurement
      foreign key (measurement_id) references measurements(id) on delete set null;
  end if;
end $$;

-- ─── SAFE CHINO sub-order fields ─────────────────────────────────────────────
alter table sub_orders add column if not exists item_type      text;   -- chino | shirt | belt
alter table sub_orders add column if not exists color          text;   -- chosen colour value
alter table sub_orders add column if not exists sub_order_ref  text;   -- e.g. 'SC-00123 (1-3)'
alter table sub_orders add column if not exists package_item_id uuid;  -- which package slot definition

-- Master-order Kickstarter reference + packing note (Layer 5).
alter table orders add column if not exists kickstarter_ref text;      -- e.g. 'SC-00123'
alter table orders add column if not exists packing_note    text;      -- e.g. 'All items in one parcel'

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table measurements enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename='measurements' and policyname='Admin all measurements') then
    create policy "Admin all measurements" on measurements
      for all
      using (auth.uid() in (select auth_user_id from admin_users))
      with check (auth.uid() in (select auth_user_id from admin_users));
  end if;
end $$;
