import Link from "next/link";
import Image from "next/image";
import { productIsAvailable, productPricing, formatProductPrice } from "@/lib/product-display";

/**
 * Reusable homepage product section.
 * Displays a labeled grid of products with consistent styling.
 */
export function HomepageProductSection({
  title,
  products = [],
  badge,
  viewAllHref = "/shop",
  ctaLabel = "View All",
  intro,
  footerNote,
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl text-[#f5f0e8] sm:text-4xl">
            {title}
          </h2>
          {intro && (
            <p className="mt-3 text-sm leading-relaxed text-[#c4bdb3] md:text-base">
              {intro}
            </p>
          )}
        </div>
        <Link
          href={viewAllHref}
          className="inline-flex min-h-11 items-center text-sm text-[#d4b984] underline underline-offset-4 transition-colors hover:text-white"
        >
          {ctaLabel}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
        {products.map((product) => {
          const { publicPrice, originalPrice: retailPrice, isOnSale, salePercentage } = productPricing(product);
          const slug = product.slug || product.handle;
          const imageUrl = product.imageUrls?.[0];
          const isSoldOut = !productIsAvailable(product);

          return (
            <Link key={slug} href={`/shop/${slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden border border-transparent transition-colors duration-160 group-hover:border-[#B89C6D]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name || product.title}
                    fill
                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? 'grayscale opacity-60' : ''}`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-700">
                    <span className="text-4xl font-serif">C&D</span>
                  </div>
                )}

                {isOnSale && !isSoldOut ? (
                  <span
                    className="absolute right-3 top-3 z-20 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.18em]"
                    style={{ backgroundColor: '#c9a96e', color: '#08080f', fontFamily: 'Inter, sans-serif' }}
                  >
                    {salePercentage}% OFF
                  </span>
                ) : null}

                {/* Merchandising badge */}
                {badge && !isSoldOut && (
                  <span
                    className="absolute top-3 left-3 z-10 text-[9px] uppercase tracking-[0.2em] font-medium px-2.5 py-1"
                    style={{
                      color: '#c9a96e',
                      backgroundColor: 'rgba(8, 8, 15, 0.85)',
                      border: '1px solid rgba(201, 169, 110, 0.3)',
                      fontFamily: 'Inter, sans-serif',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {badge}
                  </span>
                )}

                {isSoldOut && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div
                      className="px-4 py-2 text-center"
                      style={{
                        backgroundColor: 'rgba(8, 8, 15, 0.8)',
                        border: '1px solid rgba(201, 169, 110, 0.4)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <span
                        className="block text-[10px] uppercase tracking-[0.25em] font-medium"
                        style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}
                      >
                        Out of Stock
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <h3 className="text-sm leading-relaxed text-[#f5f0e8] sm:text-base">{product.name || product.title}</h3>
                {isSoldOut ? (
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Notify me when available</p>
                ) : (
                  <div className="mt-1.5 space-y-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {isOnSale ? (
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-sm text-zinc-400 line-through">{formatProductPrice(retailPrice, product.currency)}</span>
                        <span className="text-sm text-white">{product.priceRange?.max > product.priceRange?.min ? "From " : ""}{formatProductPrice(publicPrice, product.currency)}</span>
                        <span className="text-[9px] uppercase tracking-[0.14em] text-[#B89C6D]">{salePercentage}% off</span>
                      </div>
                    ) : (
                      <span className="text-base text-[#ded8cf]">{product.priceRange?.max > product.priceRange?.min ? "From " : ""}{formatProductPrice(publicPrice, product.currency)}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {footerNote && (
        <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>
          {footerNote}
        </p>
      )}
    </section>
  );
}
