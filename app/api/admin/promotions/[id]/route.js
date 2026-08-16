/**
 * Admin API — Single Promotion (Get, Update, Delete)
 *
 * GET    /api/admin/promotions/[id]  → Get promotion with targeting data
 * PUT    /api/admin/promotions/[id]  → Update promotion fields
 * DELETE /api/admin/promotions/[id]  → Archive (soft-delete) promotion
 *
 * Auth: HttpOnly admin session or Bearer PROMOTIONS_ADMIN_SECRET
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { invalidatePromotionCache } from '@/lib/promotions';
import { isPromotionAdminRequest } from '@/lib/admin/promotion-auth';

export async function GET(request, { params }) {
  if (!isPromotionAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { data: promotion, error } = await supabaseAdmin
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

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
  if (!isPromotionAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    if (body.start_date && Number.isNaN(new Date(body.start_date).getTime())) {
      return NextResponse.json({ error: 'start_date must be a valid date' }, { status: 400 });
    }
    if (body.end_date && Number.isNaN(new Date(body.end_date).getTime())) {
      return NextResponse.json({ error: 'end_date must be a valid date' }, { status: 400 });
    }
    if (body.start_date && body.end_date && new Date(body.end_date) <= new Date(body.start_date)) {
      return NextResponse.json({ error: 'end_date must be after start_date' }, { status: 400 });
    }

    if (body.percentage !== undefined && (body.percentage <= 0 || body.percentage > 100)) {
      return NextResponse.json({ error: 'percentage must be between 0.01 and 100' }, { status: 400 });
    }

    const sanitize = (val) => (typeof val === 'string' ? val.trim().substring(0, 500) : val);
    const updateData = {};
    const allowedFields = [
      'name', 'slug', 'status', 'enabled', 'start_date', 'end_date',
      'promotion_type', 'percentage', 'fixed_amount', 'applies_to', 'priority',
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

    if (updateData.priority !== undefined) {
      const priority = Number(updateData.priority);
      if (!Number.isFinite(priority)) {
        return NextResponse.json({ error: 'priority must be numeric' }, { status: 400 });
      }
      updateData.priority = priority;
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
  if (!isPromotionAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
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
    revalidatePath('/shop');

    return NextResponse.json({ message: 'Promotion archived', promotion: data });
  } catch (err) {
    console.error('[Admin Promotions] Delete error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
