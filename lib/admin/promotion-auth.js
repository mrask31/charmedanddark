import { createHmac, timingSafeEqual } from 'node:crypto';

export const PROMOTION_ADMIN_COOKIE = 'cd_promotion_admin';

const SESSION_MARKER = 'charmed-dark:promotion-admin:v1';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getAdminSecret() {
  const secret = process.env.PROMOTIONS_ADMIN_SECRET?.trim();
  return secret || null;
}

function safeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;

  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function deriveSessionToken(secret) {
  return createHmac('sha256', secret)
    .update(SESSION_MARKER)
    .digest('base64url');
}

export function isPromotionAdminConfigured() {
  return Boolean(getAdminSecret());
}

export function verifyPromotionAdminSecret(candidate) {
  const secret = getAdminSecret();
  return secret ? safeEqual(candidate, secret) : false;
}

export function isPromotionAdminSessionToken(candidate) {
  const secret = getAdminSecret();
  if (!secret) return false;
  return safeEqual(candidate, deriveSessionToken(secret));
}

export function getPromotionAdminSessionToken() {
  const secret = getAdminSecret();
  return secret ? deriveSessionToken(secret) : null;
}

export function isPromotionAdminRequest(request) {
  const secret = getAdminSecret();
  if (!secret) return false;

  const cookieToken = request.cookies.get(PROMOTION_ADMIN_COOKIE)?.value;
  if (cookieToken && isPromotionAdminSessionToken(cookieToken)) return true;

  // Keep an env-only bearer path for trusted automation/API clients.
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return safeEqual(authHeader.slice('Bearer '.length), secret);
  }

  return false;
}

export function promotionAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
