import Link from 'next/link';
import Image from 'next/image';

/**
 * Product callout used inside Journal posts. Pricing is already enriched by
 * the Promotion Engine before it reaches this component.
 */
export default function ProductCallout({ product }) {
  const slug = product.slug || product.handle;
  const name = product.name || product.title;
  const lore = product.lore || product.description || '';
  const imageUrl = product.image_url || product.imageUrls?.[0] || product.image_urls?.[0];
  const retailPrice = Number(product.price || 0);
  const promotionPrice = product.salePrice != null ? Number(product.salePrice) : null;
  const isOnSale = promotionPrice != null && promotionPrice > 0 && promotionPrice < retailPrice;
  const publicPrice = isOnSale ? promotionPrice : retailPrice;
  const salePercentage = isOnSale
    ? Math.round(Number(product.salePercentage) || ((retailPrice - publicPrice) / retailPrice) * 100)
    : null;
  const sanctuaryPrice = +(publicPrice * 0.9).toFixed(2);

  const loreExcerpt = lore.length > 150 ? lore.substring(0, 150) + '...' : lore;

  return (
    <div className="bg-zinc-950 border border-white/10 p-6 my-8">
      <Link href={`/shop/${slug}`} className="block group">
        <div className="relative w-full aspect-square mb-4 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-700">
              <span className="font-serif text-4xl">C&amp;D</span>
            </div>
          )}
          {isOnSale && (
            <span
              className="absolute right-3 top-3 z-10 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.18em]"
              style={{ backgroundColor: '#c9a96e', color: '#08080f', fontFamily: 'Inter, sans-serif' }}
            >
              {salePercentage}% OFF
            </span>
          )}
        </div>

        <div className="uppercase tracking-widest text-xs text-zinc-400 mb-2">
          FEATURED PRODUCT
        </div>

        <h3 className="font-serif text-2xl text-white mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          {name}
        </h3>

        {loreExcerpt && (
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            {loreExcerpt}
          </p>
        )}

        <div className="mb-4 space-y-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="flex flex-wrap items-baseline gap-2">
            {isOnSale && (
              <span className="text-sm text-zinc-500 line-through">
                ${retailPrice.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-medium" style={{ color: isOnSale ? '#e8e4dc' : '#B89C6D' }}>
              ${publicPrice.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: '#B89C6D' }}>
                {salePercentage}% off
              </span>
            )}
          </div>
          <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: '#B89C6D' }}>
            Sanctuary ${sanctuaryPrice.toFixed(2)}{isOnSale ? ' · additional 10%' : ''}
          </div>
        </div>

        <div className="text-sm uppercase tracking-widest" style={{ color: '#B89C6D' }}>
          View Product →
        </div>
      </Link>
    </div>
  );
}
