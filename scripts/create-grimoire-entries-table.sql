-- Create grimoire_entries table for saved readings
CREATE TABLE IF NOT EXISTS grimoire_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create composite index for user queries ordered by date
CREATE INDEX IF NOT EXISTS idx_grimoire_user_created ON grimoire_entries(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE grimoire_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read own grimoire entries
CREATE POLICY "Users can read own grimoire entries" ON grimoire_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert own grimoire entries
CREATE POLICY "Users can insert own grimoire entries" ON grimoire_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE grimoire_entries IS 'Stores saved readings for sanctuary members';
