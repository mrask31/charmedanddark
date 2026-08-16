import { NextResponse } from 'next/server';
import {
  PROMOTION_ADMIN_COOKIE,
  getPromotionAdminSessionToken,
  isPromotionAdminConfigured,
  isPromotionAdminRequest,
  promotionAdminCookieOptions,
  verifyPromotionAdminSecret,
} from '@/lib/admin/promotion-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return NextResponse.json({
    authenticated: isPromotionAdminRequest(request),
    configured: isPromotionAdminConfigured(),
  });
}

export async function POST(request) {
  if (!isPromotionAdminConfigured()) {
    return NextResponse.json(
      { error: 'Promotion admin access is not configured.' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!verifyPromotionAdminSecret(body?.secret)) {
    return NextResponse.json({ error: 'Invalid admin key.' }, { status: 401 });
  }

  const token = getPromotionAdminSessionToken();
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(PROMOTION_ADMIN_COOKIE, token, promotionAdminCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(PROMOTION_ADMIN_COOKIE, '', {
    ...promotionAdminCookieOptions(),
    maxAge: 0,
  });
  return response;
}
