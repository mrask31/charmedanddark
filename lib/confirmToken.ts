import crypto from 'crypto';

export interface TokenPayload {
  order_id: string; // REST numeric order ID
  issued_at: number;
  expires_at: number;
}

/**
 * Generate signed confirmation token (base64url encoded)
 * Token format: {base64url_payload}.{base64url_signature}
 * Expiry: 1 hour from issuance
 */
export function generateConfirmationToken(orderId: string): string {
  const secret = process.env.APP_SECRET;
  
  if (!secret || secret.length < 32) {
    throw new Error('APP_SECRET must be at least 32 characters');
  }

  const payload: TokenPayload = {
    order_id: orderId,
    issued_at: Date.now(),
    expires_at: Date.now() + 3600000, // 1 hour
  };

  // Base64url encode payload (URL-safe)
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify signed confirmation token
 * Returns payload if valid, null if invalid or expired
 */
export function verifyConfirmationToken(token: string): TokenPayload | null {
  const secret = process.env.APP_SECRET;
  
  if (!secret) {
    throw new Error('APP_SECRET not configured');
  }

  try {
    const [payloadBase64, signature] = token.split('.');

    if (!payloadBase64 || !signature) {
      return null;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null; // Invalid signature
    }

    // Parse payload
    const payload: TokenPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString()
    );

    // Check expiry
    if (Date.now() > payload.expires_at) {
      return null; // Expired
    }

    return payload;
  } catch (error) {
    return null; // Invalid token format
  }
}
