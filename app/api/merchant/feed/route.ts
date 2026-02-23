import { NextResponse } from 'next/server';
import { 
  fetchProductsForMerchantFeed, 
  stripHtml, 
  getGoogleProductCategory,
  extractNumericId,
  type MerchantProduct 
} from '@/lib/shopify/merchant';
import { getCanonicalUrl, getSiteUrl } from '@/lib/config/site';

/**
 * Google Merchant Center Product Feed
 * Returns XML feed with product data for Google Shopping
 * Uses Shopify Admin API (not Storefront API)
 * 
 * One item per VARIANT (not per product)
 */

const BRAND_NAME = 'Charmed & Dark';

function getDefaultShipping(): string {
  return process.env.GOOGLE_FEED_DEFAULT_SHIPPING_USD || '0';
}

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
  let totalVariants = 0;
  let skippedVariants = 0;

  const items = products.flatMap(product => {
    const productId = extractNumericId(product.id);
    const imageUrl = product.featuredImage?.url || '';
    const link = getCanonicalUrl(`/product/${product.handle}`);
    const description = stripHtml(product.description || product.title);
    const googleCategory = getGoogleProductCategory(product.productType);
    const defaultShipping = getDefaultShipping();

    // Generate one item per variant
    return product.variants.edges.map(({ node: variant }) => {
      totalVariants++;

      // Skip variants without images
      if (!imageUrl) {
        skippedVariants++;
        console.warn(`[Merchant Feed] Skipping variant ${variant.id} - no image`);
        return '';
      }

      const variantId = extractNumericId(variant.id);
      const price = parseFloat(variant.price);
      const availability = variant.availableForSale ? 'in_stock' : 'out_of_stock';
      
      // Build variant title: "Product Title - Variant Title" (unless variant is "Default Title")
      const variantTitle = variant.title && variant.title !== 'Default Title'
        ? `${product.title} - ${variant.title}`
        : product.title;

      // Use variant SKU if available, otherwise use variant ID as MPN
      const mpn = variant.sku || variantId;

      return `    <item>
      <g:id>${escapeXml(variantId)}</g:id>
      <g:item_group_id>${escapeXml(productId)}</g:item_group_id>
      <g:title>${escapeXml(variantTitle)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price.toFixed(2)} USD</g:price>
      <g:brand>${escapeXml(BRAND_NAME)}</g:brand>
      <g:condition>new</g:condition>
      <g:mpn>${escapeXml(mpn)}</g:mpn>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>${defaultShipping} USD</g:price>
      </g:shipping>
    </item>`;
    }).filter(item => item);
  }).join('\n');

  console.log(`[Merchant Feed] Generated ${totalVariants} total variants, skipped ${skippedVariants}`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(BRAND_NAME)} Product Feed</title>
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
    
    // Return valid XML with error comment
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(BRAND_NAME)} Product Feed</title>
    <link>https://charmedanddark.vercel.app</link>
    <description>Premium home goods and apparel</description>
    <!-- Configuration Error: Missing required environment variables: ${escapeXml(missingVars.join(', '))} -->
  </channel>
</rss>`;

    return new NextResponse(errorXml, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }

  // Log configuration (never log secrets)
  console.log('[Merchant Feed] Configuration:', {
    siteUrl: getSiteUrl(),
    defaultShipping: getDefaultShipping(),
    brand: BRAND_NAME,
  });

  try {
    const products = await fetchProductsForMerchantFeed();
    
    if (products.length === 0) {
      console.warn('[Merchant Feed] No products found, returning empty feed');
    } else {
      const totalVariants = products.reduce((sum, p) => sum + p.variants.edges.length, 0);
      console.log(`[Merchant Feed] Fetched ${products.length} products with ${totalVariants} total variants`);
    }

    const xml = buildXmlFeed(products);

    console.log(`[Merchant Feed] Successfully generated feed`);

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
    <title>${escapeXml(BRAND_NAME)} Product Feed</title>
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
