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
        price: string;
        compareAtPrice?: string;
        sku?: string;
        availableForSale: boolean;
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
          variants(first: 1) {
            edges {
              node {
                id
                price
                compareAtPrice
                sku
                availableForSale
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
