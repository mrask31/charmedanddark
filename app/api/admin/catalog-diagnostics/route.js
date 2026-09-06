import { isShopifyCatalogEnabled } from '@/lib/commerce-config';
import { NextResponse } from 'next/server';
import { isSyncAdminRequest } from '@/lib/admin/sync-auth';
import { getCatalogIdentities } from '@/lib/catalog-identity';
import { getProducts } from '@/lib/products';
import { SHOPIFY_API_VERSION } from '@/lib/shopify/client';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!isSyncAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [products, identities] = await Promise.all([getProducts(), getCatalogIdentities()]);
    const liveIds = new Set(products.map((product) => product.shopify_id || product.id));
    const archivedIds = new Set(identities.map((identity) => identity.shopify_id));
    const aliases = new Map();
    for (const identity of identities) {
      for (const alias of [identity.slug, identity.handle, identity.shopify_handle].filter(Boolean)) {
        if (!aliases.has(alias)) aliases.set(alias, new Set());
        aliases.get(alias).add(identity.shopify_id);
      }
    }
    return NextResponse.json({
      checkedAt: new Date().toISOString(),
      apiVersion: SHOPIFY_API_VERSION,
      source: isShopifyCatalogEnabled() ? 'Shopify' : 'Legacy catalog',
      products: products.length,
      availableProducts: products.filter((product) => product.availableForSale === true).length,
      variants: products.reduce((count, product) => count + (product.shopifyVariants?.variants?.length || 0), 0),
      identityRows: identities.length,
      identityProducts: archivedIds.size,
      newProductsWithoutLegacyIdentity: [...liveIds].filter((id) => !archivedIds.has(id)).length,
      archivedProductsNotPublished: [...archivedIds].filter((id) => !liveIds.has(id)).length,
      ambiguousAliases: [...aliases].filter(([, ids]) => ids.size > 1).map(([alias]) => alias),
      productsMissingImages: products.filter((product) => !product.imageUrls?.length).map((product) => product.handle || product.slug),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('[Catalog diagnostics] Read failed:', error.message);
    return NextResponse.json({ error: 'Catalog diagnostics could not reach a required service. Please try again.' }, {
      status: 503, headers: { 'Cache-Control': 'private, no-store' },
    });
  }
}
