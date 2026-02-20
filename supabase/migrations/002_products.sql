-- Products table for the 50 physical home objects
-- These are NOT in Shopify, fulfilled directly

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_handle ON products(handle);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_stock ON products(stock_quantity) WHERE stock_quantity > 0;

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view products)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Only authenticated users can insert/update (for admin operations)
CREATE POLICY "Products are insertable by authenticated users"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products are updatable by authenticated users"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');
