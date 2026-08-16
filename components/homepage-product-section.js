import Link from "next/link";
import Image from "next/image";

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
    <section className="bg-black px-8 py-20 lg:px-16">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-widest text-[#B89C6D]">
            {title}
          </span>
          {intro && (
            <p className="mt-3 text-sm font-light leading-relaxed text-zinc-400 md:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
              {intro}
            </p>
          )}
        </div>
        <Link
          href={viewAllHref}
          className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
        >
          {ctaLabel}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
        {products.map((product) => {
          const retailPrice = Number(product.price || 0);
          const promotionPrice = product.salePrice != null
            ? Number(product.salePrice)
            : product.sale_price != null
              ? Number(product.sale_price)
              : null;
          const isOnSale = promotionPrice != null && promotionPrice > 0 && promotionPrice < retailPrice;
          const publicPrice = isOnSale ? promotionPrice : retailPrice;
          const salePercentage = isOnSale
            ? Math.round(Number(product.salePercentage) || ((retailPrice - publicPrice) / retailPrice) * 100)
            : null;
          const sanctuaryPrice = (publicPrice * 0.9).toFixed(2);
          const slug = product.handle || product.slug;
          const imageUrl = product.image_url || product.imageUrls?.[0] || product.image_urls?.[0];
          const isSoldOut = product.qty != null && product.qty <= 0;

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
                <h3 className="text-sm text-white font-light leading-tight">{product.name || product.title}</h3>
                {isSoldOut ? (
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Notify me when available</p>
                ) : (
                  <div className="mt-1.5 space-y-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {isOnSale ? (
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-xs text-zinc-600 line-through">${retailPrice.toFixed(2)}</span>
                        <span className="text-sm text-white">${publicPrice.toFixed(2)}</span>
                        <span className="text-[9px] uppercase tracking-[0.14em] text-[#B89C6D]">{salePercentage}% off</span>
                      </div>
                    ) : (
                      <span className="text-sm text-zinc-400">${publicPrice.toFixed(2)}</span>
                    )}
                    <div className="text-[10px] uppercase tracking-wider text-[#B89C6D]">
                      Sanctuary ${sanctuaryPrice}{isOnSale ? ' · additional 10%' : ''}
                    </div>
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
