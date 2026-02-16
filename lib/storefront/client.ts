/**
 * Shopify Storefront API Client
 * Headless commerce data layer with resilient error handling
 */

import type { ShopifyProduct, ShopifyCollection, Product, Collection, Cart } from './types';

const STOREFRONT_API_URL = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

/**
 * Execute Shopify Storefront GraphQL query
 */
async function shopifyFetch<T>(query: string, variables: Record<string, any> = {}): Promise<T | null> {
  if (!STOREFRONT_ACCESS_TOKEN || !process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) {
    console.error('Missing Shopify Storefront API credentials');
    return null;
  }

  try {
    const response = await fetch(STOREFRONT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error(`Shopify API error: ${response.status}`);
      return null;
    }

    const json = await response.json();

    if (json.errors) {
      console.error('Shopify GraphQL errors:', json.errors);
      return null;
    }

    return json.data as T;
  } catch (error) {
    console.error('Shopify fetch error:', error);
    return null;
  }
}

/**
 * Transform Shopify product to internal format
 */
function transformProduct(shopifyProduct: ShopifyProduct): Product {
  return {
    id: shopifyProduct.id,
    handle: shopifyProduct.handle,
    title: shopifyProduct.title,
    description: shopifyProduct.description,
    price: parseFloat(shopifyProduct.priceRange.minVariantPrice.amount),
    currencyCode: shopifyProduct.priceRange.minVariantPrice.currencyCode,
    images: shopifyProduct.images.edges.map(edge => edge.node.url),
    tags: shopifyProduct.tags,
    availableForSale: shopifyProduct.availableForSale,
  };
}

/**
 * Get collection by handle with products
 */
export async function getCollectionByHandle(handle: string, limit: number = 24): Promise<Collection | null> {
  const query = `
    query getCollection($handle: String!, $limit: Int!) {
      collection(handle: $handle) {
        id
        handle
        title
        description
        products(first: $limit) {
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
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              tags
              availableForSale
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ collection: ShopifyCollection | null }>(query, { handle, limit });

  if (!data?.collection) {
    return null;
  }

  return {
    id: data.collection.id,
    handle: data.collection.handle,
    title: data.collection.title,
    description: data.collection.description,
    products: data.collection.products.edges.map(edge => transformProduct(edge.node)),
  };
}

/**
 * Get product by handle
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
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
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        tags
        availableForSale
      }
    }
  `;

  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(query, { handle });

  if (!data?.product) {
    return null;
  }

  return transformProduct(data.product);
}

/**
 * Get featured products by collection handle or tag
 */
export async function getFeaturedProducts(
  collectionHandle?: string,
  tag?: string,
  limit: number = 12
): Promise<Product[]> {
  // Try collection first
  if (collectionHandle) {
    const collection = await getCollectionByHandle(collectionHandle, limit);
    if (collection?.products.length) {
      return collection.products;
    }
  }

  // Fallback to tag-based query
  if (tag) {
    const query = `
      query getProductsByTag($tag: String!, $limit: Int!) {
        products(first: $limit, query: $tag) {
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
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              tags
              availableForSale
            }
          }
        }
      }
    `;

    const data = await shopifyFetch<{ products: { edges: Array<{ node: ShopifyProduct }> } }>(
      query,
      { tag: `tag:${tag}`, limit }
    );

    if (data?.products.edges.length) {
      return data.products.edges.map(edge => transformProduct(edge.node));
    }
  }

  return [];
}

/**
 * Create a new cart
 */
export async function createCart(): Promise<Cart | null> {
  const query = `
    mutation createCart {
      cartCreate {
        cart {
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
                      handle
                    }
                    image {
                      url
                    }
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartCreate: { cart: Cart } }>(query);
  return data?.cartCreate.cart || null;
}

/**
 * Add lines to cart
 */
export async function addToCart(cartId: string, variantId: string, quantity: number = 1): Promise<Cart | null> {
  const query = `
    mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
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
                      handle
                    }
                    image {
                      url
                    }
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartLinesAdd: { cart: Cart } }>(query, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });

  return data?.cartLinesAdd.cart || null;
}

/**
 * Get cart by ID
 */
export async function getCart(cartId: string): Promise<Cart | null> {
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
                    handle
                  }
                  image {
                    url
                  }
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cart: Cart | null }>(query, { cartId });
  return data?.cart || null;
}
