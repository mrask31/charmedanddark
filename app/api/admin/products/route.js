import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isPromotionAdminRequest } from '@/lib/admin/promotion-auth';
import { isShopifyCatalogEnabled } from '@/lib/commerce-config';
import { getProducts } from '@/lib/products';
import { getCatalogIdentities } from '@/lib/catalog-identity';
import { attachCatalogIdentity } from '@/lib/shopify/catalog-shape';
import { getLegacyCampaignPickerProducts } from '@/lib/admin/catalog-picker';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!isPromotionAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();

    const shopifyCatalog = isShopifyCatalogEnabled();
    let normalized;
    let unmappedProductCount = 0;
    if (shopifyCatalog) {
      // Require the identity archive for this UUID-based editor. An archive outage
      // must not masquerade as every saved campaign target having been removed.
      const [catalog, identities] = await Promise.all([getProducts(), getCatalogIdentities()]);
      const productsWithIdentity = catalog.map((product) => attachCatalogIdentity(product, identities));
      unmappedProductCount = productsWithIdentity.filter((product) => !product.legacyId).length;
      normalized = getLegacyCampaignPickerProducts(productsWithIdentity);
    } else {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('id, name, title, slug, category, price, image_url, is_available, hidden')
        .or('hidden.is.null,hidden.eq.false')
        .order('name', { ascending: true })
        .limit(250);

      if (error) throw error;

      normalized = (data || []).map((product) => ({
        id: product.id,
        name: product.name || product.title || product.slug || 'Untitled product',
        slug: product.slug,
        category: product.category,
        price: product.price == null ? null : Number(product.price),
        imageUrl: product.image_url,
        isAvailable: product.is_available !== false,
      }));
    }

    const products = query
      ? normalized.filter((product) => {
          const haystack = `${product.name} ${product.slug || ''} ${product.category || ''}`.toLowerCase();
          return haystack.includes(query);
        }).slice(0, 50)
      : normalized;

    return NextResponse.json({
      products,
      commerceSource: shopifyCatalog ? 'shopify' : 'legacy',
      monetaryManagedByShopify: shopifyCatalog,
      unmappedProductCount,
      ...(shopifyCatalog && {
        message: 'Shopify manages live discounts. These selections preserve campaign drafts and history.',
      }),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err) {
    console.error('[Admin Products] Picker error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
