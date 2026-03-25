import Link from "next/link";
import Image from "next/image";

export function FeaturedProducts({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-black px-8 py-24 lg:px-16">
      {/* Header */}
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const price = product.sale_price || product.price;
          const sanctuaryPrice = (price * 0.9).toFixed(2);
          const slug = product.handle || product.slug;
          const imageUrl = product.image_url || product.image_urls?.[0];

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
              </div>
              <div className="mt-4">
                <h3 className="text-sm text-white">{product.name || product.title}</h3>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-sm text-zinc-400">${price.toFixed(2)}</span>
                  <span className="text-xs uppercase tracking-wider text-[#B89C6D]">
                    Sanctuary ${sanctuaryPrice}
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
