-- Create discount_codes table for member discount codes
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  percent_off INTEGER NOT NULL CHECK (percent_off > 0 AND percent_off <= 100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique constraint: only one active discount code per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_discount_codes_user_active_unique 
  ON discount_codes(user_id, is_active) 
  WHERE is_active = TRUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_discount_codes_user_active ON discount_codes(user_id, is_active);

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read own active discount code
CREATE POLICY "Users can read own active discount code" ON discount_codes
  FOR SELECT
  USING (auth.uid() = user_id AND is_active = TRUE);

-- Add comment
COMMENT ON TABLE discount_codes IS 'Stores member discount codes for sanctuary pricing';
