/**
 * Public API — Active Promotions
 *
 * GET /api/promotions/active
 *
 * Returns currently active promotions with request-time schedule checks.
 * No auth required — uses RLS (only active + enabled promotions visible).
 */

import { NextResponse } from 'next/server';
import { getActivePromotions, PROMOTION_ENGINE_ENABLED } from '@/lib/promotions';

// A response cache could keep a campaign visible beyond its end time.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const responseOptions = { headers: { 'Cache-Control': 'no-store' } };

export async function GET() {
  if (!PROMOTION_ENGINE_ENABLED) {
    return NextResponse.json({ promotions: [] }, responseOptions);
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
    }, responseOptions);
  } catch (err) {
    console.error('[Promotions API] Active error:', err);
    return NextResponse.json({ promotions: [] }, responseOptions);
  }
}
