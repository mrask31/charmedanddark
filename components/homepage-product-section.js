import Link from "next/link";
import Image from "next/image";

/**
 * Reusable homepage product section.
 * Displays a labeled grid of products with consistent styling.
 */
export function HomepageProductSection({ title, products = [], badge }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-black px-8 py-20 lg:px-16">
      <div className="mb-10 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-[#B89C6D]">
          {title}
        </span>
        <Link
          href="/shop"
          className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
        {products.map((product) => {
          const price = product.sale_price || product.price;
          const sanctuaryPrice = (price * 0.9).toFixed(2);
          const slug = product.handle || product.slug;
          const imageUrl = product.image_url || product.image_urls?.[0];
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
                {/* Badge overlay */}
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
                {/* OUT OF STOCK overlay */}
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
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className="text-sm text-zinc-400">${price.toFixed(2)}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#B89C6D]">
                      Sanctuary ${sanctuaryPrice}
                    </span>
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
