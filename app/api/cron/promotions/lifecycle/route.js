/**
 * Cron API — Promotion Lifecycle Manager
 *
 * GET /api/cron/promotions/lifecycle
 *
 * Runs periodically (recommended: every 5 minutes via Vercel Cron).
 * Transitions promotion statuses based on current time:
 *   - scheduled → active (when start_date has passed)
 *   - active → expired (when end_date has passed)
 *
 * Auth: Vercel Cron secret (CRON_SECRET) or PROMOTIONS_ADMIN_SECRET
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { invalidatePromotionCache } from '@/lib/promotions';

function isAuthorized(request) {
  // Vercel Cron uses Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const adminSecret = process.env.PROMOTIONS_ADMIN_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
  if (adminSecret && authHeader === `Bearer ${adminSecret}`) return true;
  return false;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();
  let activated = 0;
  let expired = 0;

  try {
    // Transition: scheduled → active (start_date has passed, end_date hasn't)
    const { data: toActivate, error: activateErr } = await supabaseAdmin
      .from('promotions')
      .update({ status: 'active' })
      .eq('status', 'scheduled')
      .eq('enabled', true)
      .lte('start_date', now)
      .gt('end_date', now)
      .select('id, name');

    if (activateErr) {
      console.error('[Promo Lifecycle] Activate error:', activateErr);
    } else {
      activated = toActivate?.length || 0;
    }

    // Transition: active → expired (end_date has passed)
    // Handles both 'active' and 'live' statuses
    const { data: toExpireActive, error: expireActiveErr } = await supabaseAdmin
      .from('promotions')
      .update({ status: 'expired', enabled: false })
      .eq('status', 'active')
      .lte('end_date', now)
      .select('id, name');

    const { data: toExpireLive, error: expireLiveErr } = await supabaseAdmin
      .from('promotions')
      .update({ status: 'expired', enabled: false })
      .eq('status', 'live')
      .lte('end_date', now)
      .select('id, name');

    if (expireActiveErr) {
      console.error('[Promo Lifecycle] Expire active error:', expireActiveErr);
    }
    if (expireLiveErr) {
      console.error('[Promo Lifecycle] Expire live error:', expireLiveErr);
    }

    expired = (toExpireActive?.length || 0) + (toExpireLive?.length || 0);
    const allExpired = [...(toExpireActive || []), ...(toExpireLive || [])];

    // If any transitions occurred, bust cache and revalidate
    if (activated > 0 || expired > 0) {
      invalidatePromotionCache();
      revalidatePath('/');
      revalidatePath('/sale');
      revalidatePath('/shop');

      console.log(`[Promo Lifecycle] Activated: ${activated}, Expired: ${expired}`);
    }

    return NextResponse.json({
      timestamp: now,
      activated,
      expired,
      activatedPromotions: toActivate?.map((p) => p.name) || [],
      expiredPromotions: allExpired.map((p) => p.name),
    });
  } catch (err) {
    console.error('[Promo Lifecycle] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
