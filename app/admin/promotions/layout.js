import { cookies } from 'next/headers';
import AdminSessionGate from '@/components/admin/AdminSessionGate';
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
    <AdminSessionGate
      initialAuthenticated={isPromotionAdminSessionToken(token)}
      configured={isPromotionAdminConfigured()}
      title="Promotions Admin"
      description="Enter the admin key to manage promotions."
    >
      {children}
    </AdminSessionGate>
  );
}
