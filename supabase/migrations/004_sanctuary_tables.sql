-- Sprint 4: The Sanctuary - User Behavior Tracking & AI Interactions

-- User Product Views Table
CREATE TABLE IF NOT EXISTS user_product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  product_handle TEXT NOT NULL,
  session_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_user_product_views_user_id ON user_product_views(user_id);
CREATE INDEX idx_user_product_views_product_id ON user_product_views(product_id);
CREATE INDEX idx_user_product_views_viewed_at ON user_product_views(viewed_at DESC);

-- Sanctuary Interactions Table
CREATE TABLE IF NOT EXISTS sanctuary_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  recommended_product_id UUID,
  recommended_product_handle TEXT,
  mood_tags TEXT[], -- For future analysis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_recommended_product FOREIGN KEY (recommended_product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Indexes for analytics
CREATE INDEX idx_sanctuary_interactions_user_id ON sanctuary_interactions(user_id);
CREATE INDEX idx_sanctuary_interactions_created_at ON sanctuary_interactions(created_at DESC);
CREATE INDEX idx_sanctuary_interactions_mood_tags ON sanctuary_interactions USING GIN(mood_tags);

-- Row Level Security (RLS)
ALTER TABLE user_product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctuary_interactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own product views" ON user_product_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product views" ON user_product_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sanctuary interactions" ON sanctuary_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sanctuary interactions" ON sanctuary_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can access all data for analytics
CREATE POLICY "Service role full access to views" ON user_product_views
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to interactions" ON sanctuary_interactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
