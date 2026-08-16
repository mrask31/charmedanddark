/**
 * Admin API — Promotion Product Targeting
 *
 * POST /api/admin/promotions/[id]/products
 *   Body: { add: [productId, ...], remove: [productId, ...], exclude: [productId, ...] }
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
    const { add = [], remove = [], exclude = [] } = await request.json();

    // Verify promotion exists
    const { data: promo } = await supabaseAdmin
      .from('promotions')
      .select('id')
      .eq('id', id)
      .single();

    if (!promo) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    // Remove products
    if (remove.length > 0) {
      await supabaseAdmin
        .from('promotion_products')
        .delete()
        .eq('promotion_id', id)
        .in('product_id', remove);
    }

    // Add products (upsert to avoid duplicates)
    if (add.length > 0) {
      const rows = add.map((productId) => ({
        promotion_id: id,
        product_id: productId,
        excluded: false,
      }));

      await supabaseAdmin
        .from('promotion_products')
        .upsert(rows, { onConflict: 'promotion_id,product_id' });
    }

    // Exclude products (upsert with excluded=true)
    if (exclude.length > 0) {
      const rows = exclude.map((productId) => ({
        promotion_id: id,
        product_id: productId,
        excluded: true,
      }));

      await supabaseAdmin
        .from('promotion_products')
        .upsert(rows, { onConflict: 'promotion_id,product_id' });
    }

    invalidatePromotionCache();

    // Return current state
    const { data: current } = await supabaseAdmin
      .from('promotion_products')
      .select('product_id, excluded, override_percentage, override_fixed')
      .eq('promotion_id', id);

    return NextResponse.json({
      message: 'Product targeting updated',
      products: current || [],
    });
  } catch (err) {
    console.error('[Admin Promotions] Products error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
