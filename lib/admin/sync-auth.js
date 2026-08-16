import { timingSafeEqual } from 'node:crypto';
import { isPromotionAdminRequest } from '@/lib/admin/promotion-auth';

function safeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;

  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isSyncAdminRequest(request) {
  if (isPromotionAdminRequest(request)) return true;

  const syncSecret = process.env.SYNC_SECRET_KEY?.trim();
  if (!syncSecret) return false;

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  return safeEqual(authHeader.slice('Bearer '.length), syncSecret);
}
