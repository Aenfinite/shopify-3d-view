-- ============================================================================
-- Migration 006 — Material Management System (Phase 1 + Colour + Finishings)
-- ----------------------------------------------------------------------------
-- Creates:
--   * finishing_master              — 20 standard finishings, central list
--   * colour_master                 — 3-digit colour taxonomy, 22 families (010–229)
--   * material_specifications      — central material database, auto-generated 6-digit ID
--   * material_specification_finishings — join table for multi-select finishings
--   * article_segment_values       — 8-segment lookup table (if not exists)
--   * product_skus                 — 22-digit SKU registry (if not exists or alters)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Article Segment Values (Lookups for Segments 1-5, 7) ───────────────────
CREATE TABLE IF NOT EXISTS article_segment_values (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  segment_no    int  NOT NULL CHECK (segment_no BETWEEN 1 AND 8),
  code          text NOT NULL,                 -- zero-padded digits matching segment width
  label         text NOT NULL,
  supplier_code text,
  sort_order    int  NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (segment_no, code, supplier_code)
);
CREATE INDEX IF NOT EXISTS idx_asv_segment ON article_segment_values (segment_no);

DROP TRIGGER IF EXISTS article_segment_values_updated_at ON article_segment_values;
CREATE TRIGGER article_segment_values_updated_at BEFORE UPDATE ON article_segment_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Finishing Master ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finishing_master (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code       text NOT NULL UNIQUE,        -- 2-digit: '01'..'20'
  label      text NOT NULL,
  sort_order int  NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS finishing_master_updated_at ON finishing_master;
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
  code              text NOT NULL UNIQUE,   -- 3-digit: '010'..'229'
  label             text NOT NULL,
  family_label      text NOT NULL,
  family_range_start int NOT NULL,
  sort_order        int  NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS colour_master_updated_at ON colour_master;
CREATE TRIGGER colour_master_updated_at BEFORE UPDATE ON colour_master
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed 22 colour families with sub-colours
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
CREATE SEQUENCE IF NOT EXISTS material_spec_id_seq START 1;

CREATE TABLE IF NOT EXISTS material_specifications (
  id                     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_id                text NOT NULL UNIQUE DEFAULT LPAD(nextval('material_spec_id_seq')::text, 6, '0'),
  supplier_code          text,
  supplier_name          text,
  supplier_article_number text,
  supplier_colour_number text,
  supplier_colour_name   text,
  our_colour_code        text,
  fabric_type            text,
  product_specification  text,
  fabric_composition     text,
  fabric_width           text,
  fabric_weight_gsm      text,
  fabric_construction    text,
  notes                  text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matspec_supplier ON material_specifications (supplier_code);
CREATE INDEX IF NOT EXISTS idx_matspec_colour ON material_specifications (our_colour_code);
CREATE INDEX IF NOT EXISTS idx_matspec_spec_id ON material_specifications (spec_id);

DROP TRIGGER IF EXISTS material_specifications_updated_at ON material_specifications;
CREATE TRIGGER material_specifications_updated_at BEFORE UPDATE ON material_specifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Material Specification ↔ Finishing (many-to-many) ───────────────────────
CREATE TABLE IF NOT EXISTS material_specification_finishings (
  material_spec_id uuid NOT NULL REFERENCES material_specifications(id) ON DELETE CASCADE,
  finishing_id     uuid NOT NULL REFERENCES finishing_master(id) ON DELETE CASCADE,
  PRIMARY KEY (material_spec_id, finishing_id)
);

-- ─── Product SKU Registry (22-Digit Model) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS product_skus (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku_key              text NOT NULL UNIQUE,
  product_category     text NOT NULL,
  color                text,
  label                text,
  fabric_composition   text,
  target_group_code    text NOT NULL,
  product_category_code text NOT NULL,
  fabric_family_code   text NOT NULL,
  fabric_type_code     text NOT NULL,
  supplier_code        text NOT NULL,
  supplier_article_code text,
  specs_code           text,
  our_colour_code      text,
  reserved_code        text DEFAULT '000',
  material_spec_id     text,
  article_human        text NOT NULL,
  article_machine      text NOT NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_skus_category ON product_skus (product_category);

DROP TRIGGER IF EXISTS product_skus_updated_at ON product_skus;
CREATE TRIGGER product_skus_updated_at BEFORE UPDATE ON product_skus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Ensure all new columns exist if product_skus already existed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_skus') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_skus' AND column_name = 'our_colour_code') THEN
      ALTER TABLE product_skus ADD COLUMN our_colour_code text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_skus' AND column_name = 'material_spec_id') THEN
      ALTER TABLE product_skus ADD COLUMN material_spec_id text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_skus' AND column_name = 'reserved_code') THEN
      ALTER TABLE product_skus ADD COLUMN reserved_code text DEFAULT '000';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_skus' AND column_name = 'supplier_article_code') THEN
      ALTER TABLE product_skus ALTER COLUMN supplier_article_code DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_skus' AND column_name = 'specs_code') THEN
      ALTER TABLE product_skus ALTER COLUMN specs_code DROP NOT NULL;
    END IF;
  END IF;
END $$;

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE article_segment_values        ENABLE ROW LEVEL SECURITY;
ALTER TABLE finishing_master              ENABLE ROW LEVEL SECURITY;
ALTER TABLE colour_master                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_specifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_specification_finishings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_skus                  ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read article_segment_values" ON article_segment_values;
  DROP POLICY IF EXISTS "Public read finishing_master" ON finishing_master;
  DROP POLICY IF EXISTS "Public read colour_master" ON colour_master;
  DROP POLICY IF EXISTS "Public read material_specifications" ON material_specifications;
  DROP POLICY IF EXISTS "Public read material_specification_finishings" ON material_specification_finishings;
  DROP POLICY IF EXISTS "Public read product_skus" ON product_skus;
END $$;

CREATE POLICY "Public read article_segment_values"        ON article_segment_values        FOR SELECT USING (true);
CREATE POLICY "Public read finishing_master"              ON finishing_master              FOR SELECT USING (true);
CREATE POLICY "Public read colour_master"                 ON colour_master                 FOR SELECT USING (true);
CREATE POLICY "Public read material_specifications"       ON material_specifications       FOR SELECT USING (true);
CREATE POLICY "Public read material_specification_finishings" ON material_specification_finishings FOR SELECT USING (true);
CREATE POLICY "Public read product_skus"                  ON product_skus                  FOR SELECT USING (true);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['article_segment_values', 'finishing_master', 'colour_master', 'material_specifications', 'material_specification_finishings', 'product_skus']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admin all %1$s" ON %1$s', t);
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
      EXECUTE format($f$
        CREATE POLICY "Admin all %1$s" ON %1$s
          FOR ALL
          USING (auth.uid() IN (SELECT auth_user_id FROM admin_users))
          WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM admin_users));
      $f$, t);
    END IF;
  END LOOP;
END $$;
