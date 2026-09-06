"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSanctuaryAccess } from '@/hooks/useSanctuaryAccess';
import AddToCart from '@/app/shop/[slug]/AddToCart';
import MobileStickyATC from '@/components/shop/MobileStickyATC';
import TrustModule from '@/components/shop/TrustModule';
import SmallBusinessTrust from '@/components/shop/SmallBusinessTrust';
import ProductReturnsSummary from '@/components/shop/ProductReturnsSummary';
import ProductBadge from '@/components/shop/ProductBadge';
import { posthog } from '@/components/providers/posthog-provider';
import { getAttributionProps } from '@/lib/attribution';

const APPAREL_CATEGORIES = ['T-Shirt', 'Tank Top', 'Hoodie', 'Hats'];
function getPromotionPricing(product, priceOverride = null, compareOverride = undefined) {
  const publicPrice = Number(priceOverride ?? product?.price ?? 0);
  const compareAt = Number(compareOverride === undefined ? product?.compareAtPrice : compareOverride);
  const isOnSale = compareAt > publicPrice;
  return { publicPrice, retailPrice: isOnSale ? compareAt : publicPrice, isOnSale, salePercentage: isOnSale ? Math.round((1 - publicPrice / compareAt) * 100) : null };
}

// ============================================================================
// PRODUCT GALLERY
// ============================================================================
function ProductGallery({ images, productName, overrideImage, shopifyVariants }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [dismissedOverride, setDismissedOverride] = useState(null);
  const activeOverride = overrideImage && dismissedOverride !== overrideImage ? overrideImage : null;
  const fadeTimeoutRef = useRef(null);

  function handleThumbnailClick(index) {
    if (index === activeIndex && !activeOverride) return;
    setDismissedOverride(overrideImage);
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    setFading(true);
    fadeTimeoutRef.current = setTimeout(() => {
      setActiveIndex(index);
      setFading(false);
      fadeTimeoutRef.current = null;
    }, 150);
  }

  const touchStartX = useRef(null);
  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (Math.abs(diff) < 40) return;
    if (diff > 0 && activeIndex < (images?.length || 1) - 1) {
      handleThumbnailClick(activeIndex + 1);
    } else if (diff < 0 && activeIndex > 0) {
      handleThumbnailClick(activeIndex - 1);
    }
  }

  const imageColorMap = useMemo(() => {
    if (!shopifyVariants?.variants) return {};
    const map = {};
    for (const v of shopifyVariants.variants) {
      if (v.imageUrl) {
        const colorOpt = v.selectedOptions?.find((o) => o.name === 'Color');
        if (colorOpt) map[v.imageUrl] = colorOpt.value;
      }
    }
    return map;
  }, [shopifyVariants]);

  const displayImage = activeOverride || images?.[activeIndex];
  const hasMultipleImages = images?.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative w-full overflow-hidden"
        style={{ aspectRatio: '4/5', backgroundColor: '#08080f' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {displayImage ? (
          <Image
            src={displayImage}
            alt={productName}
            fill
            priority
            className={`object-cover transition-opacity duration-150 ${fading ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 768px) 100vw, 60vw"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl font-semibold tracking-[0.2em]" style={{ color: 'rgba(201,169,110,0.15)' }}>
              C&amp;D
            </span>
          </div>
        )}

        {hasMultipleImages && (
          <>
            <button
              onClick={() => handleThumbnailClick(activeIndex === 0 ? images.length - 1 : activeIndex - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 opacity-70 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a96e]"
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="text-[#c9a96e]">
                <path d="M7.5 2.5L4 6L7.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => handleThumbnailClick(activeIndex === images.length - 1 ? 0 : activeIndex + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 opacity-70 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a96e]"
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="text-[#c9a96e]">
                <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
            {images.slice(0, 6).map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 w-1.5 rounded-full transition-colors ${
                  i === activeIndex ? 'bg-[#c9a96e]' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {images?.length > 1 && (
        <div className="flex gap-2 overflow-hidden">
          {images.slice(0, 6).map((img, i) => {
            const colorLabel = imageColorMap[img];
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <button
                  onClick={() => handleThumbnailClick(i)}
                  aria-label={colorLabel ? `View ${colorLabel}` : `View image ${i + 1}`}
                  className={`relative w-full overflow-hidden transition-all duration-200 focus-visible:outline-none ${
                    i === activeIndex && !activeOverride
                      ? 'ring-1 ring-[#c9a96e] ring-offset-1 ring-offset-[#08080f]'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                  style={{ aspectRatio: '1/1', backgroundColor: '#08080f' }}
                >
                  <Image src={img} alt={colorLabel || `${productName} ${i + 1}`} fill className="object-cover" sizes="12vw" />
                </button>
                {colorLabel && (
                  <span
                    className="text-[9px] uppercase tracking-[0.15em]"
                    style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}
                  >
                    {colorLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PRODUCT DETAILS LIST
// ============================================================================
function ProductDetailsList({ description }) {
  if (!description) return null;

  const plainText = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const lines = plainText.split(/\.\s+/).filter(Boolean).map((l) => l.replace(/\.$/, ''));

  return (
    <div>
      <p
        className="mb-4 text-[11px] uppercase tracking-[0.2em]"
        style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
      >
        Details
      </p>
      <ul className="flex flex-col gap-2">
        {lines.map((line, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-[13px] font-light leading-relaxed"
            style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}
          >
            <span
              className="mt-[6px] h-1 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: '#c9a96e', opacity: 0.6 }}
              aria-hidden="true"
            />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// RELATED PRODUCTS
// ============================================================================
function RelatedProducts({ products }) {
  if (!products?.length) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-20 w-full">
      <p
        id="related-heading"
        className="mb-10 text-[11px] uppercase tracking-[0.25em]"
        style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
      >
        You Might Also Like
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {products.map((p) => {
          const isSoldOut = p.availableForSale === false;
          const pricing = getPromotionPricing(p);
          return (
          <Link
            key={p.slug}
            href={`/shop/${p.slug}`}
            className="group flex flex-col gap-3 focus-visible:outline-none"
          >
            <div className="group relative w-full overflow-hidden" style={{ aspectRatio: '3/4', backgroundColor: '#08080f' }}>
              {p.imageUrls?.[0] ? (
                <Image
                  src={p.imageUrls[0]}
                  alt={p.name}
                  fill
                  className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? 'grayscale opacity-60' : ''}`}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span style={{ color: 'rgba(201,169,110,0.2)' }}>C&amp;D</span>
                </div>
              )}
              {pricing.isOnSale && !isSoldOut && (
                <span
                  className="absolute right-2 top-2 z-20 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.15em]"
                  style={{ backgroundColor: '#c9a96e', color: '#08080f', fontFamily: 'Inter, sans-serif' }}
                >
                  {pricing.salePercentage}% OFF
                </span>
              )}
              {isSoldOut && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div
                    className="px-3 py-1.5 text-center"
                    style={{
                      backgroundColor: 'rgba(8, 8, 15, 0.8)',
                      border: '1px solid rgba(201, 169, 110, 0.4)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <span
                      className="block text-[9px] uppercase tracking-[0.25em] font-medium"
                      style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}
                    >
                      Out of Stock
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#c9a96e' }}>
                {p.category}
              </p>
              <h3
                className="font-serif text-[18px] leading-tight transition-opacity duration-200 group-hover:opacity-80"
                style={{ color: '#e8e4dc', fontWeight: 400, fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {p.name}
              </h3>
              {isSoldOut ? (
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em]" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>
                  Notify me when available
                </p>
              ) : (
                <div className="mt-1 flex flex-col gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    {pricing.isOnSale && (
                      <span className="text-[11px] line-through" style={{ color: '#514d49' }}>
                        ${pricing.retailPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-[14px] font-light" style={{ color: pricing.isOnSale ? '#e8e4dc' : '#6b6760' }}>
                      ${pricing.publicPrice.toFixed(2)}
                    </span>
                  </div>

                </div>
              )}
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}

// ============================================================================
// MAIN PRODUCT DETAIL COMPONENT
// ============================================================================
export default function ProductDetail({ product, relatedProducts, shopifyVariants, initialVariantId }) {
  const { isMember, loading: authLoading } = useSanctuaryAccess();
  const galleryRef = useRef(null);
  const initialVariant = shopifyVariants?.variants?.find(variant => variant.shopifyVariantId === initialVariantId || variant.shopifyVariantId?.split('/').pop() === initialVariantId)
    || (shopifyVariants?.variants?.length === 1 ? shopifyVariants.variants[0] : null);
  const [selectedShopifyVariant, setSelectedShopifyVariant] = useState(initialVariant);
  const [colorImage, setColorImage] = useState(null);
  const isApparel = APPAREL_CATEGORIES.includes(product.category) || product.category === 'Apparel';
  const hasShopifyVariants = shopifyVariants?.variants?.length > 0;
  const activePricing = getPromotionPricing(product, selectedShopifyVariant?.price, selectedShopifyVariant ? selectedShopifyVariant.compareAtPrice : undefined);
  const basePrice = activePricing.publicPrice;
  const variantImage = colorImage || selectedShopifyVariant?.imageUrl || null;

  useEffect(() => {
    posthog?.capture?.('product_viewed', {
      product_title: product.name, product_handle: product.slug, product_type: product.category,
      vendor: product.vendor, price: Number(product.price), currency: product.currency || 'USD',
      url: window.location.href, referrer: document.referrer || undefined, ...getAttributionProps(),
    });
  }, [product.name, product.slug, product.category, product.vendor, product.price, product.currency]);

  function handleStickyAdd() {
    const section = document.querySelector('[data-atc-section]');
    if (selectedShopifyVariant) section?.querySelector('[data-product-add-button]')?.click();
    else {
      section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      section?.focus({ preventScroll: true });
    }
  }

  return (
    <div className="pb-[calc(10rem+env(safe-area-inset-bottom,0px))] md:pb-0" style={{ backgroundColor: '#08080f', overflowX: 'hidden' }}>
      <div className="mx-auto max-w-[1280px] px-6 py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-[11px] font-light tracking-[0.1em]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <li><Link href="/" className="transition-opacity hover:opacity-80" style={{ color: '#6b6760' }}>Home</Link></li>
            <li aria-hidden="true" style={{ color: 'rgba(201,169,110,0.4)' }}>/</li>
            <li><Link href="/shop" className="transition-opacity hover:opacity-80" style={{ color: '#6b6760' }}>Shop</Link></li>
            <li aria-hidden="true" style={{ color: 'rgba(201,169,110,0.4)' }}>/</li>
            <li style={{ color: '#c9a96e' }}>{product.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col items-start gap-10 md:flex-row lg:gap-16">
          <div className="w-full overflow-hidden md:w-[60%]" ref={galleryRef}>
            <ProductGallery
              images={product.imageUrls}
              productName={product.name}
              overrideImage={variantImage}
              shopifyVariants={shopifyVariants}
            />
            <div className="mt-10 hidden md:block">
              <ProductDetailsList description={product.description} />
            </div>
          </div>

          <div className="w-full self-start md:sticky md:top-8 md:w-[40%]">
            <div className="flex flex-col gap-6">
              <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                {product.category}
              </p>

              {product.badge && <ProductBadge badge={product.badge} variant="detail" />}

              <h1
                className="font-serif text-[40px] leading-tight text-balance"
                style={{ color: '#e8e4dc', fontWeight: 400, fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {product.name}
              </h1>

              <div className="flex flex-col gap-2" aria-live="polite">
                {activePricing.isOnSale && <span className="w-fit px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] bg-[#c9a96e] text-[#08080f]">{activePricing.salePercentage}% OFF</span>}
                <div className="flex items-baseline gap-3">
                  {activePricing.isOnSale && <span className="text-sm text-zinc-400 line-through">${activePricing.retailPrice.toFixed(2)}</span>}
                  <span className="text-xl text-[#e8e4dc]">{!selectedShopifyVariant && product.priceRange?.max > product.priceRange?.min ? 'From ' : ''}${basePrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-zinc-300">{isMember ? 'Your eligible Sanctuary benefits are verified in your cart.' : 'Eligible discounts are confirmed in your cart.'}</p>
                {!isMember && !authLoading && <Link href="/join" className="text-xs text-[#c9a96e] underline underline-offset-4">Explore Sanctuary membership</Link>}
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(201,169,110,0.2)' }} />

              {product.description && (() => {
                const plainText = product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                const isLong = plainText.length > 200;
                const shouldCollapse = isLong && (isApparel || product.vendor === 'Printify');

                if (shouldCollapse) {
                  const preview = plainText.slice(0, 180).replace(/\s\S*$/, '') + '…';
                  return (
                    <p
                      className="text-[15px] font-light leading-relaxed"
                      style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}
                    >
                      {preview}
                    </p>
                  );
                }

                return (
                  <div
                    dangerouslySetInnerHTML={{ __html: product.description }}
                    className="text-[15px] font-light leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-4 [&_li]:mb-1 [&_br]:block [&_a]:underline [&_a]:underline-offset-2"
                    style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}
                  />
                );
              })()}

              <TrustModule productName={product.name} />
              <SmallBusinessTrust />

              <div data-atc-section data-cart-return-focus tabIndex={-1} role="region" aria-label="Product purchase options">
                {hasShopifyVariants ? <AddToCart shopifyVariants={shopifyVariants} product={product} initialVariant={initialVariant} onVariantChange={setSelectedShopifyVariant} onColorSelect={setColorImage} /> : <p role="status" className="text-sm text-zinc-300">We could not load the purchase options. Please refresh this page to try again.</p>}
              </div>
              <p className="text-xs text-zinc-300 text-center">Shipping options and delivery estimates are shown at checkout.</p>

              <ProductReturnsSummary />

              {product.description && (isApparel || product.vendor === 'Printify') && product.description.replace(/<[^>]*>/g, '').length > 200 && (
                <>
                  <div style={{ height: '1px', backgroundColor: 'rgba(201,169,110,0.12)' }} />
                  <details className="group">
                    <summary
                      className="cursor-pointer text-[11px] uppercase tracking-[0.15em] font-light py-2 transition-colors hover:text-[#c9a96e]"
                      style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}
                    >
                      Full Details
                    </summary>
                    <div
                      dangerouslySetInnerHTML={{ __html: product.description }}
                      className="mt-3 text-[14px] font-light leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-4 [&_li]:mb-1 [&_br]:block [&_a]:underline [&_a]:underline-offset-2"
                      style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}
                    />
                  </details>
                </>
              )}

              <div style={{ height: '1px', backgroundColor: 'rgba(201,169,110,0.2)' }} />

              <dl className="flex flex-col gap-1.5">
                {product.sku && (
                  <div className="flex gap-3">
                    <dt className="w-16 shrink-0 text-[11px] uppercase tracking-[0.15em] font-light" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>SKU</dt>
                    <dd className="text-[11px] tracking-[0.05em] font-light" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>{product.sku}</dd>
                  </div>
                )}
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 text-[11px] uppercase tracking-[0.15em] font-light" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>Category</dt>
                  <dd className="text-[11px] tracking-[0.05em] font-light" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>{product.category}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 md:hidden">
              <ProductDetailsList description={product.description} />
            </div>
          </div>
        </div>

        <RelatedProducts products={relatedProducts} />
      </div>

      <MobileStickyATC
        productName={product.name}
        price={basePrice}
        retailPrice={activePricing.retailPrice}
        isOnSale={activePricing.isOnSale}
        salePercentage={activePricing.salePercentage}
        isMember={false}
        onAddToCart={handleStickyAdd}
        cartState="idle"
        needsSelection={!selectedShopifyVariant}
        galleryRef={galleryRef}
        isSoldOut={!hasShopifyVariants || product.availableForSale === false || selectedShopifyVariant?.available === false}
      />
    </div>
  );
}
