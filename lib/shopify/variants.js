import 'server-only';
import { shopifyFetch } from './client.js';
import { PRODUCT_VARIANTS_QUERY } from './queries.js';
import { collectConnection } from './catalog.js';
import { connectionNodes, mapShopifyOptions, mapShopifyVariant } from './catalog-shape.js';

/** A simple product still has one real Shopify variant, with its own price and ID. */
export async function getShopifyVariants(shopifyId) {
  if (!shopifyId) return null;
  const data = await shopifyFetch({
    query: PRODUCT_VARIANTS_QUERY,
    variables: { id: shopifyId, country: process.env.SHOPIFY_BUYER_COUNTRY || 'US' },
    tags: [`shopify-product:${shopifyId}`],
  });
  if (!data.product) return null;
  const connection = await collectConnection(data.product.variants, async (after) => {
    const page = await shopifyFetch({
      query: PRODUCT_VARIANTS_QUERY,
      variables: { id: shopifyId, after, country: process.env.SHOPIFY_BUYER_COUNTRY || 'US' },
      tags: [`shopify-product:${shopifyId}`],
    });
    return page.product?.variants;
  });
  return {
    options: mapShopifyOptions(data.product.options),
    variants: connectionNodes(connection).map(mapShopifyVariant),
  };
}
