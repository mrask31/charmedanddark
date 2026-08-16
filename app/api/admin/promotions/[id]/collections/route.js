/**
 * Admin API — Promotion Collection Targeting
 *
 * POST /api/admin/promotions/[id]/collections
 *   Body: { add: ["Accessories", ...], remove: ["Apparel", ...] }
 *
 * Auth: HttpOnly admin session or Bearer PROMOTIONS_ADMIN_SECRET
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { invalidatePromotionCache } from '@/lib/promotions';
import { isPromotionAdminRequest } from '@/lib/admin/promotion-auth';

export async function POST(request, { params }) {
  if (!isPromotionAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { add = [], remove = [] } = await request.json();

    if (!Array.isArray(add) || !Array.isArray(remove)) {
      return NextResponse.json({ error: 'add and remove must be arrays' }, { status: 400 });
    }

    const { data: promo } = await supabaseAdmin
      .from('promotions')
      .select('id')
      .eq('id', id)
      .single();

    if (!promo) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    if (remove.length > 0) {
      const { error } = await supabaseAdmin
        .from('promotion_collections')
        .delete()
        .eq('promotion_id', id)
        .in('collection', remove);
      if (error) throw error;
    }

    if (add.length > 0) {
      const rows = add
        .filter((collection) => typeof collection === 'string' && collection.trim())
        .map((collection) => ({
          promotion_id: id,
          collection: collection.trim().substring(0, 100),
        }));

      if (rows.length > 0) {
        const { error } = await supabaseAdmin
          .from('promotion_collections')
          .upsert(rows, { onConflict: 'promotion_id,collection' });
        if (error) throw error;
      }
    }

    invalidatePromotionCache();

    const { data: current, error: currentError } = await supabaseAdmin
      .from('promotion_collections')
      .select('collection')
      .eq('promotion_id', id);
    if (currentError) throw currentError;

    return NextResponse.json({
      message: 'Collection targeting updated',
      collections: (current || []).map((row) => row.collection),
    });
  } catch (err) {
    console.error('[Admin Promotions] Collections error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
