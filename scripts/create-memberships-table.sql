-- Create memberships table for sanctuary member access
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);

-- Enable RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read own membership
CREATE POLICY "Users can read own membership" ON memberships
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE memberships IS 'Stores user membership status for sanctuary access';
