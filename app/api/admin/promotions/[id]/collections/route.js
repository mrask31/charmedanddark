/**
 * Admin API — Promotion Collection Targeting
 *
 * POST /api/admin/promotions/[id]/collections
 *   Body: { add: ["Accessories", ...], remove: ["Apparel", ...] }
 *
 * Auth: Bearer PROMOTIONS_ADMIN_SECRET
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { invalidatePromotionCache } from '@/lib/promotions';

function isAuthorized(request) {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.PROMOTIONS_ADMIN_SECRET}`;
}

export async function POST(request, { params }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { add = [], remove = [] } = await request.json();

    // Verify promotion exists
    const { data: promo } = await supabaseAdmin
      .from('promotions')
      .select('id')
      .eq('id', id)
      .single();

    if (!promo) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    if (remove.length > 0) {
      await supabaseAdmin
        .from('promotion_collections')
        .delete()
        .eq('promotion_id', id)
        .in('collection', remove);
    }

    if (add.length > 0) {
      const rows = add.map((collection) => ({
        promotion_id: id,
        collection: collection.trim(),
      }));

      await supabaseAdmin
        .from('promotion_collections')
        .upsert(rows, { onConflict: 'promotion_id,collection' });
    }

    invalidatePromotionCache();

    const { data: current } = await supabaseAdmin
      .from('promotion_collections')
      .select('collection')
      .eq('promotion_id', id);

    return NextResponse.json({
      message: 'Collection targeting updated',
      collections: (current || []).map((r) => r.collection),
    });
  } catch (err) {
    console.error('[Admin Promotions] Collections error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
