"use client";

import { useState, useEffect, useRef } from 'react';
import { posthog } from '@/components/providers/posthog-provider';

/**
 * Mobile Sticky Add To Cart Bar
 *
 * Appears on mobile (<768px) after the user scrolls past the product image.
 * Shows product name, price, and an Add To Cart button that uses the
 * currently selected variant/size from the parent ProductDetail component.
 */
export default function MobileStickyATC({
  productName,
  price,
  isMember,
  onAddToCart,
  cartState,
  needsSelection,
  galleryRef,
  isSoldOut,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const hasTrackedView = useRef(false);

  // Use IntersectionObserver to show bar when gallery scrolls out of view
  useEffect(() => {
    if (!galleryRef?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when gallery is NOT intersecting (scrolled past)
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    );

    observer.observe(galleryRef.current);
    return () => observer.disconnect();
  }, [galleryRef]);

  // Track when the sticky bar becomes visible (once per page view)
  useEffect(() => {
    if (isVisible && !hasTrackedView.current) {
      hasTrackedView.current = true;
      posthog?.capture?.('sticky_add_to_cart_viewed', {
        product_title: productName,
      });
    }
  }, [isVisible, productName]);

  if (isSoldOut) return null;

  const displayPrice = isMember ? (price * 0.9).toFixed(2) : price?.toFixed(2);
  const buttonLabel =
    cartState === 'loading' ? 'Adding...'
    : cartState === 'success' ? 'Added ✓'
    : 'Add to Cart';
  const isDisabled = cartState === 'loading' || cartState === 'success';

  function handleClick() {
    posthog?.capture?.('sticky_add_to_cart_clicked', {
      product_title: productName,
      price: price,
      needs_selection: needsSelection,
    });

    if (needsSelection) {
      // Scroll to the variant/size selector area
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    onAddToCart();
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        backgroundColor: '#08080f',
        borderTop: '1px solid rgba(201, 169, 110, 0.2)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Product name + price */}
        <div className="flex-1 min-w-0">
          <p
            className="truncate text-sm"
            style={{ color: '#e8e4dc', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            {productName}
          </p>
          <p
            className="text-sm"
            style={{ color: isMember ? '#c9a96e' : '#e8e4dc', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            ${displayPrice}
            {isMember && (
              <span className="ml-1 text-[10px] uppercase tracking-wider" style={{ color: '#c9a96e', opacity: 0.7 }}>
                Sanctuary
              </span>
            )}
          </p>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleClick}
          disabled={isDisabled}
          className={`shrink-0 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.12em] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a96e] ${
            cartState === 'success'
              ? 'border-[#c9a96e] bg-[rgba(201,169,110,0.12)] text-[#c9a96e]'
              : 'border-[#c9a96e] bg-transparent text-[#c9a96e] hover:bg-[rgba(201,169,110,0.15)]'
          } disabled:opacity-50`}
          style={{ border: '1px solid #c9a96e', fontFamily: 'Inter, sans-serif' }}
        >
          {needsSelection ? 'Select Options' : buttonLabel}
        </button>
      </div>
    </div>
  );
}
