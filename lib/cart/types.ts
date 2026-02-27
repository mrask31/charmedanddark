/**
 * Cart Data Models
 * Feature: cart
 * 
 * TypeScript interfaces for cart data structures
 * Integrates with Shopify Storefront API
 */

/**
 * Core cart data from Shopify
 */
export interface Cart {
  id: string; // Shopify cart ID
  lineItems: CartLineItem[];
  subtotal: number;
  currency: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cart line item (individual product in cart)
 */
export interface CartLineItem {
  id: string; // Line item ID
  productId: string; // Shopify product ID
  variantId: string; // Shopify variant ID
  quantity: number;
  title: string;
  variantTitle?: string; // e.g., "Medium / Black"
  price: number;
  image: CartItemImage;
  metadata?: CartItemMetadata; // Optional enrichment data
}

/**
 * Cart item image data
 */
export interface CartItemImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Optional metadata for cart items
 */
export interface CartItemMetadata {
  collection: string;
  tags: string[];
  isFeatured: boolean;
}

/**
 * Cart modification result
 */
export interface CartModificationResult {
  success: boolean;
  updatedCart: Cart;
  feedback: ModificationFeedback;
  error?: string;
}

/**
 * Modification feedback for UI
 */
export interface ModificationFeedback {
  type: 'item-removed' | 'quantity-updated' | 'error';
  message: string;
  duration: number; // Display duration in ms
}
