import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServer } from '@/lib/supabase/server';
import { transformShopifyOrder, ShopifyOrder } from '@/lib/shopify/admin';

// CRITICAL: Disable Next.js body parsing to access raw request body
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Shopify orders/create webhook handler
 * 
 * CRITICAL REQUIREMENTS:
 * 1. HMAC verification MUST use raw request body bytes (before JSON parsing)
 * 2. Idempotency enforced via UNIQUE(shopify_order_id) constraint
 * 3. Return 200 OK for verified duplicates to prevent Shopify retries
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Read raw body as Buffer (BEFORE any parsing)
    // CRITICAL: No middleware can touch this body before HMAC verification
    const rawBody = Buffer.from(await request.arrayBuffer());

    // Step 2: Get HMAC signature from header
    const signature = request.headers.get('X-Shopify-Hmac-SHA256');

    if (!signature) {
      console.error('Missing Shopify HMAC signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Step 3: Verify HMAC signature using raw body
    const isValid = verifyShopifyWebhook(rawBody, signature);

    if (!isValid) {
      console.error('Invalid Shopify webhook signature');
      await logWebhookEvent({
        event_type: 'orders/create',
        shopify_order_id: null,
        verification_status: 'failed',
        processing_status: 'failed',
        error_message: 'Invalid HMAC signature',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 4: NOW parse JSON after verification
    const order: ShopifyOrder = JSON.parse(rawBody.toString());
    const shopifyOrderId = order.id.toString();

    console.log(`Processing webhook for order ${shopifyOrderId}`);

    // Step 5: Store order with idempotency (upsert pattern)
    const result = await storeOrder(order);

    if (result.isDuplicate) {
      console.log(`Order ${shopifyOrderId} already processed (duplicate webhook)`);
      // Return 200 OK to prevent Shopify retries
      return NextResponse.json({ message: 'Duplicate order, already processed' });
    }

    // Step 6: Log successful processing
    await logWebhookEvent({
      event_type: 'orders/create',
      shopify_order_id: shopifyOrderId,
      verification_status: 'success',
      processing_status: 'success',
    });

    console.log(`Order ${shopifyOrderId} processed successfully`);

    // Return 200 OK
    return NextResponse.json({ message: 'Order processed' });
  } catch (error) {
    console.error('Webhook processing failed:', error);

    // Log error
    await logWebhookEvent({
      event_type: 'orders/create',
      shopify_order_id: null,
      verification_status: 'success',
      processing_status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    // Return 500 error - Shopify will retry
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verify Shopify webhook HMAC signature
 * CRITICAL: Must use raw request body bytes
 */
function verifyShopifyWebhook(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('SHOPIFY_WEBHOOK_SECRET not configured');
  }

  // Compute HMAC on raw body (NOT parsed JSON)
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  // Timing-safe comparison
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

/**
 * Store order in database with idempotency
 * Uses upsert pattern with UNIQUE constraint on shopify_order_id
 */
async function storeOrder(
  shopifyOrder: ShopifyOrder
): Promise<{ isDuplicate: boolean }> {
  const supabase = getSupabaseServer();
  const orderData = transformShopifyOrder(shopifyOrder);

  // Check if order already exists (idempotency check)
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('shopify_order_id', orderData.shopify_order_id)
    .single();

  if (existing) {
    // Duplicate webhook - return success without reprocessing
    return { isDuplicate: true };
  }

  // Insert new order
  const { error } = await supabase.from('orders').insert({
    shopify_order_id: orderData.shopify_order_id,
    order_number: orderData.order_number,
    line_items: orderData.line_items,
    shipping_address: orderData.shipping_address,
    total_price: orderData.total_price,
    currency: orderData.currency,
  });

  if (error) {
    // Check if unique constraint violation (duplicate)
    if (isUniqueConstraintViolation(error)) {
      console.log('Unique constraint violation - duplicate order');
      return { isDuplicate: true };
    }

    // Other errors should be thrown
    throw error;
  }

  return { isDuplicate: false };
}

/**
 * Detect unique constraint violations (database-agnostic)
 */
function isUniqueConstraintViolation(error: any): boolean {
  // PostgreSQL unique constraint error code
  return error.code === '23505';
}

/**
 * Log webhook event for debugging
 */
async function logWebhookEvent(log: {
  event_type: string;
  shopify_order_id: string | null;
  verification_status: 'success' | 'failed';
  processing_status: 'success' | 'failed';
  error_message?: string;
}): Promise<void> {
  try {
    const supabase = getSupabaseServer();
    await supabase.from('webhook_logs').insert(log);
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}
