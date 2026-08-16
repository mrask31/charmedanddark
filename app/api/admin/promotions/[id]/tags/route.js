/**
 * Admin API — Promotion Tag Targeting
 *
 * POST /api/admin/promotions/[id]/tags
 *   Body: { add: ["summerween", ...], remove: ["halloween", ...] }
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
      const normalizedRemove = remove
        .filter((tag) => typeof tag === 'string')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);

      if (normalizedRemove.length > 0) {
        const { error } = await supabaseAdmin
          .from('promotion_tags')
          .delete()
          .eq('promotion_id', id)
          .in('tag', normalizedRemove);
        if (error) throw error;
      }
    }

    if (add.length > 0) {
      const rows = add
        .filter((tag) => typeof tag === 'string' && tag.trim())
        .map((tag) => ({
          promotion_id: id,
          tag: tag.trim().toLowerCase().substring(0, 100),
        }));

      if (rows.length > 0) {
        const { error } = await supabaseAdmin
          .from('promotion_tags')
          .upsert(rows, { onConflict: 'promotion_id,tag' });
        if (error) throw error;
      }
    }

    invalidatePromotionCache();

    const { data: current, error: currentError } = await supabaseAdmin
      .from('promotion_tags')
      .select('tag')
      .eq('promotion_id', id);
    if (currentError) throw currentError;

    return NextResponse.json({
      message: 'Tag targeting updated',
      tags: (current || []).map((row) => row.tag),
    });
  } catch (err) {
    console.error('[Admin Promotions] Tags error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
