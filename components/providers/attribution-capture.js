'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { captureAttribution, storeAttribution } from '@/lib/attribution';
import { posthog } from '@/components/providers/posthog-provider';

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
      const { landing_page, referrer, captured_at, ...params } = attribution;
      posthog?.capture?.('attribution_captured', params);
    }
  }, [searchParams]);

  return null;
}
