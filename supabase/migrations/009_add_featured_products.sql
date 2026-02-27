-- Migration: Add featured product support
-- Feature: product-discovery-threshold
-- Task: 1.1 Add featured product support to database schema

-- Add featured product columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS featured_reason TEXT;

-- Create index for efficient featured product queries
CREATE INDEX IF NOT EXISTS idx_products_featured 
ON products(is_featured, featured_until) 
WHERE is_featured = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN products.is_featured IS 'Marks product for special visual treatment with deep purple accent';
COMMENT ON COLUMN products.featured_until IS 'Optional expiration date for featured status';
COMMENT ON COLUMN products.featured_reason IS 'Context for why product is featured (e.g., new-arrival, seasonal)';
