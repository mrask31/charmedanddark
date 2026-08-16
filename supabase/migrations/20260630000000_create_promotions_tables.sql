-- ============================================================================
-- PROMOTION ENGINE v1 — Database Schema
-- Migration: 20260630000000_create_promotions_tables
--
-- Creates the core tables for the Charmed & Dark Promotion Engine.
-- This is a presentation-layer system — it powers storefront sale display
-- without modifying product prices or checkout behavior.
--
-- Tables created:
--   promotions            — Campaign definitions (scheduling, pricing, presentation)
--   promotion_products    — Product-level targeting and exclusions
--   promotion_collections — Collection/category-level targeting
--   promotion_tags        — Tag-level targeting
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. PROMOTIONS — Core campaign table
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS promotions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name                  TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,

  -- Status & Scheduling
  -- Lifecycle: draft → scheduled → active → expired → archived
  status                TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'scheduled', 'active', 'expired', 'archived')),
  enabled               BOOLEAN NOT NULL DEFAULT false,
  start_date            TIMESTAMPTZ NOT NULL,
  end_date              TIMESTAMPTZ NOT NULL,

  -- Discount Configuration
  promotion_type        TEXT NOT NULL DEFAULT 'percentage'
                        CHECK (promotion_type IN ('percentage', 'fixed_amount')),
  percentage            NUMERIC(5,2),          -- e.g. 40.00 for 40% off
  fixed_amount          NUMERIC(10,2),         -- e.g. 10.00 for $10 off

  -- Targeting Strategy
  applies_to            TEXT NOT NULL DEFAULT 'specific'
                        CHECK (applies_to IN ('all', 'specific', 'collection', 'tag')),
  exclude_sanctuary     BOOLEAN NOT NULL DEFAULT false,

  -- Presentation: Hero / Homepage
  hero_title            TEXT,
  hero_subtitle         TEXT,
  hero_cta_text         TEXT DEFAULT 'Shop the Sale',
  hero_cta_url          TEXT DEFAULT '/sale',
  accent_color          TEXT DEFAULT '#c9a96e',
  badge_text            TEXT,

  -- Feature Flags (per-promotion)
  countdown_enabled     BOOLEAN NOT NULL DEFAULT false,
  homepage_enabled      BOOLEAN NOT NULL DEFAULT false,
  landing_page_enabled  BOOLEAN NOT NULL DEFAULT true,
  nav_enabled           BOOLEAN NOT NULL DEFAULT true,

  -- SEO
  seo_title             TEXT,
  seo_description       TEXT,
  og_image_url          TEXT,

  -- Shopify Reference (for operational alignment)
  shopify_discount_id   TEXT,

  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_percentage CHECK (
    promotion_type != 'percentage' OR (percentage IS NOT NULL AND percentage > 0 AND percentage <= 100)
  ),
  CONSTRAINT valid_fixed_amount CHECK (
    promotion_type != 'fixed_amount' OR (fixed_amount IS NOT NULL AND fixed_amount > 0)
  )
);

-- Indexes for common queries
CREATE INDEX idx_promotions_active_lookup
  ON promotions (enabled, status, start_date, end_date)
  WHERE enabled = true AND status = 'active';

CREATE INDEX idx_promotions_slug
  ON promotions (slug);

CREATE INDEX idx_promotions_status
  ON promotions (status);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. PROMOTION_PRODUCTS — Product-level targeting and exclusions
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS promotion_products (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id          UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id            UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Per-product discount override (optional — falls back to promotion-level)
  override_percentage   NUMERIC(5,2),
  override_fixed        NUMERIC(10,2),

  -- Exclusion: explicitly exclude this product even if collection/tag matches
  excluded              BOOLEAN NOT NULL DEFAULT false,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(promotion_id, product_id)
);

CREATE INDEX idx_promotion_products_product
  ON promotion_products (product_id);

CREATE INDEX idx_promotion_products_promotion
  ON promotion_products (promotion_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. PROMOTION_COLLECTIONS — Collection/category-level targeting
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS promotion_collections (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id          UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  collection            TEXT NOT NULL,   -- Matches products.category or products.collection

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(promotion_id, collection)
);

CREATE INDEX idx_promotion_collections_promotion
  ON promotion_collections (promotion_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. PROMOTION_TAGS — Tag-level targeting
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS promotion_tags (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id          UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  tag                   TEXT NOT NULL,   -- Matches ANY tag in products.tags array

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(promotion_id, tag)
);

CREATE INDEX idx_promotion_tags_promotion
  ON promotion_tags (promotion_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_tags ENABLE ROW LEVEL SECURITY;

-- Public read: only active + enabled promotions visible to anon/public
CREATE POLICY "Public read active promotions"
  ON promotions FOR SELECT
  USING (enabled = true AND status = 'active');

-- Junction tables: public read (filtered at application layer via promotion join)
CREATE POLICY "Public read promotion_products"
  ON promotion_products FOR SELECT
  USING (true);

CREATE POLICY "Public read promotion_collections"
  ON promotion_collections FOR SELECT
  USING (true);

CREATE POLICY "Public read promotion_tags"
  ON promotion_tags FOR SELECT
  USING (true);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. UPDATED_AT TRIGGER
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_promotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotions_updated_at();
