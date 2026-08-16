import { cookies } from 'next/headers';
import AdminSessionGate from '@/components/admin/AdminSessionGate';
import {
  PROMOTION_ADMIN_COOKIE,
  isPromotionAdminConfigured,
  isPromotionAdminSessionToken,
} from '@/lib/admin/promotion-auth';

export const dynamic = 'force-dynamic';

export default async function SyncAdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(PROMOTION_ADMIN_COOKIE)?.value;

  return (
    <AdminSessionGate
      initialAuthenticated={isPromotionAdminSessionToken(token)}
      configured={isPromotionAdminConfigured()}
      title="Commerce Admin"
      description="Enter the admin key to run product sync and catalog maintenance."
    >
      {children}
    </AdminSessionGate>
  );
}
