import { NextResponse } from 'next/server';
import { fetchProductsForMerchantFeed, stripHtml, type MerchantProduct } from '@/lib/shopify/merchant';
import { getCanonicalUrl } from '@/lib/config/site';

/**
 * Google Merchant Center Product Feed
 * Returns XML feed with product data for Google Shopping
 * Uses Shopify Admin API (not Storefront API)
 */

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildXmlFeed(products: MerchantProduct[]): string {
  const items = products.map(product => {
    // Get first variant for pricing
    const firstVariant = product.variants.edges[0]?.node;
    if (!firstVariant) return ''; // Skip products without variants

    const price = parseFloat(firstVariant.price);
    const imageUrl = product.featuredImage?.url || '';
    const link = getCanonicalUrl(`/product/${product.handle}`);
    const availability = firstVariant.availableForSale ? 'in_stock' : 'out_of_stock';
    const description = stripHtml(product.description || product.title);
    
    return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price.toFixed(2)} USD</g:price>
      <g:brand>${escapeXml(product.vendor || 'Charmed &amp; Dark')}</g:brand>
      <g:condition>new</g:condition>${product.productType ? `\n      <g:product_type>${escapeXml(product.productType)}</g:product_type>` : ''}${firstVariant.sku ? `\n      <g:mpn>${escapeXml(firstVariant.sku)}</g:mpn>` : ''}
    </item>`;
  }).filter(item => item).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Charmed &amp; Dark Product Feed</title>
    <link>${escapeXml(getCanonicalUrl('/'))}</link>
    <description>Premium home goods and apparel</description>
${items}
  </channel>
</rss>`;
}

export async function GET() {
  console.log('[Merchant Feed] Request received');
  
  // Check required environment variables
  const requiredEnvVars = {
    'SHOPIFY_ADMIN_ACCESS_TOKEN': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    'NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN': process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    'NEXT_PUBLIC_SITE_URL': process.env.NEXT_PUBLIC_SITE_URL,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('[Merchant Feed] Missing environment variables:', missingVars.join(', '));
    return NextResponse.json(
      { 
        error: 'Server configuration error',
        details: `Missing required environment variables: ${missingVars.join(', ')}`
      },
      { status: 500 }
    );
  }

  try {
    const products = await fetchProductsForMerchantFeed();
    
    if (products.length === 0) {
      console.warn('[Merchant Feed] No products found, returning empty feed');
    }

    const xml = buildXmlFeed(products);

    console.log(`[Merchant Feed] Successfully generated feed with ${products.length} products`);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[Merchant Feed] Error generating feed:', error);
    
    // Return valid XML with error comment instead of JSON error
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Charmed &amp; Dark Product Feed</title>
    <link>${escapeXml(getCanonicalUrl('/'))}</link>
    <description>Premium home goods and apparel</description>
    <!-- Error: ${escapeXml(error instanceof Error ? error.message : 'Unknown error')} -->
  </channel>
</rss>`;

    return new NextResponse(errorXml, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
