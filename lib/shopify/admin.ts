/**
 * Shopify Admin REST API client
 * Used for: Fallback order fetch when webhook hasn't arrived
 * Uses REST numeric order IDs for simplicity
 */

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

/**
 * Fetch order from Shopify Admin REST API
 * @param orderId - REST numeric order ID (e.g., 1234567890)
 */
export async function getOrder(orderId: string): Promise<ShopifyOrder | null> {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    throw new Error('Missing Shopify Admin API credentials');
  }

  try {
    const response = await fetch(
      `https://${storeDomain}/admin/api/2024-01/orders/${orderId}.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': adminToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Order not found
      }
      throw new Error(`Shopify Admin API error: ${response.status}`);
    }

    const data = await response.json();
    return data.order || null;
  } catch (error) {
    console.error('Failed to fetch order from Shopify:', error);
    return null;
  }
}

/**
 * Transform Shopify order to internal Order format
 */
export function transformShopifyOrder(shopifyOrder: ShopifyOrder) {
  return {
    shopify_order_id: shopifyOrder.id.toString(),
    order_number: `#${shopifyOrder.order_number}`,
    line_items: shopifyOrder.line_items.map((item) => ({
      product_id: item.product_id.toString(),
      variant_id: item.variant_id.toString(),
      title: item.title,
      variant_title: item.variant_title || undefined,
      quantity: item.quantity,
      price: parseFloat(item.price),
    })),
    shipping_address: {
      first_name: shopifyOrder.shipping_address.first_name,
      last_name: shopifyOrder.shipping_address.last_name,
      address1: shopifyOrder.shipping_address.address1,
      address2: shopifyOrder.shipping_address.address2 || undefined,
      city: shopifyOrder.shipping_address.city,
      province: shopifyOrder.shipping_address.province,
      country: shopifyOrder.shipping_address.country,
      zip: shopifyOrder.shipping_address.zip,
    },
    total_price: parseFloat(shopifyOrder.total_price),
    currency: shopifyOrder.currency,
  };
}
