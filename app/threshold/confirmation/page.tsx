import { verifyConfirmationToken } from '@/lib/confirmToken';
import { getSupabaseServer, Order } from '@/lib/supabase/server';
import { getOrder, transformShopifyOrder } from '@/lib/shopify/admin';
import ConfirmationView from './ConfirmationView';
import CalmRetry from './CalmRetry';
import CalmError from './CalmError';

/**
 * Order confirmation page
 * 
 * CRITICAL REQUIREMENTS:
 * 1. Requires signed token (base64url) with expiry check
 * 2. Loads from DB first (webhook data), then Admin API fallback
 * 3. Server-side only (no client-side API calls)
 * 4. Calm retry if data not available (no aggressive polling)
 */
export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { t?: string };
}) {
  const token = searchParams.t;

  // Verify token is present
  if (!token) {
    return (
      <CalmError message="Unable to display confirmation. Please check your email for order details." />
    );
  }

  // Verify token signature and expiry
  const payload = verifyConfirmationToken(token);

  if (!payload) {
    return (
      <CalmError message="Unable to display confirmation. Please check your email for order details." />
    );
  }

  // Try database first (webhook-stored data)
  const supabase = getSupabaseServer();
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('shopify_order_id', payload.order_id)
    .single();

  if (order) {
    // Order found in database - display full confirmation
    return <ConfirmationView order={order as Order} />;
  }

  // Fallback to Shopify Admin API (webhook hasn't arrived yet)
  try {
    const shopifyOrder = await getOrder(payload.order_id);

    if (shopifyOrder) {
      // Order found via Admin API - display confirmation
      const orderData = transformShopifyOrder(shopifyOrder);

      // Optionally store in database for future requests
      await supabase.from('orders').insert({
        shopify_order_id: orderData.shopify_order_id,
        order_number: orderData.order_number,
        line_items: orderData.line_items,
        shipping_address: orderData.shipping_address,
        total_price: orderData.total_price,
        currency: orderData.currency,
      });

      return <ConfirmationView order={orderData as any} />;
    }
  } catch (error) {
    console.error('Admin API fallback failed:', error);
  }

  // Order not found - show calm retry
  return <CalmRetry />;
}
