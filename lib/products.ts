/**
 * Unified product interface for both Shopify and Supabase products
 */

import { Product as SupabaseProduct } from './supabase/client';
import { ShopifyProduct } from './shopify/products';

export type ProductSource = 'shopify' | 'supabase';

export interface UnifiedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number; // Standard price in dollars
  source: ProductSource;
  category?: string;
  images: {
    hero: string;
    front?: string;
    hover?: string;
  };
  inStock: boolean;
}

/**
 * Transform Supabase product to unified format
 */
export function transformSupabaseProduct(product: SupabaseProduct): UnifiedProduct {
  // Use base_price if available, fallback to price
  const standardPrice = product.base_price || product.price;
  
  // Build description from lines if available
  let description = product.description || '';
  if (product.description_lines && product.description_lines.length > 0) {
    description = product.description_lines.join('\n');
  }

  // PRIORITY: Use image_url from database (Google Sheets SSOT)
  // FALLBACK: Construct local path if no image_url
  const heroImage = product.image_url || `/products/${product.handle}/hero.jpg`;
  const frontImage = product.image_url || `/products/${product.handle}/front.jpg`;
  const hoverImage = product.image_url || `/products/${product.handle}/hover.jpg`;
  
  const images = {
    hero: heroImage,
    front: frontImage,
    hover: hoverImage,
  };

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description,
    price: standardPrice,
    source: 'supabase',
    category: product.category || undefined,
    images,
    inStock: product.stock_quantity > 0,
  };
}

/**
 * Transform Shopify product to unified format
 */
export function transformShopifyProduct(product: ShopifyProduct): UnifiedProduct {
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const heroImage = product.images.edges[0]?.node.url || '/images/placeholder.jpg';
  const frontImage = product.images.edges[1]?.node.url;
  const hoverImage = product.images.edges[2]?.node.url;

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    price,
    source: 'shopify',
    category: 'Apparel',
    images: {
      hero: heroImage,
      front: frontImage,
      hover: hoverImage,
    },
    inStock: product.variants.edges.some((v) => v.node.availableForSale),
  };
}
