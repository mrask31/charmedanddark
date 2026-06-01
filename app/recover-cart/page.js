'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { posthog } from '@/components/providers/posthog-provider';
import { useEffect, useState } from 'react';

/**
 * Abandoned Checkout Recovery Page
 *
 * Receives Shopify checkout recovery URLs from Klaviyo abandoned cart emails.
 * Presents a branded Charmed & Dark page before sending customers to Shopify checkout.
 *
 * Klaviyo URL pattern:
 * https://www.charmedanddark.com/recover-cart?checkout_url={{ checkout_url | urlencode }}&utm_source=klaviyo&utm_medium=email&utm_campaign=abandoned_checkout
 */

const TRUSTED_HOSTS = [
  'charmed-dark.myshopify.com',
  'shop.app',
  'checkout.shopify.com',
];

function isValidCheckoutUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return TRUSTED_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith('.' + host)
    );
  } catch {
    return false;
  }
}

function RecoverCartContent() {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get('checkout_url');
  const [validUrl, setValidUrl] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const decoded = rawUrl ? decodeURIComponent(rawUrl) : null;
    const isValid = isValidCheckoutUrl(decoded);
    setValidUrl(isValid ? decoded : null);
    setChecked(true);

    // Track landing
    posthog?.capture?.('abandoned_cart_recovery_landed', {
      has_checkout_url: !!rawUrl,
      url_valid: isValid,
      utm_source: searchParams.get('utm_source') || undefined,
      utm_medium: searchParams.get('utm_medium') || undefined,
      utm_campaign: searchParams.get('utm_campaign') || undefined,
    });
  }, [rawUrl, searchParams]);

  if (!checked) {
    return (
      <main
        style={{ backgroundColor: '#08080f', minHeight: '100vh' }}
        className="flex items-center justify-center"
      >
        <div style={{ color: 'rgba(232, 228, 220, 0.4)' }}>Loading...</div>
      </main>
    );
  }

  // Fallback: invalid or missing checkout URL
  if (!validUrl) {
    return (
      <main
        style={{ backgroundColor: '#08080f', minHeight: '100vh' }}
        className="flex items-center justify-center px-6"
      >
        <div className="flex flex-col items-center text-center" style={{ maxWidth: '480px' }}>
          <p
            className="text-[11px] uppercase tracking-[0.3em]"
            style={{ color: '#c9a96e', marginBottom: '16px' }}
          >
            CHARMED &amp; DARK
          </p>
          <h1
            className="font-serif text-3xl italic sm:text-4xl"
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              color: '#e8e4dc',
              marginBottom: '16px',
            }}
          >
            This link has expired.
          </h1>
          <p
            className="font-light text-base"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(232, 228, 220, 0.55)',
              marginBottom: '32px',
              lineHeight: 1.7,
            }}
          >
            The checkout link is no longer valid. Browse the shop to find what called to you.
          </p>
          <a
            href="/shop"
            className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
            style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}
          >
            Return to the Shop
          </a>
        </div>
      </main>
    );
  }

  // Valid checkout URL — show branded recovery page
  return (
    <main
      style={{ backgroundColor: '#08080f', minHeight: '100vh' }}
      className="flex items-center justify-center px-6"
    >
      <div className="flex flex-col items-center text-center" style={{ maxWidth: '520px' }}>
        <p
          className="text-[11px] uppercase tracking-[0.3em]"
          style={{ color: '#c9a96e', marginBottom: '16px' }}
        >
          CHARMED &amp; DARK
        </p>
        <h1
          className="font-serif text-3xl italic sm:text-4xl md:text-5xl"
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            color: '#e8e4dc',
            marginBottom: '16px',
            lineHeight: 1.2,
          }}
        >
          You left something behind.
        </h1>
        <p
          className="font-light text-base"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(232, 228, 220, 0.55)',
            marginBottom: '40px',
            lineHeight: 1.7,
          }}
        >
          Your cart is still waiting. Pick up where you left off — your items won&apos;t last forever.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={validUrl}
            onClick={() => {
              posthog?.capture?.('abandoned_cart_recovery_clicked', {
                action: 'continue_checkout',
                utm_source: searchParams.get('utm_source') || undefined,
                utm_medium: searchParams.get('utm_medium') || undefined,
                utm_campaign: searchParams.get('utm_campaign') || undefined,
              });
            }}
            className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
            style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}
          >
            Continue to Secure Checkout
          </a>
          <a
            href="/shop"
            onClick={() => {
              posthog?.capture?.('abandoned_cart_recovery_clicked', {
                action: 'keep_browsing',
              });
            }}
            className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8e4dc] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
            style={{ border: '1px solid rgba(232, 228, 220, 0.2)', color: '#e8e4dc' }}
          >
            Keep Browsing
          </a>
        </div>

        <p
          className="mt-8 text-xs"
          style={{ color: 'rgba(232, 228, 220, 0.3)' }}
        >
          Secure checkout powered by Shopify
        </p>
      </div>
    </main>
  );
}

export default function RecoverCartPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{ backgroundColor: '#08080f', minHeight: '100vh' }}
          className="flex items-center justify-center"
        >
          <div style={{ color: 'rgba(232, 228, 220, 0.4)' }}>Loading...</div>
        </main>
      }
    >
      <RecoverCartContent />
    </Suspense>
  );
}
