"use client";

import { useEffect, useRef } from 'react';
import { posthog } from '@/components/providers/posthog-provider';

/**
 * Product page trust module — displays trust signals directly above Add to Cart.
 * Small footprint, elegant gothic styling, no app dependencies.
 */

const TRUST_ITEMS = [
  { icon: '✓', text: 'Secure checkout' },
  { icon: '✓', text: 'Ships from trusted production partners' },
  { icon: '✓', text: 'Easy returns on eligible items' },
  { icon: '✓', text: 'Sanctuary members save 10%' },
];

export default function TrustModule({ productName }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      posthog?.capture?.('product_trust_module_viewed', {
        product_title: productName,
      });
    }
  }, [productName]);

  return (
    <div
      className="flex flex-col gap-2 py-4"
      style={{
        borderTop: '1px solid rgba(201, 169, 110, 0.12)',
        borderBottom: '1px solid rgba(201, 169, 110, 0.12)',
      }}
    >
      {TRUST_ITEMS.map((item) => (
        <div key={item.text} className="flex items-center gap-2.5">
          <span
            className="text-[11px] font-medium"
            style={{ color: '#c9a96e' }}
            aria-hidden="true"
          >
            {item.icon}
          </span>
          <span
            className="text-[12px] font-light"
            style={{ color: 'rgba(232, 228, 220, 0.55)', fontFamily: 'Inter, sans-serif' }}
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}
