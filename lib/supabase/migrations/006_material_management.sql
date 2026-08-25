-- ============================================================================
-- Migration 006 — Material Management System (Phase 1 + Colour + Finishings)
-- ----------------------------------------------------------------------------
-- New tables:
--   finishing_master              — 20 standard finishings, central list
--   colour_master                 — 3-digit colour taxonomy, 22 families (010–229)
--   material_specifications      — central material database, auto-generated 6-digit ID
--   material_specification_finishings — join table for multi-select finishings
--
-- Schema changes:
--   product_skus — add our_colour_code, material_spec_id; relax old required cols
--   article_segment_values — allow segment_no up to 8 (unchanged check)
--
-- 22-digit SKU model:
--   Target(1) - Category(2) - FabricFamily(2) - FabricType(2) - Supplier(3)
--   - OurColour(3) - Reserved(3) - MaterialSpecID(6) = 22 digits
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Finishing Master ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finishing_master (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code       text NOT NULL UNIQUE,        -- 2-digit zero-padded: '01'..'20'
  label      text NOT NULL,
  sort_order int  NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER finishing_master_updated_at BEFORE UPDATE ON finishing_master
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed the 20 standard finishings from Dany's confirmed list
INSERT INTO finishing_master (code, label, sort_order) VALUES
  ('01', 'Water repellent',                  1),
  ('02', 'Easy care',                        2),
  ('03', 'Easy ironing',                     3),
  ('04', 'Non-iron',                         4),
  ('05', 'Wrinkle resistant / Crease resistant', 5),
  ('06', 'Anti-shrink / Shrink resistant',   6),
  ('07', 'Sanforized / Pre-shrunk',          7),
  ('08', 'Anti-pilling',                     8),
  ('09', 'Anti-static',                      9),
  ('10', 'Anti-bacterial / Antimicrobial',  10),
  ('11', 'Anti-odour / Odour control',      11),
  ('12', 'Moisture wicking',                12),
  ('13', 'Quick dry',                       13),
  ('14', 'UV protection / UPF',             14),
  ('15', 'Soft finish',                     15),
  ('16', 'Brushed',                         16),
  ('17', 'Peached / Peach finish',          17),
  ('18', 'Enzyme finish',                   18),
  ('19', 'Mercerized',                      19),
  ('20', 'Washed finish',                   20)
ON CONFLICT (code) DO NOTHING;

-- ─── Colour Master (22 families, ranges 010–229) ────────────────────────────
CREATE TABLE IF NOT EXISTS colour_master (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              text NOT NULL UNIQUE,   -- 3-digit zero-padded: '010'..'229'
  label             text NOT NULL,          -- e.g. 'Pure White', 'Navy', 'Midnight Blue'
  family_label      text NOT NULL,          -- e.g. 'White Tones', 'Navy Tones'
  family_range_start int NOT NULL,          -- e.g. 10, 140
  sort_order        int  NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER colour_master_updated_at BEFORE UPDATE ON colour_master
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed colour families with representative sub-colours
INSERT INTO colour_master (code, label, family_label, family_range_start, sort_order) VALUES
  -- White Tones (010–019)
  ('010', 'Pure White',       'White Tones',        10,  10),
  ('011', 'Optical White',    'White Tones',        10,  11),
  ('012', 'Snow White',       'White Tones',        10,  12),
  -- Ivory / Cream / Ecru (020–029)
  ('020', 'Ivory',            'Ivory / Cream / Ecru', 20,  20),
  ('021', 'Cream',            'Ivory / Cream / Ecru', 20,  21),
  ('022', 'Ecru',             'Ivory / Cream / Ecru', 20,  22),
  ('023', 'Natural',          'Ivory / Cream / Ecru', 20,  23),
  -- Beige / Sand / Stone (030–039)
  ('030', 'Beige',            'Beige / Sand / Stone', 30,  30),
  ('031', 'Sand',             'Beige / Sand / Stone', 30,  31),
  ('032', 'Stone',            'Beige / Sand / Stone', 30,  32),
  ('033', 'Oatmeal',          'Beige / Sand / Stone', 30,  33),
  -- Camel / Tan (040–049)
  ('040', 'Camel',            'Camel / Tan',         40,  40),
  ('041', 'Tan',              'Camel / Tan',         40,  41),
  ('042', 'Cognac Light',     'Camel / Tan',         40,  42),
  -- Brown Tones (050–059)
  ('050', 'Chocolate',        'Brown Tones',         50,  50),
  ('051', 'Chestnut',         'Brown Tones',         50,  51),
  ('052', 'Dark Brown',       'Brown Tones',         50,  52),
  -- Yellow Tones (060–069)
  ('060', 'Lemon',            'Yellow Tones',        60,  60),
  ('061', 'Mustard',          'Yellow Tones',        60,  61),
  ('062', 'Gold',             'Yellow Tones',        60,  62),
  -- Orange Tones (070–079)
  ('070', 'Orange',           'Orange Tones',        70,  70),
  ('071', 'Rust',             'Orange Tones',        70,  71),
  ('072', 'Burnt Orange',     'Orange Tones',        70,  72),
  -- Red Tones (080–089)
  ('080', 'Red',              'Red Tones',           80,  80),
  ('081', 'Scarlet',          'Red Tones',           80,  81),
  ('082', 'Tomato',           'Red Tones',           80,  82),
  -- Burgundy / Wine (090–099)
  ('090', 'Burgundy',         'Burgundy / Wine',     90,  90),
  ('091', 'Bordeaux',         'Burgundy / Wine',     90,  91),
  ('092', 'Wine',             'Burgundy / Wine',     90,  92),
  -- Pink / Rose (100–109)
  ('100', 'Pink',             'Pink / Rose',        100, 100),
  ('101', 'Rose',             'Pink / Rose',        100, 101),
  ('102', 'Blush',            'Pink / Rose',        100, 102),
  -- Purple / Lilac (110–119)
  ('110', 'Purple',           'Purple / Lilac',     110, 110),
  ('111', 'Violet',           'Purple / Lilac',     110, 111),
  ('112', 'Lilac',            'Purple / Lilac',     110, 112),
  -- Light Blue Tones (120–129)
  ('120', 'Sky Blue',         'Light Blue Tones',   120, 120),
  ('121', 'Powder Blue',      'Light Blue Tones',   120, 121),
  ('122', 'Ice Blue',         'Light Blue Tones',   120, 122),
  -- Medium / Bright Blue (130–139)
  ('130', 'Medium Blue',      'Medium / Bright Blue', 130, 130),
  ('131', 'Royal Blue',       'Medium / Bright Blue', 130, 131),
  ('132', 'Cobalt',           'Medium / Bright Blue', 130, 132),
  -- Navy Tones (140–149)
  ('140', 'Navy',             'Navy Tones',         140, 140),
  ('141', 'Marine',           'Navy Tones',         140, 141),
  ('142', 'Midnight Blue',    'Navy Tones',         140, 142),
  ('143', 'Night Blue',       'Navy Tones',         140, 143),
  ('144', 'Dark Navy',        'Navy Tones',         140, 144),
  -- Turquoise / Teal / Petrol (150–159)
  ('150', 'Turquoise',        'Turquoise / Teal / Petrol', 150, 150),
  ('151', 'Teal',             'Turquoise / Teal / Petrol', 150, 151),
  ('152', 'Petrol',           'Turquoise / Teal / Petrol', 150, 152),
  -- Green Tones (160–169)
  ('160', 'Green',            'Green Tones',        160, 160),
  ('161', 'Emerald',          'Green Tones',        160, 161),
  ('162', 'Forest Green',     'Green Tones',        160, 162),
  -- Olive / Khaki (170–179)
  ('170', 'Olive',            'Olive / Khaki',      170, 170),
  ('171', 'Army Green',       'Olive / Khaki',      170, 171),
  ('172', 'Khaki',            'Olive / Khaki',      170, 172),
  -- Grey Tones (180–189)
  ('180', 'Light Grey',       'Grey Tones',         180, 180),
  ('181', 'Silver Grey',      'Grey Tones',         180, 181),
  ('182', 'Medium Grey',      'Grey Tones',         180, 182),
  -- Charcoal / Anthracite (190–199)
  ('190', 'Charcoal',         'Charcoal / Anthracite', 190, 190),
  ('191', 'Anthracite',       'Charcoal / Anthracite', 190, 191),
  ('192', 'Graphite',         'Charcoal / Anthracite', 190, 192),
  -- Black (200–209)
  ('200', 'Black',            'Black',              200, 200),
  ('201', 'Jet Black',        'Black',              200, 201),
  -- Metallic (210–219)
  ('210', 'Silver',           'Metallic',           210, 210),
  ('211', 'Gold',             'Metallic',           210, 211),
  ('212', 'Bronze',           'Metallic',           210, 212),
  -- Multicolour / Print (220–229)
  ('220', 'Multicolour',      'Multicolour / Print', 220, 220),
  ('221', 'Mixed Print',      'Multicolour / Print', 220, 221)
ON CONFLICT (code) DO NOTHING;

-- ─── Material Specifications ─────────────────────────────────────────────────
-- Auto-incrementing 6-digit ID via a Postgres sequence
CREATE SEQUENCE IF NOT EXISTS material_spec_id_seq START 1;

CREATE TABLE IF NOT EXISTS material_specifications (
  id                     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_id                text NOT NULL UNIQUE DEFAULT LPAD(nextval('material_spec_id_seq')::text, 6, '0'),
  supplier_code          text,                  -- 3-digit supplier code from segment values
  supplier_name          text,                  -- denormalized for display
  supplier_article_number text,                 -- supplier's quality/article number
  supplier_colour_number text,                  -- supplier's exact colour code
  supplier_colour_name   text,                  -- supplier's exact colour name
  our_colour_code        text,                  -- 3-digit code from colour_master
  fabric_type            text,                  -- e.g. 'Woven Solid', 'Knit Printed'
  product_specification  text,                  -- free text description
  fabric_composition     text,                  -- e.g. '100% Cotton'
  fabric_width           text,                  -- e.g. '150 cm'
  fabric_weight_gsm      text,                  -- e.g. '120'
  fabric_construction    text,                  -- e.g. 'Plain weave 60x60'
  notes                  text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matspec_supplier ON material_specifications (supplier_code);
CREATE INDEX IF NOT EXISTS idx_matspec_colour ON material_specifications (our_colour_code);
CREATE INDEX IF NOT EXISTS idx_matspec_spec_id ON material_specifications (spec_id);

CREATE TRIGGER material_specifications_updated_at BEFORE UPDATE ON material_specifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Material Specification ↔ Finishing (many-to-many) ───────────────────────
CREATE TABLE IF NOT EXISTS material_specification_finishings (
  material_spec_id uuid NOT NULL REFERENCES material_specifications(id) ON DELETE CASCADE,
  finishing_id     uuid NOT NULL REFERENCES finishing_master(id) ON DELETE CASCADE,
  PRIMARY KEY (material_spec_id, finishing_id)
);

-- ─── product_skus — add new columns for 22-digit model ──────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_skus' AND column_name = 'our_colour_code') THEN
    ALTER TABLE product_skus ADD COLUMN our_colour_code text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_skus' AND column_name = 'material_spec_id') THEN
    ALTER TABLE product_skus ADD COLUMN material_spec_id text;
  END IF;
  -- Make old columns nullable (they are no longer in the new SKU model)
  ALTER TABLE product_skus ALTER COLUMN supplier_article_code DROP NOT NULL;
  ALTER TABLE product_skus ALTER COLUMN specs_code DROP NOT NULL;
END $$;

-- ─── RLS policies ────────────────────────────────────────────────────────────
ALTER TABLE finishing_master              ENABLE ROW LEVEL SECURITY;
ALTER TABLE colour_master                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_specifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_specification_finishings ENABLE ROW LEVEL SECURITY;

-- Public read for all catalog tables
CREATE POLICY "Public read finishing_master"              ON finishing_master              FOR SELECT USING (true);
CREATE POLICY "Public read colour_master"                 ON colour_master                 FOR SELECT USING (true);
CREATE POLICY "Public read material_specifications"       ON material_specifications       FOR SELECT USING (true);
CREATE POLICY "Public read material_specification_finishings" ON material_specification_finishings FOR SELECT USING (true);

-- Admin-only write access
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['finishing_master','colour_master','material_specifications','material_specification_finishings']
  LOOP
    EXECUTE format($f$
      CREATE POLICY "Admin all %1$s" ON %1$s
        FOR ALL
        USING (auth.uid() IN (SELECT auth_user_id FROM admin_users))
        WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM admin_users));
    $f$, t);
  END LOOP;
END $$;
