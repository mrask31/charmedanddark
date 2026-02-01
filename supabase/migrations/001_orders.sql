-- Orders table for webhook-stored order data
-- Idempotency enforced via UNIQUE constraint on shopify_order_id

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_order_id VARCHAR(255) NOT NULL,
  order_number VARCHAR(255) NOT NULL,
  line_items JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Idempotency constraint: prevent duplicate order processing
  CONSTRAINT unique_shopify_order_id UNIQUE (shopify_order_id)
);

-- Index for faster lookups
CREATE INDEX idx_orders_shopify_order_id ON orders(shopify_order_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Webhook logs for debugging
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  shopify_order_id VARCHAR(255),
  verification_status VARCHAR(20) NOT NULL,
  processing_status VARCHAR(20) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
