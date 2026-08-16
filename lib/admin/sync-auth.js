import { isPromotionAdminRequest } from '@/lib/admin/promotion-auth';

/**
 * Commerce maintenance uses the same signed admin session as Promotions.
 * Trusted API clients may use the server-only PROMOTIONS_ADMIN_SECRET bearer
 * accepted by isPromotionAdminRequest(). The legacy SYNC_SECRET_KEY is
 * intentionally not accepted because it was previously exposed client-side.
 */
export function isSyncAdminRequest(request) {
  return isPromotionAdminRequest(request);
}
