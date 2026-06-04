-- ============================================================================
-- Migration 004 — SAFE CHINO Kickstarter seed
-- ----------------------------------------------------------------------------
-- Seeds the article-code segment values, the SKU registry (chino ×8 colours,
-- shirt ×2, belt ×2), the 7 Early Bird packages and their item composition.
-- Article human/machine strings are computed from the segment codes so they
-- always agree with the engine. Idempotent on natural keys.
--
-- Reference example (Midnight Navy chino): 01.02.07.01.021.02451.04
--   → machine 010207010210245104
-- ============================================================================

-- ─── Segment value lookups ───────────────────────────────────────────────────
insert into article_segment_values (segment_no, code, label, supplier_code, sort_order) values
  -- 1 · target group
  (1, '01', 'SAFE Kickstarter Menswear', null, 0),
  -- 2 · product category
  (2, '02', 'Chino', null, 0),
  (2, '03', 'Shirt', null, 1),
  (2, '04', 'Belt',  null, 2),
  -- 3 · fabric family
  (3, '07', 'Chino blend (PES/Viscose)', null, 0),
  (3, '08', 'Shirt cotton',              null, 1),
  (3, '09', 'Belt leather',              null, 2),
  -- 4 · fabric type (per colour / variant)
  (4, '01', 'Variant 01', null, 0),
  (4, '02', 'Variant 02', null, 1),
  (4, '03', 'Variant 03', null, 2),
  (4, '04', 'Variant 04', null, 3),
  (4, '05', 'Variant 05', null, 4),
  (4, '06', 'Variant 06', null, 5),
  (4, '07', 'Variant 07', null, 6),
  (4, '08', 'Variant 08', null, 7),
  -- 5 · supplier
  (5, '021', 'Primary Supplier', null, 0),
  -- 6 · supplier article no (scoped to supplier 021)
  (6, '02451', 'Chino · Midnight Navy',   '021', 0),
  (6, '02452', 'Chino · Urban Slate',     '021', 1),
  (6, '02453', 'Chino · Smoked Charcoal', '021', 2),
  (6, '02454', 'Chino · Dark Wallnut',    '021', 3),
  (6, '02455', 'Chino · Muted Olive',     '021', 4),
  (6, '02456', 'Chino · Tobacco Camel',   '021', 5),
  (6, '02457', 'Chino · Storm Grey',      '021', 6),
  (6, '02458', 'Chino · Stone Taupe',     '021', 7),
  (6, '03101', 'Shirt · White',           '021', 8),
  (6, '03102', 'Shirt · Light Blue',      '021', 9),
  (6, '04201', 'Belt · Brown',            '021', 10),
  (6, '04202', 'Belt · Black',            '021', 11),
  -- 7 · specs / finishings
  (7, '04', 'Standard finishing', null, 0)
on conflict (segment_no, code, supplier_code) do nothing;

-- ─── Product SKUs (article code per product + colour) ────────────────────────
-- human  = code1.code2.code3.code4.code5.code6.code7   (reserved omitted)
-- machine = the same codes concatenated, no dots.
insert into product_skus (
  sku_key, product_category, color, label, fabric_composition,
  target_group_code, product_category_code, fabric_family_code, fabric_type_code,
  supplier_code, supplier_article_code, specs_code,
  article_human, article_machine
)
select
  sku_key, product_category, color, label, fabric_composition,
  t, p, ff, ft, s, an, sp,
  t||'.'||p||'.'||ff||'.'||ft||'.'||s||'.'||an||'.'||sp                 as article_human,
  t||p||ff||ft||s||an||sp                                               as article_machine
from (values
  ('chino:midnight-navy',   'chino', 'midnight-navy',   'SAFE CHINO — Midnight Navy',   '70% PES / 30% Viscose', '01','02','07','01','021','02451','04'),
  ('chino:urban-slate',     'chino', 'urban-slate',     'SAFE CHINO — Urban Slate',     '70% PES / 30% Viscose', '01','02','07','02','021','02452','04'),
  ('chino:smoked-charcoal', 'chino', 'smoked-charcoal', 'SAFE CHINO — Smoked Charcoal', '70% PES / 30% Viscose', '01','02','07','03','021','02453','04'),
  ('chino:dark-wallnut',    'chino', 'dark-wallnut',    'SAFE CHINO — Dark Wallnut',    '70% PES / 30% Viscose', '01','02','07','04','021','02454','04'),
  ('chino:muted-olive',     'chino', 'muted-olive',     'SAFE CHINO — Muted Olive',     '70% PES / 30% Viscose', '01','02','07','05','021','02455','04'),
  ('chino:tobacco-camel',   'chino', 'tobacco-camel',   'SAFE CHINO — Tobacco Camel',   '70% PES / 30% Viscose', '01','02','07','06','021','02456','04'),
  ('chino:storm-grey',      'chino', 'storm-grey',      'SAFE CHINO — Storm Grey',      '70% PES / 30% Viscose', '01','02','07','07','021','02457','04'),
  ('chino:stone-taupe',     'chino', 'stone-taupe',     'SAFE CHINO — Stone Taupe',     '70% PES / 30% Viscose', '01','02','07','08','021','02458','04'),
  ('shirt:white',           'shirt', 'white',           'SAFE Shirt — White',           '100% Cotton',           '01','03','08','01','021','03101','04'),
  ('shirt:light-blue',      'shirt', 'light-blue',      'SAFE Shirt — Light Blue',      '100% Cotton',           '01','03','08','02','021','03102','04'),
  ('belt:brown',            'belt',  'brown',           'SAFE Belt — Brown',            'Full-grain Leather',    '01','04','09','01','021','04201','04'),
  ('belt:black',            'belt',  'black',           'SAFE Belt — Black',            'Full-grain Leather',    '01','04','09','02','021','04202','04')
) as v(sku_key, product_category, color, label, fabric_composition, t, p, ff, ft, s, an, sp)
on conflict (sku_key) do nothing;

