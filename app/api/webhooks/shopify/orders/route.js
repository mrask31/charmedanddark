import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

// Validate required environment variables
if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
  console.error('Missing required environment variable: SHOPIFY_WEBHOOK_SECRET');
}

// Shopify sends raw body — we need to verify HMAC before parsing
export async function POST(request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');

    // Verify HMAC signature using timing-safe comparison
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    // Use timingSafeEqual to prevent timing attacks
    const hashBuffer = Buffer.from(hash, 'base64');
    const hmacBuffer = Buffer.from(hmacHeader, 'base64');
    
    if (hashBuffer.length !== hmacBuffer.length || !crypto.timingSafeEqual(hashBuffer, hmacBuffer)) {
      console.error('Webhook HMAC verification failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the verified order data
    const order = JSON.parse(rawBody);

    // Extract order record
    const orderRecord = {
      shopify_order_id: String(order.id),
      shopify_order_number: order.order_number ? String(order.order_number) : null,
      email: order.email || order.contact_email || null,
      total_price: parseFloat(order.total_price) || 0,
      subtotal_price: parseFloat(order.subtotal_price) || 0,
      total_discount: parseFloat(order.total_discounts) || 0,
      currency: order.currency || 'USD',
      financial_status: order.financial_status || null,
      fulfillment_status: order.fulfillment_status || null,
      line_items: order.line_items?.map(item => ({
        product_id: item.product_id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        sku: item.sku,
      })) || [],
      shipping_address: order.shipping_address || null,
      customer_email: order.customer?.email || order.email || null,
      customer_name: order.customer
        ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
        : null,
      discount_codes: order.discount_codes || [],
      source: 'web',
    };

    // Upsert to Supabase
    const { error } = await supabaseAdmin
      .from('orders')
      .upsert(orderRecord, { onConflict: 'shopify_order_id' });

    if (error) {
      console.error('Order save error:', error);
      return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
    }

    console.log(`Order saved: #${orderRecord.shopify_order_number} — $${orderRecord.total_price}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
