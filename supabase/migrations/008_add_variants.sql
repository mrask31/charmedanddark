-- Add variants support to products table
-- Enables parent products with multiple variants (colors, styles, sizes)

-- Add variants column (JSONB array)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- Variant structure:
-- [
--   {
--     "id": "v1",
--     "name": "Moth",
--     "sku": "IT84018CN",
--     "price": 39,
--     "house_price": 35,
--     "stock_quantity": 10,
--     "image_indices": [0, 1],  -- Maps to images array positions
--     "options": {
--       "color": "Black",
--       "style": "Moth"
--     }
--   }
-- ]

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_variants ON products USING GIN (variants);

-- Add is_variant_parent flag for easier filtering
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_variant_parent BOOLEAN DEFAULT false;

-- Update existing products with options to be variant parents
UPDATE products
SET is_variant_parent = true
WHERE options IS NOT NULL AND options != '{}'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN products.variants IS 'Array of product variants with SKU, price, stock, and image mapping';
COMMENT ON COLUMN products.is_variant_parent IS 'True if product has variants, false if standalone product';
