import Link from "next/link";
import Image from "next/image";

export function FeaturedProducts({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-black px-8 py-24 lg:px-16">
      <div className="mb-12 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-[#B89C6D]">
          Curated Selections
        </span>
        <Link
          href="/shop"
          className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const retailPrice = Number(product.price || 0);
          const promotionPrice = product.salePrice != null
            ? Number(product.salePrice)
            : product.sale_price != null
              ? Number(product.sale_price)
              : null;
          const isOnSale = promotionPrice != null && promotionPrice > 0 && promotionPrice < retailPrice;
          const price = isOnSale ? promotionPrice : retailPrice;
          const salePercentage = isOnSale
            ? Math.round(Number(product.salePercentage) || ((retailPrice - price) / retailPrice) * 100)
            : null;
          const sanctuaryPrice = (price * 0.9).toFixed(2);
          const slug = product.handle || product.slug;
          const imageUrl = product.image_url || product.imageUrls?.[0] || product.image_urls?.[0];

          return (
            <Link key={slug} href={`/shop/${slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden border border-transparent transition-colors duration-160 group-hover:border-[#B89C6D]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name || product.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-700">
                    <span className="text-4xl font-serif">C&D</span>
                  </div>
                )}
                {isOnSale && (
                  <span
                    className="absolute right-3 top-3 z-20 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.18em]"
                    style={{ backgroundColor: '#c9a96e', color: '#08080f', fontFamily: 'Inter, sans-serif' }}
                  >
                    {salePercentage}% OFF
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-sm text-white">{product.name || product.title}</h3>
                <div className="mt-2 space-y-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    {isOnSale && <span className="text-xs text-zinc-600 line-through">${retailPrice.toFixed(2)}</span>}
                    <span className="text-sm text-zinc-300">${price.toFixed(2)}</span>
                    {isOnSale && <span className="text-[9px] uppercase tracking-[0.14em] text-[#B89C6D]">{salePercentage}% off</span>}
                  </div>
                  <span className="text-xs uppercase tracking-wider text-[#B89C6D]">
                    Sanctuary ${sanctuaryPrice}{isOnSale ? ' · additional 10%' : ''}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
