'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { BROWSE_RETURN_KEY, browseReturnSnapshot, updatedBrowseUrl } from '@/lib/browse-state';

// Native history integrates with Next's useSearchParams. A filter change replaces
// this list entry; Back from a product returns directly to that complete view.
export function updateBrowseParams(changes) {
  window.history.replaceState(null, '', updatedBrowseUrl(window.location.href, changes));
}

export function useBrowseReturn(viewKey) {
  const listRef = useRef(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const url = window.location.pathname + window.location.search;
    const saved = browseReturnSnapshot(window.history.state, url);
    if (!saved) return;
    let stopped = false;
    let frame;
    const restore = () => {
      if (stopped || window.location.pathname + window.location.search !== url) return;
      const card = [...(listRef.current?.querySelectorAll('[data-product-card]') || [])]
        .find((node) => node.dataset.productCard === saved.product);
      const top = card && Number.isFinite(saved.offset)
        ? window.scrollY + card.getBoundingClientRect().top - saved.offset : saved.y;
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    };
    const stop = () => { stopped = true; cancelAnimationFrame(frame); observer?.disconnect(); };
    // Wait for Next's route restoration, then keep the same card in place as the
    // list's reserved image areas and fonts settle. Never fight user scrolling.
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(restore); });
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
      cancelAnimationFrame(frame); frame = requestAnimationFrame(restore);
    }) : null;
    if (listRef.current) observer?.observe(listRef.current);
    const timer = setTimeout(stop, 1500);
    for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.addEventListener(event, stop, { passive: true, once: true });
    return () => {
      stop(); clearTimeout(timer);
      for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.removeEventListener(event, stop);
    };
  }, [pathname, viewKey]);

  const rememberProduct = (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank') return;
    const target = new URL(link.href, window.location.href);
    if (target.origin !== window.location.origin || !target.pathname.startsWith('/shop/')) return;
    const card = link.closest('[data-product-card]');
    window.history.replaceState({ ...window.history.state, [BROWSE_RETURN_KEY]: {
      url: window.location.pathname + window.location.search,
      y: window.scrollY, product: card?.dataset.productCard,
      offset: card?.getBoundingClientRect().top,
    } }, '', window.location.href);
  };
  return { listRef, rememberProduct };
}
