'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPinterestPage } from '@/lib/pinterest-tracking';

export function PinterestPageView() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) trackPinterestPage(window, document, pathname);
  }, [pathname]);
  return null;
}
