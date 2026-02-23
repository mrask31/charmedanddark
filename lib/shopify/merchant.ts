/**
 * Shopify Admin GraphQL API for Merchant Center Feed
 * Uses Admin API to fetch product data for Google Merchant Center
 */

import { getStoreDomain, getAdminToken, SHOPIFY_API_VERSION } from './config';

export interface MerchantProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  featuredImage?: {
    url: string;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: string;
        compareAtPrice?: string;
        sku?: string;
        availableForSale: boolean;
        inventoryQuantity?: number;
      };
    }>;
  };
  status: string;
}

const PRODUCTS_QUERY = `
  query GetProductsForMerchantFeed($first: Int!, $after: String) {
    products(first: $first, after: $after, query: "status:active") {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          handle
          title
          description
          vendor
          productType
          tags
          featuredImage {
            url
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                sku
                availableForSale
                inventoryQuantity
              }
            }
          }
          status
        }
      }
    }
  }
`;

/**
 * Execute Shopify Admin GraphQL query
 */
async function adminGraphQLRequest<T>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T | null> {
  try {
    const domain = getStoreDomain();
    const token = getAdminToken();
    const endpoint = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Admin GraphQL] HTTP error:', response.status, errorText);
      throw new Error(`Shopify Admin API error: ${response.status}`);
    }

    const json = await response.json();

    if (json.errors) {
      console.error('[Admin GraphQL] GraphQL errors:', JSON.stringify(json.errors));
      throw new Error(`GraphQL errors: ${json.errors.map((e: any) => e.message).join(', ')}`);
    }

    return json.data as T;
  } catch (error) {
    console.error('[Admin GraphQL] Request failed:', error);
    return null;
  }
}

/**
 * Fetch all active products for Merchant Center feed
 * Uses Admin API with pagination support
 */
export async function fetchProductsForMerchantFeed(): Promise<MerchantProduct[]> {
  const products: MerchantProduct[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  console.log('[Merchant Feed] Starting product fetch via Admin API');

  while (hasNextPage) {
    const data: {
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string };
        edges: Array<{ node: MerchantProduct }>;
      };
    } | null = await adminGraphQLRequest<{
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string };
        edges: Array<{ node: MerchantProduct }>;
      };
    }>(PRODUCTS_QUERY, {
      first: 250,
      after: cursor,
    });

    if (!data) {
      throw new Error('Failed to fetch products from Shopify Admin API');
    }

    const fetchedCount = data.products.edges.length;
    products.push(...data.products.edges.map(edge => edge.node));
    
    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;

    console.log(`[Merchant Feed] Fetched ${fetchedCount} products (total: ${products.length})`);
  }

  console.log(`[Merchant Feed] Completed fetch: ${products.length} total products`);
  return products;
}

/**
 * Strip HTML tags from description
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Map Shopify product type to Google Product Category
 * https://support.google.com/merchants/answer/6324436
 */
export function getGoogleProductCategory(productType: string): string {
  const type = productType.toLowerCase();
  
  // Apparel categories
  if (type.includes('hoodie') || type.includes('sweatshirt')) {
    return 'Apparel & Accessories > Clothing > Activewear > Hoodies & Sweatshirts';
  }
  if (type.includes('t-shirt') || type.includes('tee') || type.includes('shirt')) {
    return 'Apparel & Accessories > Clothing > Shirts & Tops';
  }
  if (type.includes('hat') || type.includes('cap') || type.includes('beanie')) {
    return 'Apparel & Accessories > Clothing Accessories > Hats';
  }
  if (type.includes('jacket') || type.includes('coat')) {
    return 'Apparel & Accessories > Clothing > Outerwear > Coats & Jackets';
  }
  if (type.includes('pant') || type.includes('jean') || type.includes('trouser')) {
    return 'Apparel & Accessories > Clothing > Pants';
  }
  
  // Home & Decor categories
  if (type.includes('candle')) {
    return 'Home & Garden > Decor > Home Fragrance Accessories > Candles';
  }
  if (type.includes('mug') || type.includes('cup') || type.includes('drinkware')) {
    return 'Home & Garden > Kitchen & Dining > Tableware > Drinkware';
  }
  if (type.includes('pillow') || type.includes('cushion')) {
    return 'Home & Garden > Decor > Pillows';
  }
  if (type.includes('blanket') || type.includes('throw')) {
    return 'Home & Garden > Linens & Bedding > Blankets';
  }
  if (type.includes('poster') || type.includes('print') || type.includes('art')) {
    return 'Home & Garden > Decor > Artwork > Posters, Prints, & Visual Artwork';
  }
  
  // Default category
  return 'Home & Garden > Decor';
}

/**
 * Extract numeric ID from Shopify GID
 * e.g., "gid://shopify/Product/123456" -> "123456"
 */
export function extractNumericId(gid: string): string {
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : gid;
}
