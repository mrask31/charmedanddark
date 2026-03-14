-- Ensure blog_posts table has all required columns for the Journal page.
-- The table already exists with a 'status' column (values: 'published', 'scheduled', 'draft').
-- Add any missing columns safely.

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Charmed & Dark';

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_created
  ON blog_posts (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON blog_posts (slug);
