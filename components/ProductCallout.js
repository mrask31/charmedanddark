import Link from 'next/link';
import Image from 'next/image';

/**
 * ProductCallout Server Component
 * 
 * Displays a featured product card within blog posts with product details
 * and a link to the product page.
 * 
 * @param {Object} props.product - Product data
 * @param {string} props.product.slug - Product URL slug
 * @param {string} props.product.name - Product name
 * @param {string} props.product.lore - AI-generated product description
 * @param {string} props.product.image_url - Product image URL
 * @param {number} props.product.price - Base price in cents
 * @param {number} [props.product.sale_price] - Sale price in cents (optional)
 */
export default function ProductCallout({ product }) {
  const { slug, name, lore, image_url, price, sale_price } = product;
  
  // Convert price from cents to dollars
  const displayPrice = sale_price ? sale_price / 100 : price / 100;
  const hasDiscount = sale_price && sale_price < price;
  
  // Truncate lore to excerpt length (approximately 150 characters)
  const loreExcerpt = lore.length > 150 ? lore.substring(0, 150) + '...' : lore;
  
  return (
    <div className="bg-zinc-950 border border-white/10 p-6 my-8">
      <Link href={`/shop/${slug}`} className="block group">
        {/* Product Image */}
        <div className="relative w-full aspect-square mb-4 overflow-hidden">
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {/* Featured Product Label */}
        <div className="uppercase tracking-widest text-xs text-zinc-400 mb-2">
          FEATURED PRODUCT
        </div>
        
        {/* Product Name */}
        <h3 className="font-serif text-2xl text-white mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          {name}
        </h3>
        
        {/* Lore Excerpt */}
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
          {loreExcerpt}
        </p>
        
        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-medium" style={{ color: '#B89C6D' }}>
            ${displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-zinc-500 line-through">
              ${(price / 100).toFixed(2)}
            </span>
          )}
        </div>
        
        {/* View Product Link */}
        <div className="text-sm uppercase tracking-widest" style={{ color: '#B89C6D' }}>
          View Product →
        </div>
      </Link>
    </div>
  );
}
