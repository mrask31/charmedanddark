/**
 * Shopify Cart Integration
 * Feature: cart
 * 
 * Functions for cart operations with Shopify Storefront API
 * Transforms Shopify cart data to internal Cart interface
 */

import {
  createCart as shopifyCreateCart,
  addToCart as shopifyAddToCart,
  getCart as shopifyGetCart,
  storefrontRequest,
} from '@/lib/shopify/storefront';
import type { Cart as ShopifyCart, CartLine as ShopifyCartLine } from '@/lib/shopify/types';
import type { Cart, CartLineItem, CartItemImage, CartModificationResult, ModificationFeedback } from './types';

/**
 * Transform Shopify cart to internal Cart format
 */
function transformShopifyCart(shopifyCart: ShopifyCart): Cart {
  const lineItems: CartLineItem[] = shopifyCart.lines.map(transformShopifyCartLine);
  
  return {
    id: shopifyCart.id,
    lineItems,
    subtotal: parseFloat(shopifyCart.cost.totalAmount.amount),
    currency: shopifyCart.cost.totalAmount.currencyCode,
    itemCount: lineItems.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: new Date(), // Shopify doesn't provide this in Storefront API
    updatedAt: new Date(),
  };
}

/**
 * Transform Shopify cart line to internal CartLineItem format
 */
function transformShopifyCartLine(line: ShopifyCartLine): CartLineItem {
  const merchandise = line.merchandise;
  
  return {
    id: line.id,
    productId: merchandise.product.handle, // Use handle as product ID
    variantId: merchandise.id,
    quantity: line.quantity,
    title: merchandise.product.title,
    variantTitle: merchandise.title !== 'Default Title' ? merchandise.title : undefined,
    price: parseFloat(merchandise.priceV2.amount),
    image: {
      url: merchandise.image?.url || '/images/placeholder.jpg',
      alt: merchandise.product.title,
      width: 120,
      height: 120,
    },
  };
}

/**
 * Fetch cart from Shopify
 * @param cartId - Shopify cart ID
 * @returns Cart data or null if not found
 */
export async function fetchCart(cartId: string): Promise<Cart | null> {
  try {
    const shopifyCart = await shopifyGetCart(cartId);
    
    if (!shopifyCart) {
      return null;
    }
    
    return transformShopifyCart(shopifyCart);
  } catch (error) {
    console.error('[Cart] Failed to fetch cart:', error);
    return null;
  }
}

/**
 * Create a new cart
 * @returns New cart data
 */
export async function createCart(): Promise<Cart | null> {
  try {
    const shopifyCart = await shopifyCreateCart();
    
    if (!shopifyCart) {
      return null;
    }
    
    return transformShopifyCart(shopifyCart);
  } catch (error) {
    console.error('[Cart] Failed to create cart:', error);
    return null;
  }
}

/**
 * Add item to cart
 * @param cartId - Shopify cart ID
 * @param variantId - Shopify variant ID
 * @param quantity - Quantity to add
 * @returns Updated cart data
 */
export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<Cart | null> {
  try {
    const shopifyCart = await shopifyAddToCart(cartId, variantId, quantity);
    
    if (!shopifyCart) {
      return null;
    }
    
    return transformShopifyCart(shopifyCart);
  } catch (error) {
    console.error('[Cart] Failed to add line item:', error);
    return null;
  }
}

/**
 * Update line item quantity
 * @param cartId - Shopify cart ID
 * @param lineItemId - Line item ID
 * @param quantity - New quantity
 * @returns Updated cart data
 */
export async function updateLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<CartModificationResult> {
  try {
    const query = `
      mutation updateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
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

    const data = await storefrontRequest<{ cartLinesUpdate: { cart: ShopifyCart } }>(query, {
      cartId,
      lines: [{ id: lineItemId, quantity }],
    });

    if (!data?.cartLinesUpdate.cart) {
      return {
        success: false,
        updatedCart: await fetchCart(cartId) as Cart,
        feedback: {
          type: 'error',
          message: 'Unable to update quantity. Please try again.',
          duration: 3000,
        },
        error: 'Failed to update cart line',
      };
    }

    const updatedCart = transformShopifyCart(data.cartLinesUpdate.cart);

    return {
      success: true,
      updatedCart,
      feedback: {
        type: 'quantity-updated',
        message: 'Quantity updated',
        duration: 2000,
      },
    };
  } catch (error) {
    console.error('[Cart] Failed to update line item:', error);
    
    return {
      success: false,
      updatedCart: await fetchCart(cartId) as Cart,
      feedback: {
        type: 'error',
        message: 'Unable to update quantity. Please try again.',
        duration: 3000,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Remove line item from cart
 * @param cartId - Shopify cart ID
 * @param lineItemId - Line item ID
 * @returns Updated cart data
 */
export async function removeLineItem(
  cartId: string,
  lineItemId: string
): Promise<CartModificationResult> {
  try {
    const query = `
      mutation removeCartLines($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
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

    const data = await storefrontRequest<{ cartLinesRemove: { cart: ShopifyCart } }>(query, {
      cartId,
      lineIds: [lineItemId],
    });

    if (!data?.cartLinesRemove.cart) {
      return {
        success: false,
        updatedCart: await fetchCart(cartId) as Cart,
        feedback: {
          type: 'error',
          message: 'Unable to remove item. Please try again.',
          duration: 3000,
        },
        error: 'Failed to remove cart line',
      };
    }

    const updatedCart = transformShopifyCart(data.cartLinesRemove.cart);

    return {
      success: true,
      updatedCart,
      feedback: {
        type: 'item-removed',
        message: 'Item removed',
        duration: 2000,
      },
    };
  } catch (error) {
    console.error('[Cart] Failed to remove line item:', error);
    
    return {
      success: false,
      updatedCart: await fetchCart(cartId) as Cart,
      feedback: {
        type: 'error',
        message: 'Unable to remove item. Please try again.',
        duration: 3000,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get checkout URL for cart
 * @param cartId - Shopify cart ID
 * @returns Checkout URL
 */
export async function getCheckoutUrl(cartId: string): Promise<string | null> {
  try {
    const cart = await shopifyGetCart(cartId);
    return cart?.checkoutUrl || null;
  } catch (error) {
    console.error('[Cart] Failed to get checkout URL:', error);
    return null;
  }
}
