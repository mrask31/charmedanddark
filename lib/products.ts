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
    all?: string[]; // All images array
  };
  inStock: boolean;
  variants?: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    house_price?: number;
    stock_quantity: number;
    image_indices?: number[];
    options?: Record<string, string>;
  }>; // Product variants (for apparel with sizes)
  metadata?: {
    darkroom_url?: string; // Darkroom AI-processed image URL
    is_featured?: boolean; // Featured product flag for deep purple accent
    featured_until?: Date; // Optional expiration for featured status
    featured_reason?: string; // Context for featured status
  };
}

/**
 * Featured product metadata interface
 * Used for products that receive deep purple accent treatment
 */
export interface FeaturedProductMetadata {
  productId: string;
  isFeatured: boolean;
  featuredUntil?: Date;
  featuredReason?: string;
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

  // PRIORITY 1: Use images array from database (Darkroom processed)
  // PRIORITY 2: Use image_url from database (Google Sheets SSOT)
  // FALLBACK: Construct local path if no images
  let allImages: string[] = [];
  let heroImage = '';
  let frontImage: string | undefined;
  let hoverImage: string | undefined;

  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    // Extract URLs from images array
    allImages = product.images
      .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
      .map((img: any) => img.url);
    
    heroImage = allImages[0];
    frontImage = allImages[1];
    hoverImage = allImages[2];
  } else if (product.image_url) {
    // Fallback to single image_url
    heroImage = product.image_url;
    frontImage = product.image_url;
    hoverImage = product.image_url;
    allImages = [product.image_url];
  } else {
    // Final fallback to local paths
    heroImage = `/products/${product.handle}/hero.jpg`;
    frontImage = `/products/${product.handle}/front.jpg`;
    hoverImage = `/products/${product.handle}/hover.jpg`;
    allImages = [heroImage];
  }
  
  const images = {
    hero: heroImage,
    front: frontImage,
    hover: hoverImage,
    all: allImages,
  };

  // Extract metadata including featured status and darkroom URL
  const metadata: UnifiedProduct['metadata'] = {
    darkroom_url: (product as any).metadata?.darkroom_url,
    is_featured: (product as any).is_featured || false,
    featured_until: (product as any).featured_until ? new Date((product as any).featured_until) : undefined,
    featured_reason: (product as any).featured_reason,
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
    variants: product.variants || undefined, // Pass through variants from database
    metadata,
  };
}

/**
 * Transform Shopify product to unified format
 */
export function transformShopifyProduct(product: ShopifyProduct): UnifiedProduct {
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const allImages = product.images.edges.map(edge => edge.node.url);
  const heroImage = allImages[0] || '/images/placeholder.jpg';
  const frontImage = allImages[1];
  const hoverImage = allImages[2];

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
      all: allImages,
    },
    inStock: product.variants.edges.some((v) => v.node.availableForSale),
  };
}
