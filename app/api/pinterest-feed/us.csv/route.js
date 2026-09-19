import { getShopifyProducts } from '@/lib/shopify/catalog';
import { buildPinterestCountryFeed } from '@/lib/pinterest-feed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Same paginated, public Shopify catalog and offer prices as the storefront.
    const feed = buildPinterestCountryFeed(await getShopifyProducts());
    return new Response(feed, { headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=60',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch {
    // Never replace the previous successful feed with an empty/partial catalog.
    console.error('[PinterestFeed] Catalog unavailable');
    return new Response('Product feed temporarily unavailable', { status: 503, headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': '60',
    } });
  }
}
