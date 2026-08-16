/**
 * Promotion Engine — Feature Flag & Configuration
 *
 * The entire engine is gated behind this flag.
 * When disabled, all promotion functions return null/empty — zero visual change.
 *
 * Rollout:
 *   1. Deploy with NEXT_PUBLIC_PROMOTIONS_ENABLED=false
 *   2. Create promotion in admin, validate in preview mode
 *   3. Set NEXT_PUBLIC_PROMOTIONS_ENABLED=true in Vercel
 *   4. Redeploy — promotion goes live
 *
 * Rollback:
 *   Set NEXT_PUBLIC_PROMOTIONS_ENABLED=false → redeploy → all promo UI disappears
 */

export const PROMOTION_ENGINE_ENABLED =
  process.env.NEXT_PUBLIC_PROMOTIONS_ENABLED === 'true';

// ISR cache duration for promotion data (seconds)
export const PROMOTION_CACHE_TTL = 60;

// Preview mode secret (server-side only)
export const PROMOTION_PREVIEW_SECRET =
  process.env.PROMOTION_PREVIEW_SECRET || '';
