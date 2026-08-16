/**
 * Admin API — Publish / Schedule a Promotion
 *
 * POST /api/admin/promotions/[id]/publish
 * POST /api/admin/promotions/[id]/publish?action=schedule
 *
 * Auth: HttpOnly admin session or Bearer PROMOTIONS_ADMIN_SECRET
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { invalidatePromotionCache } from '@/lib/promotions';
import { isPromotionAdminRequest } from '@/lib/admin/promotion-auth';

export async function POST(request, { params }) {
  if (!isPromotionAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'publish';

  if (!['publish', 'schedule'].includes(action)) {
    return NextResponse.json({ error: 'Unsupported publish action' }, { status: 400 });
  }

  try {
    const { data: promo, error: fetchError } = await supabaseAdmin
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !promo) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    if (promo.status === 'archived') {
      return NextResponse.json(
        { error: 'Cannot publish an archived promotion. Create a new one instead.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const startDate = new Date(promo.start_date);
    const endDate = new Date(promo.end_date);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Promotion has invalid schedule dates.' }, { status: 400 });
    }
    if (endDate <= now) {
      return NextResponse.json(
        { error: 'Cannot publish a promotion whose end_date has already passed.' },
        { status: 400 }
      );
    }

    const targetStatus = action === 'schedule' || startDate > now ? 'scheduled' : 'active';

    const { data, error } = await supabaseAdmin
      .from('promotions')
      .update({ status: targetStatus, enabled: true })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

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
