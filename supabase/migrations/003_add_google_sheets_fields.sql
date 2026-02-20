-- Add fields for Google Sheets sync
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS description_lines JSONB,
  ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS house_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS options JSONB,
  ADD COLUMN IF NOT EXISTS sync_source VARCHAR(50) DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;

-- Update existing price column to be base_price for clarity
UPDATE products SET base_price = price WHERE base_price IS NULL;

-- Calculate house_price for existing products (10% off, rounded)
UPDATE products SET house_price = ROUND(base_price * 0.9) WHERE house_price IS NULL;

-- Add index for sync tracking
CREATE INDEX IF NOT EXISTS idx_products_last_synced ON products(last_synced_at);
CREATE INDEX IF NOT EXISTS idx_products_sync_source ON products(sync_source);

-- Add comment for documentation
COMMENT ON COLUMN products.description_lines IS 'JSON array of description lines from Google Sheets [Line1, Line2, Line3]';
COMMENT ON COLUMN products.metadata IS 'Metadata for Sanctuary AI mood understanding';
COMMENT ON COLUMN products.options IS 'Product options like colors, sizes, etc.';
COMMENT ON COLUMN products.sync_source IS 'Source of product data: manual, google_sheets, shopify';
