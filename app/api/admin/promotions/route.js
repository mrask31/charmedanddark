/**
 * Admin API — Promotions CRUD (List + Create)
 *
 * GET  /api/admin/promotions       → List all promotions (any status)
 * POST /api/admin/promotions       → Create new promotion
 *
 * Auth: HttpOnly admin session or Bearer PROMOTIONS_ADMIN_SECRET
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { isPromotionAdminRequest } from '@/lib/admin/promotion-auth';

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

export async function GET(request) {
  if (!isPromotionAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ promotions: data || [] });
  } catch (err) {
    console.error('[Admin Promotions] List error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isPromotionAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, start_date, end_date, promotion_type } = body;

    if (!name || !start_date || !end_date || !promotion_type) {
      return NextResponse.json(
        { error: 'name, start_date, end_date, and promotion_type are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'start_date and end_date must be valid dates' }, { status: 400 });
    }
    if (endDate <= startDate) {
      return NextResponse.json({ error: 'end_date must be after start_date' }, { status: 400 });
    }

    if (promotion_type === 'percentage') {
      if (!body.percentage || body.percentage <= 0 || body.percentage > 100) {
        return NextResponse.json(
          { error: 'percentage must be between 0.01 and 100 for percentage promotions' },
          { status: 400 }
        );
      }
    } else if (promotion_type === 'fixed_amount') {
      if (!body.fixed_amount || body.fixed_amount <= 0) {
        return NextResponse.json(
          { error: 'fixed_amount must be positive for fixed_amount promotions' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'promotion_type must be "percentage" or "fixed_amount"' },
        { status: 400 }
      );
    }

    const sanitize = (val) => (typeof val === 'string' ? val.trim().substring(0, 500) : val);
    const slug = sanitize(body.slug || generateSlug(name))
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80);

    if (!slug) {
      return NextResponse.json({ error: 'A valid slug is required' }, { status: 400 });
    }

    const insertData = {
      name: sanitize(name),
      slug,
      status: 'draft',
      enabled: false,
      start_date,
      end_date,
      promotion_type,
      percentage: body.percentage || null,
      fixed_amount: body.fixed_amount || null,
      applies_to: body.applies_to || 'specific',
      priority: Number.isFinite(Number(body.priority)) ? Number(body.priority) : 0,
      exclude_sanctuary: body.exclude_sanctuary || false,
      hero_title: sanitize(body.hero_title) || null,
      hero_subtitle: sanitize(body.hero_subtitle) || null,
      hero_cta_text: sanitize(body.hero_cta_text) || 'Shop the Sale',
      hero_cta_url: body.hero_cta_url || '/sale',
      accent_color: body.accent_color || '#c9a96e',
      badge_text: sanitize(body.badge_text) || null,
      countdown_enabled: body.countdown_enabled || false,
      homepage_enabled: body.homepage_enabled || false,
      landing_page_enabled: body.landing_page_enabled !== false,
      nav_enabled: body.nav_enabled !== false,
      seo_title: sanitize(body.seo_title) || null,
      seo_description: sanitize(body.seo_description) || null,
      og_image_url: body.og_image_url || null,
      shopify_discount_id: body.shopify_discount_id || null,
    };

    const { data, error } = await supabaseAdmin
      .from('promotions')
      .insert(insertData)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[Admin Promotions] Create error:', err);
    if (err.message?.includes('duplicate key') || err.code === '23505') {
      return NextResponse.json({ error: 'A promotion with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
