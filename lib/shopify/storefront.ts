/**
 * Shopify Storefront API client
 * Used for: Reading cart.checkoutUrl
 */

interface StorefrontCart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          product: {
            title: string;
          };
        };
      };
    }>;
  };
}

export async function getCart(cartId: string): Promise<StorefrontCart | null> {
  const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!storefrontToken || !storeDomain) {
    throw new Error('Missing Shopify Storefront API credentials');
  }

  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                  }
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
        body: JSON.stringify({
          query,
          variables: { cartId },
        }),
      }
    );

    const data = await response.json();

    if (data.errors) {
      console.error('Shopify Storefront API errors:', data.errors);
      return null;
    }

    return data.data?.cart || null;
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return null;
  }
}
