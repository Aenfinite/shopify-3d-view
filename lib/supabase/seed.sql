-- ==========================================
-- Seed Data: Fabrics only
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ==========================================

-- ─── Shirt fabrics (cotton) ─────────────────────────────────
INSERT INTO fabrics (product_id, name, fabric_type, input_mode, image_url, thumbnail_url, price, sort_order, pbr_settings) VALUES
  ('shirt-001', 'White Oxford', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-1 white.jpeg', '/fabrics/FabricsShirt/2215-1 white.jpeg', 0, 0, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Sand', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-2 sand.jpeg', '/fabrics/FabricsShirt/2215-2 sand.jpeg', 0, 1, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Coral', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-3 coral.png', '/fabrics/FabricsShirt/2215-3 coral.png', 5, 2, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Ice Blue', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-4 light oxford blue.png', '/fabrics/FabricsShirt/2215-4 light oxford blue.png', 0, 3, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Sage', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-5 sage.png', '/fabrics/FabricsShirt/2215-5 sage.png', 5, 4, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Ink', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-8 ink.png', '/fabrics/FabricsShirt/2215-8 ink.png', 5, 5, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Dune', 'cotton', 'upload', '/fabrics/FabricsShirt/2215 dune.png', '/fabrics/FabricsShirt/2215 dune.png', 0, 6, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Dust Blue', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-17 powder blue.png', '/fabrics/FabricsShirt/2215-17 powder blue.png', 0, 7, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Mauve', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-18 mauve.png', '/fabrics/FabricsShirt/2215-18 mauve.png', 5, 8, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Dust', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-19 stone.png', '/fabrics/FabricsShirt/2215-19 stone.png', 0, 9, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Slate', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-22 slate.png', '/fabrics/FabricsShirt/2215-22 slate.png', 5, 10, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Steel', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-7 teal.png', '/fabrics/FabricsShirt/2215-7 teal.png', 5, 11, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Honey', 'cotton', 'upload', '/fabrics/FabricsShirt/2215 honey.png', '/fabrics/FabricsShirt/2215 honey.png', 5, 12, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Amber', 'cotton', 'upload', '/fabrics/FabricsShirt/2215-23 amber.png', '/fabrics/FabricsShirt/2215-23 amber.png', 5, 13, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('shirt-001', 'Navy', 'cotton', 'upload', '/fabrics/FabricsShirt/24.png', '/fabrics/FabricsShirt/24.png', 5, 14, '{"normal_scale":0.20,"roughness":0.60,"bump_scale":0.15,"sheen":0.15,"repeat_x":4,"repeat_y":4,"darkness":0}');

-- ─── Jacket fabrics (linen) ─────────────────────────────────
INSERT INTO fabrics (product_id, name, fabric_type, input_mode, image_url, thumbnail_url, price, sort_order, pbr_settings) VALUES
  ('jacket-001', 'Jet Black', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.01.jpg', '/fabrics/FabricsJacket/02.3716.01.jpg', 15, 0, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Midnight Plum', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.05.jpg', '/fabrics/FabricsJacket/02.3716.05.jpg', 15, 1, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Urban Grey', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.07.jpg', '/fabrics/FabricsJacket/02.3716.07.jpg', 15, 2, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Indigo Night', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.13.jpg', '/fabrics/FabricsJacket/02.3716.13.jpg', 15, 3, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Royal Navy', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.15.jpg', '/fabrics/FabricsJacket/02.3716.15.jpg', 15, 4, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Warm Almond', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.17.jpg', '/fabrics/FabricsJacket/02.3716.17.jpg', 15, 5, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Mocha Taupe', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.19.jpg', '/fabrics/FabricsJacket/02.3716.19.jpg', 15, 6, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Coffee Roast', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.20.jpg', '/fabrics/FabricsJacket/02.3716.20.jpg', 15, 7, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Blue Graphite', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.26.jpg', '/fabrics/FabricsJacket/02.3716.26.jpg', 15, 8, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Coffee Bean', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.28.jpg', '/fabrics/FabricsJacket/02.3716.28.jpg', 15, 9, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Carbon Grey', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.31.jpg', '/fabrics/FabricsJacket/02.3716.31.jpg', 15, 10, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Golden Khaki', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.32.jpg', '/fabrics/FabricsJacket/02.3716.32.jpg', 15, 11, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Cinnamon Rust', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.34.jpg', '/fabrics/FabricsJacket/02.3716.34.jpg', 15, 12, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Graphite Brown', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.39.jpg', '/fabrics/FabricsJacket/02.3716.39.jpg', 15, 13, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Dusty Olive', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.41.jpg', '/fabrics/FabricsJacket/02.3716.41.jpg', 15, 14, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Shadow Black', 'linen', 'upload', '/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg', '/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg', 15, 15, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Deep Navy', 'linen', 'upload', '/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg', '/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg', 15, 16, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Midnight Blue', 'linen', 'upload', '/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg', '/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg', 15, 17, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Slate Grey', 'linen', 'upload', '/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg', '/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg', 15, 18, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('jacket-001', 'Ocean Blue', 'linen', 'upload', '/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg', '/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg', 15, 19, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}');

-- ─── Pants fabrics (reuses jacket fabric images) ────────────
INSERT INTO fabrics (product_id, name, fabric_type, input_mode, image_url, thumbnail_url, price, sort_order, pbr_settings) VALUES
  ('pants-001', 'Jet Black', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.01.jpg', '/fabrics/FabricsJacket/02.3716.01.jpg', 15, 0, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('pants-001', 'Royal Navy', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.15.jpg', '/fabrics/FabricsJacket/02.3716.15.jpg', 15, 1, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('pants-001', 'Urban Grey', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.07.jpg', '/fabrics/FabricsJacket/02.3716.07.jpg', 15, 2, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('pants-001', 'Carbon Grey', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.31.jpg', '/fabrics/FabricsJacket/02.3716.31.jpg', 15, 3, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}'),
  ('pants-001', 'Coffee Roast', 'linen', 'upload', '/fabrics/FabricsJacket/02.3716.20.jpg', '/fabrics/FabricsJacket/02.3716.20.jpg', 15, 4, '{"normal_scale":0.38,"roughness":0.55,"bump_scale":0.25,"sheen":0.20,"repeat_x":4,"repeat_y":4,"darkness":0}');

-- ─── Admin User ─────────────────────────────────────────────
-- Credentials: admin@example.com / Admin123!
-- Change the password after first login via Supabase dashboard.

create extension if not exists "pgcrypto";

do $$
declare
  new_user_id uuid := gen_random_uuid();
begin
  -- Create the Supabase Auth user
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  ) values (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  )
  on conflict (email) do nothing;

  -- Link to admin_users table
  insert into admin_users (auth_user_id, email, name, role)
  values (new_user_id, 'admin@example.com', 'Admin', 'admin')
  on conflict (email) do nothing;
end $$;
