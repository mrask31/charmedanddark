-- Create product_variants table for per-variant color, size, price, and image support
-- Applied: 2026-03-19 via Supabase MCP

CREATE TABLE product_variants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type    TEXT NOT NULL,          -- e.g. 'color', 'size'
  variant_value   TEXT NOT NULL,          -- e.g. 'Gold', 'Silver', 'Queen'
  price_override  NUMERIC(10, 2),         -- null = use parent product price
  stock_quantity  INT NOT NULL DEFAULT 0,
  image_url       TEXT,                   -- null = use parent product images
  sku             TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  is_available    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by product
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- Index for ordered display
CREATE INDEX idx_product_variants_sort ON product_variants(product_id, sort_order);

-- RLS: public read, authenticated write
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON product_variants
  FOR SELECT USING (true);

-- Mark variant-parent products
UPDATE products SET is_variant_parent = TRUE
WHERE id IN (
  'b13d9258-d74d-4f77-92b4-c9e1d8b2ceb3',  -- Coffin Stud Earrings
  '619d79b6-5060-46b1-9083-bd64bedbb374',  -- Heart Vase
  '0996aa00-e653-4c6e-b6e7-bc8e0bd75ab6'   -- Satin Sheet Set
);

-- Seed: Coffin Stud Earrings — Gold, Silver
INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity, sort_order) VALUES
  ('b13d9258-d74d-4f77-92b4-c9e1d8b2ceb3', 'color', 'Gold',   25, 1),
  ('b13d9258-d74d-4f77-92b4-c9e1d8b2ceb3', 'color', 'Silver', 25, 2);

-- Seed: Heart Vase — Black, Red, Gold
INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity, sort_order) VALUES
  ('619d79b6-5060-46b1-9083-bd64bedbb374', 'color', 'Black', 10, 1),
  ('619d79b6-5060-46b1-9083-bd64bedbb374', 'color', 'Red',   10, 2),
  ('619d79b6-5060-46b1-9083-bd64bedbb374', 'color', 'Gold',  10, 3);

-- Seed: Luxury Satin Sheet Set — size variants with price overrides
INSERT INTO product_variants (product_id, variant_type, variant_value, price_override, stock_quantity, sort_order) VALUES
  ('0996aa00-e653-4c6e-b6e7-bc8e0bd75ab6', 'size', 'Twin',  39.99, 15, 1),
  ('0996aa00-e653-4c6e-b6e7-bc8e0bd75ab6', 'size', 'Full',  44.99, 15, 2),
  ('0996aa00-e653-4c6e-b6e7-bc8e0bd75ab6', 'size', 'Queen', 49.99, 15, 3),
  ('0996aa00-e653-4c6e-b6e7-bc8e0bd75ab6', 'size', 'King',  54.99, 15, 4);
