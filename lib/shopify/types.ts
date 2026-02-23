/**
 * Shopify API Types
 * Shared types for Storefront and Admin APIs
 */

// ============================================================================
// Storefront API Types
// ============================================================================

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
  tags: string[];
  availableForSale: boolean;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  currencyCode: string;
  images: string[];
  tags: string[];
  availableForSale: boolean;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  products: Product[];
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  lines: CartLine[];
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
    };
    image?: {
      url: string;
    };
    priceV2: {
      amount: string;
      currencyCode: string;
    };
  };
}

// ============================================================================
// Admin API Types
// ============================================================================

export interface ShopifyOrder {
  id: number; // REST numeric order ID
  order_number: number;
  line_items: ShopifyLineItem[];
  shipping_address: ShopifyShippingAddress;
  total_price: string;
  currency: string;
  created_at: string;
}

export interface ShopifyLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  title: string;
  variant_title: string | null;
  quantity: number;
  price: string;
}

export interface ShopifyShippingAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
}
