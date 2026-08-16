import { cookies } from 'next/headers';
import PromotionAdminGate from '@/components/admin/PromotionAdminGate';
import {
  PROMOTION_ADMIN_COOKIE,
  isPromotionAdminConfigured,
  isPromotionAdminSessionToken,
} from '@/lib/admin/promotion-auth';

export const dynamic = 'force-dynamic';

export default async function PromotionsAdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(PROMOTION_ADMIN_COOKIE)?.value;

  return (
    <PromotionAdminGate
      initialAuthenticated={isPromotionAdminSessionToken(token)}
      configured={isPromotionAdminConfigured()}
    >
      {children}
    </PromotionAdminGate>
  );
}
