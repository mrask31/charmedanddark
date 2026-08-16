/**
 * Public API — Active Promotions
 *
 * GET /api/promotions/active
 *
 * Returns currently active promotions (cached via ISR).
 * No auth required — uses RLS (only active + enabled promotions visible).
 */

import { NextResponse } from 'next/server';
import { getActivePromotions, PROMOTION_ENGINE_ENABLED } from '@/lib/promotions';

// Cache for 60 seconds
export const revalidate = 60;

export async function GET() {
  if (!PROMOTION_ENGINE_ENABLED) {
    return NextResponse.json({ promotions: [] });
  }

  try {
    const promotions = await getActivePromotions();

    return NextResponse.json({
      promotions: promotions.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        promotionType: p.promotionType,
        percentage: p.percentage,
        fixedAmount: p.fixedAmount,
        heroTitle: p.heroTitle,
        heroSubtitle: p.heroSubtitle,
        heroCtaText: p.heroCtaText,
        heroCtaUrl: p.heroCtaUrl,
        accentColor: p.accentColor,
        badgeText: p.badgeText,
        countdownEnabled: p.countdownEnabled,
        homepageEnabled: p.homepageEnabled,
        navEnabled: p.navEnabled,
        endDate: p.endDate,
      })),
    });
  } catch (err) {
    console.error('[Promotions API] Active error:', err);
    return NextResponse.json({ promotions: [] });
  }
}
