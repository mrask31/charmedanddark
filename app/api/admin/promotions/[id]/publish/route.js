/**
 * Admin API — Publish / Schedule a Promotion
 *
 * POST /api/admin/promotions/[id]/publish   → Set status to 'active' + enabled=true
 * POST /api/admin/promotions/[id]/schedule  → (handled by query param ?action=schedule)
 *
 * Auth: Bearer PROMOTIONS_ADMIN_SECRET
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'publish';

  try {
    // Fetch the promotion to validate state
    const { data: promo, error: fetchError } = await supabaseAdmin
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !promo) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    // Cannot publish archived promotions
    if (promo.status === 'archived') {
      return NextResponse.json(
        { error: 'Cannot publish an archived promotion. Create a new one instead.' },
        { status: 400 }
      );
    }

    // Determine target status based on dates and action
    const now = new Date();
    const startDate = new Date(promo.start_date);
    const endDate = new Date(promo.end_date);

    if (endDate <= now) {
      return NextResponse.json(
        { error: 'Cannot publish a promotion whose end_date has already passed.' },
        { status: 400 }
      );
    }

    let targetStatus;
    if (action === 'schedule') {
      targetStatus = 'scheduled';
    } else {
      // If start_date is in the future, auto-schedule; otherwise activate immediately
      targetStatus = startDate > now ? 'scheduled' : 'active';
    }

    const { data, error } = await supabaseAdmin
      .from('promotions')
      .update({ status: targetStatus, enabled: true })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    // Invalidate cache and revalidate storefront
    invalidatePromotionCache();
    revalidatePath('/');
    revalidatePath('/sale');
    revalidatePath('/shop');

    return NextResponse.json({
      message: targetStatus === 'active'
        ? 'Promotion is now live.'
        : `Promotion scheduled. Will activate at ${promo.start_date}.`,
      promotion: data,
    });
  } catch (err) {
    console.error('[Admin Promotions] Publish error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
