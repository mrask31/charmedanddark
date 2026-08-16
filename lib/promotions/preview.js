/**
 * Promotion Engine — Campaign Preview Mode
 *
 * Allows browsing the storefront with a promotion applied before it's published.
 * Activated via URL parameters: ?preview_promotion=SLUG&preview_secret=SECRET
 *
 * Usage in server components:
 *   const preview = getPreviewContext(searchParams);
 *   if (preview) { // render with preview promotion }
 *
 * The preview mode:
 * - Loads the promotion regardless of status/enabled
 * - Applies it to all matching products for display
 * - Does NOT make the promotion visible to other users
 * - Requires a secret that matches PROMOTION_PREVIEW_SECRET env var
 */

import { PROMOTION_PREVIEW_SECRET } from './config';
import { getPromotionBySlug } from './engine';

/**
 * Check if the current request is in preview mode and return the preview promotion.
 *
 * @param {URLSearchParams|Object} searchParams - Next.js searchParams from page props
 * @returns {Promise<import('./types').Promotion|null>}
 */
export async function getPreviewPromotion(searchParams) {
  // Support both URLSearchParams and plain object (Next.js page props)
  const getParam = (key) => {
    if (searchParams instanceof URLSearchParams) return searchParams.get(key);
    if (searchParams && typeof searchParams === 'object') return searchParams[key] || null;
    return null;
  };

  const slug = getParam('preview_promotion');
  const secret = getParam('preview_secret');

  // Must have both slug and valid secret
  if (!slug || !secret) return null;
  if (!PROMOTION_PREVIEW_SECRET || secret !== PROMOTION_PREVIEW_SECRET) return null;

  try {
    return await getPromotionBySlug(slug, { ignoreStatus: true });
  } catch {
    return null;
  }
}

/**
 * Check if preview mode is active (lighter check, no DB query).
 *
 * @param {URLSearchParams|Object} searchParams
 * @returns {boolean}
 */
export function isPreviewMode(searchParams) {
  const getParam = (key) => {
    if (searchParams instanceof URLSearchParams) return searchParams.get(key);
    if (searchParams && typeof searchParams === 'object') return searchParams[key] || null;
    return null;
  };

  const slug = getParam('preview_promotion');
  const secret = getParam('preview_secret');

  return !!(slug && secret && PROMOTION_PREVIEW_SECRET && secret === PROMOTION_PREVIEW_SECRET);
}
