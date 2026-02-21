-- Add image_url column for direct image URLs from Google Sheets
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for faster image lookups
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url) WHERE image_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.image_url IS 'Direct URL to product image (from Google Sheets or Supabase Storage)';
