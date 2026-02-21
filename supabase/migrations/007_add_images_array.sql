-- Add images array column to products table
-- Supports multiple images per product (alternate angles, details)

-- Add new images column (JSONB array)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url data to images array
UPDATE products 
SET images = jsonb_build_array(jsonb_build_object('url', image_url, 'position', 0))
WHERE image_url IS NOT NULL AND image_url != '';

-- Keep image_url for backward compatibility (will be deprecated)
-- Frontend will prioritize images array over image_url

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);

-- Comment for documentation
COMMENT ON COLUMN products.images IS 'Array of image objects: [{"url": "https://...", "position": 0, "alt": "..."}]';
