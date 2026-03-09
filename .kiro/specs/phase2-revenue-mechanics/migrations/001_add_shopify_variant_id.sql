-- Migration: Add shopify_variant_id column to products table
-- Purpose: Cache Shopify variant IDs to optimize checkout performance
-- Requirements: 9.1

-- Add column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS shopify_variant_id TEXT;

-- Create index for fast lookups during checkout
CREATE INDEX IF NOT EXISTS idx_products_shopify_variant_id 
ON products(shopify_variant_id);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'shopify_variant_id';
