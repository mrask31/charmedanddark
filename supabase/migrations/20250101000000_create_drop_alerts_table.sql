-- Create drop_alerts table for storing email subscriptions
-- when Mailchimp is not configured
CREATE TABLE drop_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX idx_drop_alerts_email ON drop_alerts(email);

-- Index for sorting by creation date
CREATE INDEX idx_drop_alerts_created_at ON drop_alerts(created_at DESC);
