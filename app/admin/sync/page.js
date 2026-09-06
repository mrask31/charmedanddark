import { isShopifyCatalogEnabled } from '@/lib/commerce-config';
import LegacyCatalogMaintenance from '@/components/admin/LegacyCatalogMaintenance';
import CatalogDiagnostics from '@/components/admin/CatalogDiagnostics';

export default function AdminSyncPage() {
  return isShopifyCatalogEnabled()
    ? <CatalogDiagnostics />
    : <LegacyCatalogMaintenance />;
}
