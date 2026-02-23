/**
 * Shopify Storefront API Client
 * Consolidated client for all storefront operations
 */

import { getStorefrontEndpoint, getStorefrontToken, getStoreDomain } from './config';
import type { ShopifyProduct, ShopifyCollection, Product, Collection, Cart } from './types';

/**
 * Execute Shopify Storefront GraphQL query with robust error handling
 * @param query - GraphQL query string
 * @param variables - Query variables
 * @returns Query result or null on error
 */
export async function storefrontRequest<T>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T | null> {
  try {
    const endpoint = getStorefrontEndpoint();
    const token = getStorefrontToken();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify Storefront API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const json = await response.json();

    if (json.errors) {
      const errorMessages = json.errors.map((e: any) => e.message).join(', ');
      throw new Error(`Shopify GraphQL errors: ${errorMessages}`);
    }

    return json.data as T;
  } catch (error) {
    // Check if credentials are missing
    if (error instanceof Error && error.message.includes('is not configured')) {
      console.error('Shopify Storefront API credentials not configured');
      return null;
    }
    
    console.error('Shopify Storefront API request failed:', error);
    throw error;
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

  const data = await storefrontRequest<{ collection: ShopifyCollection | null }>(query, { handle, limit });

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

  const data = await storefrontRequest<{ product: ShopifyProduct | null }>(query, { handle });

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

    const data = await storefrontRequest<{ products: { edges: Array<{ node: ShopifyProduct }> } }>(
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

  const data = await storefrontRequest<{ cartCreate: { cart: Cart } }>(query);
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

  const data = await storefrontRequest<{ cartLinesAdd: { cart: Cart } }>(query, {
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

  const data = await storefrontRequest<{ cart: Cart | null }>(query, { cartId });
  return data?.cart || null;
}
