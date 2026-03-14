-- Create blog_posts table for the Journal page
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  category TEXT,
  author TEXT DEFAULT 'Charmed & Dark',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published BOOLEAN DEFAULT TRUE
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_created
  ON blog_posts (published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON blog_posts (slug);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (published = true);
