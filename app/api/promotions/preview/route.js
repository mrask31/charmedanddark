/**
 * Public API — Campaign Preview
 *
 * GET /api/promotions/preview?slug=summerween-2026&secret=PREVIEW_SECRET
 *
 * Returns a promotion regardless of status/enabled (for Campaign Preview mode).
 * Gated by PROMOTION_PREVIEW_SECRET.
 */

import { NextResponse } from 'next/server';
import { getPromotionBySlug } from '@/lib/promotions';
import { PROMOTION_PREVIEW_SECRET } from '@/lib/promotions/config';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const secret = searchParams.get('secret');

  if (!slug) {
    return NextResponse.json({ error: 'slug parameter is required' }, { status: 400 });
  }

  if (!PROMOTION_PREVIEW_SECRET || secret !== PROMOTION_PREVIEW_SECRET) {
    return NextResponse.json({ error: 'Invalid preview secret' }, { status: 403 });
  }

  try {
    const promotion = await getPromotionBySlug(slug, { ignoreStatus: true });

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({ promotion });
  } catch (err) {
    console.error('[Promotions Preview] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
