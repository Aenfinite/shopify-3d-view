-- ==========================================
-- Supabase Schema for Fabric Management System
-- Only fabrics + admin auth — products & customization
-- options stay as hardcoded sample data in the app.
-- ==========================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Fabrics (managed via admin panel) ──────────────────────
create table if not exists fabrics (
  id uuid primary key default uuid_generate_v4(),
  product_id text not null,               -- matches hardcoded product ids (shirt-001, jacket-001, etc.)
  name text not null,
  fabric_type text not null check (fabric_type in ('cotton', 'linen', 'polyester')),
  input_mode text not null check (input_mode in ('swatch', 'hex', 'upload')) default 'swatch',
  color_hex text,
  image_url text,
  thumbnail_url text,
  price numeric(10,2) not null default 0,
  is_printed boolean not null default false,
  pbr_settings jsonb not null default '{
    "normal_scale": 0.20,
    "roughness": 0.60,
    "bump_scale": 0.15,
    "sheen": 0.15,
    "repeat_x": 4,
    "repeat_y": 4,
    "darkness": 0
  }'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Admin Users ────────────────────────────────────────────
create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null default '',
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- ─── Indexes ────────────────────────────────────────────────
create index if not exists idx_fabrics_product on fabrics(product_id);
create index if not exists idx_fabrics_type on fabrics(fabric_type);

-- ─── Row Level Security ─────────────────────────────────────
alter table fabrics enable row level security;
alter table admin_users enable row level security;

-- Public read access for fabrics
create policy "Public read fabrics" on fabrics for select using (true);

-- Admin write access (authenticated users who are in admin_users)
create policy "Admin insert fabrics" on fabrics for insert
  with check (auth.uid() in (select auth_user_id from admin_users));
create policy "Admin update fabrics" on fabrics for update
  using (auth.uid() in (select auth_user_id from admin_users));
create policy "Admin delete fabrics" on fabrics for delete
  using (auth.uid() in (select auth_user_id from admin_users));

create policy "Admin read admin_users" on admin_users for select
  using (auth.uid() = auth_user_id);

-- ─── Updated_at trigger ─────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger fabrics_updated_at before update on fabrics
  for each row execute function update_updated_at();

-- ─── Storage bucket for fabric uploads ──────────────────────
insert into storage.buckets (id, name, public) values ('fabrics', 'fabrics', true)
on conflict (id) do nothing;

create policy "Public read fabric files" on storage.objects for select
  using (bucket_id = 'fabrics');
create policy "Admin upload fabric files" on storage.objects for insert
  with check (bucket_id = 'fabrics' and auth.uid() in (select auth_user_id from admin_users));
create policy "Admin delete fabric files" on storage.objects for delete
  using (bucket_id = 'fabrics' and auth.uid() in (select auth_user_id from admin_users));
