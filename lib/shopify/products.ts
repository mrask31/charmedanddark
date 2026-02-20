/**
 * Shopify Storefront API - Product fetching
 * Fetches the 15 apparel items
 */

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        priceV2: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
}

interface ShopifyProductsResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
}

/**
 * Fetch all apparel products from Shopify Storefront API
 */
export async function getShopifyProducts(): Promise<ShopifyProduct[]> {
  const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!storefrontToken || !storeDomain) {
    console.log('Shopify credentials not configured - skipping Shopify products');
    return [];
  }

  const query = `
    query getProducts {
      products(first: 15) {
        edges {
          node {
            id
            handle
            title
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 3) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${storeDomain}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontToken,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data: { data: ShopifyProductsResponse; errors?: any[] } = await response.json();

    if (data.errors) {
      console.error('Shopify Storefront API errors:', data.errors);
      return [];
    }

    return data.data?.products.edges.map((edge) => edge.node) || [];
  } catch (error) {
    console.error('Failed to fetch Shopify products:', error);
    return [];
  }
}
