-- Fix RLS policies on products table for Sanctuary API access

-- Enable RLS if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow service role to read all products (for AI context)
CREATE POLICY IF NOT EXISTS "Service role can read all products" ON products
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Allow anonymous users to read products (for public browsing)
CREATE POLICY IF NOT EXISTS "Anyone can read products" ON products
  FOR SELECT USING (true);
