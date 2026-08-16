/**
 * Admin API — Promotion Tag Targeting
 *
 * POST /api/admin/promotions/[id]/tags
 *   Body: { add: ["summerween", ...], remove: ["halloween", ...] }
 *
 * Auth: Bearer PROMOTIONS_ADMIN_SECRET
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { invalidatePromotionCache } from '@/lib/promotions';

function isAuthorized(request) {
  const authHeader = request.headers.get('authorization');
  const promoSecret = process.env.PROMOTIONS_ADMIN_SECRET;
  const syncSecret = process.env.SYNC_SECRET_KEY || 'charmed-dark-sync-2026';
  if (promoSecret && authHeader === `Bearer ${promoSecret}`) return true;
  if (authHeader === `Bearer ${syncSecret}`) return true;
  return false;
}

export async function POST(request, { params }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { add = [], remove = [] } = await request.json();

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
        .from('promotion_tags')
        .delete()
        .eq('promotion_id', id)
        .in('tag', remove);
    }

    if (add.length > 0) {
      const rows = add.map((tag) => ({
        promotion_id: id,
        tag: tag.trim().toLowerCase(),
      }));

      await supabaseAdmin
        .from('promotion_tags')
        .upsert(rows, { onConflict: 'promotion_id,tag' });
    }

    invalidatePromotionCache();

    const { data: current } = await supabaseAdmin
      .from('promotion_tags')
      .select('tag')
      .eq('promotion_id', id);

    return NextResponse.json({
      message: 'Tag targeting updated',
      tags: (current || []).map((r) => r.tag),
    });
  } catch (err) {
    console.error('[Admin Promotions] Tags error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
