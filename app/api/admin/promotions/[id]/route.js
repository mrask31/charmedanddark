/**
 * Admin API — Single Promotion (Get, Update, Delete)
 *
 * GET    /api/admin/promotions/[id]  → Get promotion with targeting data
 * PUT    /api/admin/promotions/[id]  → Update promotion fields
 * DELETE /api/admin/promotions/[id]  → Archive (soft-delete) promotion
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

export async function GET(request, { params }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Fetch promotion
    const { data: promotion, error } = await supabaseAdmin
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    // Fetch targeting data
    const [productsRes, collectionsRes, tagsRes] = await Promise.all([
      supabaseAdmin.from('promotion_products').select('*').eq('promotion_id', id),
      supabaseAdmin.from('promotion_collections').select('*').eq('promotion_id', id),
      supabaseAdmin.from('promotion_tags').select('*').eq('promotion_id', id),
    ]);

    return NextResponse.json({
      ...promotion,
      products: productsRes.data || [],
      collections: collectionsRes.data || [],
      tags: tagsRes.data || [],
    });
  } catch (err) {
    console.error('[Admin Promotions] Get error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    // Validate dates if provided
    if (body.start_date && body.end_date) {
      if (new Date(body.end_date) <= new Date(body.start_date)) {
        return NextResponse.json({ error: 'end_date must be after start_date' }, { status: 400 });
      }
    }

    // Validate percentage if updating
    if (body.percentage !== undefined && (body.percentage <= 0 || body.percentage > 100)) {
      return NextResponse.json({ error: 'percentage must be between 0.01 and 100' }, { status: 400 });
    }

    // Sanitize text fields
    const sanitize = (val) => (typeof val === 'string' ? val.trim().substring(0, 500) : val);

    // Build update object (only include provided fields)
    const updateData = {};
    const allowedFields = [
      'name', 'slug', 'status', 'enabled', 'start_date', 'end_date',
      'promotion_type', 'percentage', 'fixed_amount', 'applies_to',
      'exclude_sanctuary', 'hero_title', 'hero_subtitle', 'hero_cta_text',
      'hero_cta_url', 'accent_color', 'badge_text', 'countdown_enabled',
      'homepage_enabled', 'landing_page_enabled', 'nav_enabled',
      'seo_title', 'seo_description', 'og_image_url', 'shopify_discount_id',
    ];

    const textFields = [
      'name', 'slug', 'hero_title', 'hero_subtitle', 'hero_cta_text',
      'badge_text', 'seo_title', 'seo_description',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = textFields.includes(field) ? sanitize(body[field]) : body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('promotions')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    // Invalidate cache and revalidate pages
    invalidatePromotionCache();
    revalidatePath('/');
    revalidatePath('/sale');
    revalidatePath('/shop');

    return NextResponse.json(data);
  } catch (err) {
    console.error('[Admin Promotions] Update error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Soft-delete: set status to 'archived', disable
    const { data, error } = await supabaseAdmin
      .from('promotions')
      .update({ status: 'archived', enabled: false })
      .eq('id', id)
      .select('id, name, status')
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    invalidatePromotionCache();
    revalidatePath('/');
    revalidatePath('/sale');

    return NextResponse.json({ message: 'Promotion archived', promotion: data });
  } catch (err) {
    console.error('[Admin Promotions] Delete error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
