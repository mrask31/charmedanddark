'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { captureAttribution, storeAttribution } from '@/lib/attribution';

/**
 * Captures ad/traffic attribution params on page load.
 * Headless checkout loses URL params unless passed into Shopify cart attributes.
 */
export function AttributionCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const attribution = captureAttribution();
    if (attribution) {
      storeAttribution(attribution);
      try {
        const { posthog } = require('@/components/providers/posthog-provider');
        if (posthog?.capture) {
          const { landing_page, referrer, captured_at, ...params } = attribution;
          posthog.capture('attribution_captured', params);
        }
      } catch { /* PostHog not available */ }
    }
  }, [searchParams]);

  return null;
}
