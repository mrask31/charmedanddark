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
  retailPrice = null,
  isOnSale = false,
  salePercentage = null,
  isMember,
  onAddToCart,
  cartState,
  needsSelection,
  galleryRef,
  isSoldOut,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (!galleryRef?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    );

    observer.observe(galleryRef.current);
    return () => observer.disconnect();
  }, [galleryRef]);

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
      price,
      retail_price: retailPrice,
      sale_percentage: salePercentage,
      needs_selection: needsSelection,
    });

    if (needsSelection) {
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
        <div className="flex-1 min-w-0">
          <p
            className="truncate text-sm"
            style={{ color: '#e8e4dc', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            {productName}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {isOnSale && retailPrice > price && (
              <span
                className="text-[11px] line-through"
                style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}
              >
                ${retailPrice.toFixed(2)}
              </span>
            )}
            <span
              className="text-sm"
              style={{ color: isMember ? '#c9a96e' : '#e8e4dc', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
            >
              ${displayPrice}
            </span>
            {isOnSale && salePercentage && !isMember && (
              <span className="text-[9px] uppercase tracking-[0.12em]" style={{ color: '#c9a96e' }}>
                {salePercentage}% off
              </span>
            )}
            {isMember && (
              <span className="text-[10px] uppercase tracking-wider" style={{ color: '#c9a96e', opacity: 0.7 }}>
                Sanctuary
              </span>
            )}
          </div>
        </div>

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
