"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Minus, Plus } from 'lucide-react';
import { useSanctuaryAccess } from '@/hooks/useSanctuaryAccess';
import { useCart } from '@/context/CartContext';

const APPAREL_CATEGORIES = ['T-Shirt', 'Tank Top', 'Hoodie', 'Hats'];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// ============================================================================
// PRODUCT GALLERY
// ============================================================================
function ProductGallery({ images, productName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);

  function handleThumbnailClick(index) {
    if (index === activeIndex) return;
    setFading(true);
    setTimeout(() => {
      setActiveIndex(index);
      setFading(false);
    }, 180);
  }

  const activeImage = images?.[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/5', backgroundColor: '#08080f' }}>
        {activeImage ? (
          <Image
            src={activeImage}
            alt={productName}
            fill
            priority
            className={`object-cover transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl font-semibold tracking-[0.2em]" style={{ color: 'rgba(201,169,110,0.15)' }}>
              C&amp;D
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images?.length > 1 && (
        <div className="flex gap-2">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => handleThumbnailClick(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative flex-1 overflow-hidden transition-all duration-200 focus-visible:outline-none ${
                i === activeIndex
                  ? 'ring-1 ring-[#c9a96e] ring-offset-1 ring-offset-[#08080f]'
                  : 'opacity-50 hover:opacity-80'
              }`}
              style={{ aspectRatio: '1/1', backgroundColor: '#08080f' }}
            >
              <Image src={img} alt={`${productName} ${i + 1}`} fill className="object-cover" sizes="12vw" />
            </button>
          ))}
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

  // Split description into bullet points if it contains periods
  const lines = description.split(/\.\s+/).filter(Boolean).map((l) => l.replace(/\.$/, ''));

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
        {products.map((p) => (
          <Link
            key={p.slug}
            href={`/shop/${p.slug}`}
            className="group flex flex-col gap-3 focus-visible:outline-none"
          >
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/4', backgroundColor: '#08080f' }}>
              {p.imageUrls?.[0] ? (
                <Image
                  src={p.imageUrls[0]}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span style={{ color: 'rgba(201,169,110,0.2)' }}>C&amp;D</span>
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
              <p className="mt-0.5 text-[14px] font-light" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>
                ${p.price?.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// MAIN PRODUCT DETAIL COMPONENT
// ============================================================================
export default function ProductDetail({ product, relatedProducts }) {
  const { isMember, loading: authLoading } = useSanctuaryAccess();
  const { addItem } = useCart();

  const isApparel = APPAREL_CATEGORIES.includes(product.category);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartState, setCartState] = useState('idle'); // idle | loading | success | error

  const sanctuaryPrice = product.price ? +(product.price * 0.90).toFixed(2) : null;

  async function handleAddToCart() {
    if (cartState !== 'idle') return;
    if (isApparel && !selectedSize) return;

    setCartState('loading');

    try {
      // Add to local cart context
      addItem({
        ...product,
        selectedSize: isApparel ? selectedSize : null,
      }, quantity);

      setCartState('success');
      setTimeout(() => setCartState('idle'), 2000);
    } catch (err) {
      console.error('Add to cart failed:', err);
      setCartState('error');
    }
  }

  const buttonDisabled = cartState === 'loading' || cartState === 'success' || (isApparel && !selectedSize);
  const buttonLabel =
    cartState === 'loading' ? 'Adding...'
    : cartState === 'success' ? 'Added to Cart ✓'
    : cartState === 'error' ? 'Something went wrong'
    : 'Add to Cart';

  return (
    <div style={{ backgroundColor: '#08080f', overflowX: 'hidden' }}>
      <div className="mx-auto max-w-[1280px] px-6 py-12 md:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-[11px] font-light tracking-[0.1em]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <li><Link href="/" className="transition-opacity hover:opacity-80" style={{ color: '#6b6760' }}>Home</Link></li>
            <li aria-hidden="true" style={{ color: 'rgba(201,169,110,0.4)' }}>/</li>
            <li><Link href="/shop" className="transition-opacity hover:opacity-80" style={{ color: '#6b6760' }}>Shop</Link></li>
            <li aria-hidden="true" style={{ color: 'rgba(201,169,110,0.4)' }}>/</li>
            <li style={{ color: '#c9a96e' }}>{product.name}</li>
          </ol>
        </nav>

        {/* Two-column layout */}
        <div className="flex flex-col items-start gap-10 md:flex-row lg:gap-16">
          {/* Left: gallery (60%) */}
          <div className="w-full md:w-[60%]">
            <ProductGallery images={product.imageUrls} productName={product.name} />
            <div className="mt-10 hidden md:block">
              <ProductDetailsList description={product.description} />
            </div>
          </div>

          {/* Right: details panel (40%) — sticky */}
          <div className="w-full self-start md:sticky md:top-8 md:w-[40%]">
            <div className="flex flex-col gap-6">
              {/* Eyebrow */}
              <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                {product.category}
              </p>

              {/* Title */}
              <h1
                className="font-serif text-[40px] leading-tight text-balance"
                style={{ color: '#e8e4dc', fontWeight: 400, fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {product.name}
              </h1>

              {/* Price block */}
              {product.price && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-4">
                    {isMember ? (
                      <>
                        <span className="font-light text-xl line-through" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="font-light text-[18px]" style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}>
                          ${sanctuaryPrice?.toFixed(2)}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: '#c9a96e', opacity: 0.7, fontFamily: 'Inter, sans-serif' }}>
                          Your Price
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-light text-xl" style={{ color: '#e8e4dc', fontFamily: 'Inter, sans-serif' }}>
                          ${product.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Lock size={12} className="shrink-0" style={{ color: '#c9a96e', opacity: 0.8 }} aria-hidden="true" />
                          <span className="font-light text-[18px]" style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}>
                            ${sanctuaryPrice?.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  {!isMember && !authLoading && (
                    <p className="text-[12px] font-light" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>
                      <Link href="/join" className="underline underline-offset-2 transition-opacity hover:opacity-80" style={{ color: '#6b6760' }}>
                        Join the Sanctuary to unlock this price
                      </Link>
                    </p>
                  )}
                </div>
              )}

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: 'rgba(201,169,110,0.2)' }} />

              {/* Description */}
              {product.description && (
                <p className="text-[15px] font-light leading-relaxed" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>
                  {product.description}
                </p>
              )}

              {/* Size selector — only for apparel */}
              {isApparel && (
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] uppercase tracking-[0.2em]" style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                    Size
                  </label>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Select size">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={selectedSize === size}
                        className={`rounded-full px-4 py-2 text-[13px] font-light tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a96e] ${
                          selectedSize === size
                            ? 'border border-[#c9a96e] text-[#c9a96e]'
                            : 'border border-[rgba(201,169,110,0.25)] text-[#6b6760] hover:border-[rgba(201,169,110,0.5)] hover:text-[#e8e4dc]'
                        }`}
                        style={{ backgroundColor: '#0e0e1a', fontFamily: 'Inter, sans-serif' }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {isApparel && !selectedSize && (
                    <p className="text-[12px] font-light" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>
                      Select a size to add to cart
                    </p>
                  )}
                </div>
              )}

              {/* Quantity selector */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] uppercase tracking-[0.2em]" style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  Qty
                </label>
                <div className="flex items-center" role="group" aria-label="Select quantity">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline-none"
                    style={{ color: '#c9a96e', border: '1px solid rgba(201,169,110,0.2)', backgroundColor: '#0e0e1a' }}
                  >
                    <Minus size={14} />
                  </button>
                  <div
                    className="flex h-10 w-12 items-center justify-center text-sm font-light"
                    style={{ color: '#e8e4dc', borderTop: '1px solid rgba(201,169,110,0.2)', borderBottom: '1px solid rgba(201,169,110,0.2)', backgroundColor: '#0e0e1a', fontFamily: 'Inter, sans-serif' }}
                    aria-live="polite"
                  >
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                    className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline-none"
                    style={{ color: '#c9a96e', border: '1px solid rgba(201,169,110,0.2)', backgroundColor: '#0e0e1a' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={buttonDisabled}
                className={`h-[52px] w-full rounded-full border text-sm uppercase tracking-[0.15em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a96e] ${
                  cartState === 'loading' ? 'animate-pulse' : ''
                } ${
                  cartState === 'success'
                    ? 'border-[#c9a96e] bg-[rgba(201,169,110,0.12)] text-[#c9a96e]'
                    : cartState === 'error'
                    ? 'border-red-500/50 text-red-400'
                    : 'border-[#c9a96e] bg-transparent text-[#c9a96e] hover:bg-[rgba(201,169,110,0.15)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                {buttonLabel}
              </button>

              {/* Shipping note */}
              <p className="text-center text-[12px] font-light" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>
                Free shipping on orders over $75. Members always save 10%.
              </p>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: 'rgba(201,169,110,0.2)' }} />

              {/* Product meta */}
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

            {/* Details on mobile */}
            <div className="mt-8 md:hidden">
              <ProductDetailsList description={product.description} />
            </div>
          </div>
        </div>

        {/* Related products */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
