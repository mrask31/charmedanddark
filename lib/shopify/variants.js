import { shopifyFetch } from './client';
import { PRODUCT_VARIANTS_QUERY } from './queries';

/**
 * Fetch product variants from Shopify Storefront API.
 * The shopify_variant_id in Supabase is the numeric Shopify Product ID.
 * We convert it to a GID and query for all variants.
 */
export async function getShopifyVariants(shopifyVariantId) {
  if (!shopifyVariantId) return null;

  try {
    const gid = `gid://shopify/Product/${shopifyVariantId}`;
    const data = await shopifyFetch({
      query: PRODUCT_VARIANTS_QUERY,
      variables: { id: gid },
    });

    if (!data?.product) return null;

    const product = data.product;

    // Extract option names (e.g., ["Size", "Color"])
    const options = product.options
      .filter((opt) => opt.name !== 'Title') // Skip default "Title" option
      .map((opt) => ({
        name: opt.name,
        values: opt.values,
      }));

    // Transform variants into a usable shape
    const variants = product.variants.edges.map(({ node }) => ({
      shopifyVariantId: node.id, // Full GID like gid://shopify/ProductVariant/12345
      title: node.title,
      available: node.availableForSale,
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

    return { options, variants };
  } catch (err) {
    console.error('Failed to fetch Shopify variants:', err.message);
    return null;
  }
}
