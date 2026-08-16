/**
 * Admin API — Promotion Product Targeting
 *
 * POST /api/admin/promotions/[id]/products
 *   Body: { add: [productId, ...], remove: [productId, ...], exclude: [productId, ...] }
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
    const { add = [], remove = [], exclude = [] } = await request.json();

    if (![add, remove, exclude].every(Array.isArray)) {
      return NextResponse.json({ error: 'add, remove, and exclude must be arrays' }, { status: 400 });
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
        .from('promotion_products')
        .delete()
        .eq('promotion_id', id)
        .in('product_id', remove);
      if (error) throw error;
    }

    if (add.length > 0) {
      const rows = add.map((productId) => ({
        promotion_id: id,
        product_id: productId,
        excluded: false,
      }));
      const { error } = await supabaseAdmin
        .from('promotion_products')
        .upsert(rows, { onConflict: 'promotion_id,product_id' });
      if (error) throw error;
    }

    if (exclude.length > 0) {
      const rows = exclude.map((productId) => ({
        promotion_id: id,
        product_id: productId,
        excluded: true,
      }));
      const { error } = await supabaseAdmin
        .from('promotion_products')
        .upsert(rows, { onConflict: 'promotion_id,product_id' });
      if (error) throw error;
    }

    invalidatePromotionCache();

    const { data: current, error: currentError } = await supabaseAdmin
      .from('promotion_products')
      .select('product_id, excluded, override_percentage, override_fixed')
      .eq('promotion_id', id);
    if (currentError) throw currentError;

    return NextResponse.json({
      message: 'Product targeting updated',
      products: current || [],
    });
  } catch (err) {
    console.error('[Admin Promotions] Products error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
