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

function signSessionExpiry(secret, expiresAt) {
  return createHmac('sha256', secret)
    .update(`${SESSION_MARKER}:${expiresAt}`)
    .digest('base64url');
}

function readCookie(request, name) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  for (const pair of cookieHeader.split(';')) {
    const separator = pair.indexOf('=');
    if (separator === -1) continue;
    const key = pair.slice(0, separator).trim();
    if (key !== name) continue;

    const rawValue = pair.slice(separator + 1).trim();
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return null;
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
  if (!secret || typeof candidate !== 'string') return false;

  const [expiresAtRaw, signature, ...extra] = candidate.split('.');
  if (!expiresAtRaw || !signature || extra.length > 0) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;

  return safeEqual(signature, signSessionExpiry(secret, expiresAt));
}

export function getPromotionAdminSessionToken() {
  const secret = getAdminSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  return `${expiresAt}.${signSessionExpiry(secret, expiresAt)}`;
}

export function isPromotionAdminRequest(request) {
  const secret = getAdminSecret();
  if (!secret) return false;

  const cookieToken = readCookie(request, PROMOTION_ADMIN_COOKIE);
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
