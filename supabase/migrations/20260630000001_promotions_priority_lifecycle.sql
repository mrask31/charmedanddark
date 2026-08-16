-- ============================================================================
-- PROMOTION ENGINE v1 — Priority & Lifecycle Enhancements
-- Migration: 20260630000001_promotions_priority_lifecycle
--
-- Adds:
--   - priority (conflict resolution)
--   - is_exclusive (stacking control)
--   - Expands status CHECK to include 'live' as alias for 'active'
--   - Adds priority index for conflict resolution queries
--
-- Required by: Items 2 (Conflict Resolution) and 3 (Lifecycle)
-- ============================================================================

-- ── Item 2: Promotion Priority & Exclusivity ─────────────────────────────────

-- Priority: higher number = higher priority. Used when multiple promotions match.
ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0;

-- Exclusive: when true, this promotion cannot stack with others.
-- When false, it *could* stack in a future V2 implementation.
-- V1 behavior: highest-priority matching promotion always wins (no stacking).
ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN NOT NULL DEFAULT true;

-- Index for priority-based conflict resolution
CREATE INDEX IF NOT EXISTS idx_promotions_priority
  ON promotions (priority DESC, created_at DESC);

-- ── Item 3: Lifecycle Expansion ──────────────────────────────────────────────

-- The existing status CHECK allows: draft, scheduled, active, expired, archived
-- We add 'live' as a synonym for 'active' for clearer merchant UX.
-- Drop and recreate the CHECK constraint to include 'live'.
ALTER TABLE promotions
  DROP CONSTRAINT IF EXISTS promotions_status_check;

ALTER TABLE promotions
  ADD CONSTRAINT promotions_status_check
  CHECK (status IN ('draft', 'scheduled', 'active', 'live', 'expired', 'archived'));

-- Note: The cron lifecycle manager will treat 'live' and 'active' identically.
-- 'live' is the merchant-facing term; 'active' is preserved for backwards compat.

COMMENT ON COLUMN promotions.priority IS
  'Conflict resolution priority. Higher number wins. If equal, largest discount wins. If still equal, newest promotion wins.';

COMMENT ON COLUMN promotions.is_exclusive IS
  'V1: always true (no stacking). V2: when false, promotion can stack with lower-priority promotions.';

COMMENT ON COLUMN promotions.status IS
  'Lifecycle: draft → scheduled → active/live → expired → archived. Cron manages transitions automatically.';
