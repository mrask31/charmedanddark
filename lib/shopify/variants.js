import { shopifyFetch } from './client';
import { PRODUCT_VARIANTS_QUERY } from './queries';

/**
 * Fetch product variants from Shopify Storefront API.
 * shopifyId should be the full product GID: gid://shopify/Product/...
 */
export async function getShopifyVariants(shopifyId) {
  if (!shopifyId) return null;

  try {
    const data = await shopifyFetch({
      query: PRODUCT_VARIANTS_QUERY,
      variables: { id: shopifyId },
    });

    if (!data?.product) return null;

    const product = data.product;

    // Transform variants into a usable shape
    const variants = product.variants.edges.map(({ node }) => ({
      shopifyVariantId: node.id, // Full GID like gid://shopify/ProductVariant/12345
      title: node.title,
      available: true, // POD products are always available
      quantityAvailable: node.quantityAvailable,
      selectedOptions: node.selectedOptions,
      price: parseFloat(node.price.amount),
      compareAtPrice: node.compareAtPrice
        ? parseFloat(node.compareAtPrice.amount)
        : null,
      currency: node.price.currencyCode,
      imageUrl: node.image?.url || null,
      imageAlt: node.image?.altText || null,
    }));

    // Single "Default Title" variant means no real options — skip selector
    if (variants.length === 1 && variants[0].title === 'Default Title') return null;

    // Extract option names (e.g., ["Size", "Color"])
    const options = product.options
      .filter((opt) => opt.name !== 'Title') // Skip default "Title" option
      .map((opt) => ({
        name: opt.name,
        values: opt.values,
      }));

    return { options, variants };
  } catch (err) {
    console.error('Failed to fetch Shopify variants:', err.message);
    return null;
  }
}