-- ─── Packages (the 7 Early Bird sets) ────────────────────────────────────────
insert into packages (code, name, description, garment_count, allowed_garment_types, base_value, currency, is_active, sort_order) values
  ('SC-SET1', 'Early Bird Safe Chino',        '1 Chino',                              1, '{chino}',             0, 'EUR', true, 1),
  ('SC-SET2', 'Early Bird Safe Chino Set',    '1 Chino + 1 Belt',                     2, '{chino,belt}',        0, 'EUR', true, 2),
  ('SC-SET3', 'Early Bird Combo Pack',        '1 Chino + 1 Shirt + 1 Belt',           3, '{chino,shirt,belt}',  0, 'EUR', true, 3),
  ('SC-SET4', 'Early Bird Explorer Pack',     '1 Chino + 1 Shirt (white) + 1 Belt',   3, '{chino,shirt,belt}',  0, 'EUR', true, 4),
  ('SC-SET5', 'Early Bird Jetsetter Summer',  '2 Chinos + 2 SS Shirts + 2 Belts',     6, '{chino,shirt,belt}',  0, 'EUR', true, 5),
  ('SC-SET6', 'Early Bird Jetsetter Bundle',  '2 Chinos + 2 LS Shirts + 2 Belts',     6, '{chino,shirt,belt}',  0, 'EUR', true, 6),
  ('SC-SET7', 'Early Bird Jetsetter Plus',    '2 Chinos + 2 LS + 1 SS Shirt + 2 Belts', 7, '{chino,shirt,belt}', 0, 'EUR', true, 7)
on conflict (code) do nothing;

-- ─── Package items (composition + colour/sleeve rules) ───────────────────────
-- Inserted relative to each package's id; skipped if the package already has items.
do $$
declare pid uuid;
begin
  -- SET1: 1 chino
  select id into pid from packages where code='SC-SET1';
  if pid is not null and not exists (select 1 from package_items where package_id=pid) then
    insert into package_items (package_id, item_type, quantity, allowed_colors, constraints, sort_order)
    values (pid,'chino',1,'{}','{}'::jsonb,0);
  end if;

  -- SET2: 1 chino + 1 belt
  select id into pid from packages where code='SC-SET2';
  if pid is not null and not exists (select 1 from package_items where package_id=pid) then
    insert into package_items (package_id, item_type, quantity, allowed_colors, constraints, sort_order) values
      (pid,'chino',1,'{}','{}'::jsonb,0),
      (pid,'belt', 1,'{brown,black}','{}'::jsonb,1);
  end if;

  -- SET3: 1 chino + 1 shirt + 1 belt
  select id into pid from packages where code='SC-SET3';
  if pid is not null and not exists (select 1 from package_items where package_id=pid) then
    insert into package_items (package_id, item_type, quantity, allowed_colors, constraints, sort_order) values
      (pid,'chino',1,'{}','{}'::jsonb,0),
      (pid,'shirt',1,'{white,light-blue}','{}'::jsonb,1),
      (pid,'belt', 1,'{brown,black}','{}'::jsonb,2);
  end if;

  -- SET4: 1 chino + 1 shirt (WHITE ONLY) + 1 belt
  select id into pid from packages where code='SC-SET4';
  if pid is not null and not exists (select 1 from package_items where package_id=pid) then
    insert into package_items (package_id, item_type, quantity, allowed_colors, constraints, sort_order) values
      (pid,'chino',1,'{}','{}'::jsonb,0),
      (pid,'shirt',1,'{white}','{"shirt_color":"white-only"}'::jsonb,1),
      (pid,'belt', 1,'{brown,black}','{}'::jsonb,2);
  end if;

  -- SET5: 2 chinos + 2 SS shirts + 2 belts
  select id into pid from packages where code='SC-SET5';
  if pid is not null and not exists (select 1 from package_items where package_id=pid) then
    insert into package_items (package_id, item_type, quantity, allowed_colors, constraints, sort_order) values
      (pid,'chino',2,'{}','{}'::jsonb,0),
      (pid,'shirt',2,'{white,light-blue}','{"sleeve":"short"}'::jsonb,1),
      (pid,'belt', 2,'{brown,black}','{}'::jsonb,2);
  end if;

  -- SET6: 2 chinos + 2 LS shirts + 2 belts
  select id into pid from packages where code='SC-SET6';
  if pid is not null and not exists (select 1 from package_items where package_id=pid) then
    insert into package_items (package_id, item_type, quantity, allowed_colors, constraints, sort_order) values
      (pid,'chino',2,'{}','{}'::jsonb,0),
      (pid,'shirt',2,'{white,light-blue}','{"sleeve":"long"}'::jsonb,1),
      (pid,'belt', 2,'{brown,black}','{}'::jsonb,2);
  end if;

  -- SET7: 2 chinos + 2 LS + 1 SS shirt + 2 belts
  select id into pid from packages where code='SC-SET7';
  if pid is not null and not exists (select 1 from package_items where package_id=pid) then
    insert into package_items (package_id, item_type, quantity, allowed_colors, constraints, sort_order) values
      (pid,'chino',2,'{}','{}'::jsonb,0),
      (pid,'shirt',2,'{white,light-blue}','{"sleeve":"long"}'::jsonb,1),
      (pid,'shirt',1,'{white,light-blue}','{"sleeve":"short"}'::jsonb,2),
      (pid,'belt', 2,'{brown,black}','{}'::jsonb,3);
  end if;
end $$;
