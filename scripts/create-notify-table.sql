-- Create notify_requests table for sold-out product notifications
CREATE TABLE IF NOT EXISTS notify_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  UNIQUE(email, product_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notify_requests_product_id ON notify_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_notify_requests_email ON notify_requests(email);
CREATE INDEX IF NOT EXISTS idx_notify_requests_created_at ON notify_requests(created_at DESC);

-- Enable RLS
ALTER TABLE notify_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert their email for notifications
CREATE POLICY "Allow public inserts" ON notify_requests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only admins can read notify requests (service role only)
CREATE POLICY "Allow service role to read" ON notify_requests
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE notify_requests IS 'Stores email addresses for sold-out product restock notifications';
