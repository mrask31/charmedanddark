import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

/**
 * The Object Gallery
 * Monochromatic Brutalism - 2-column mobile, 4-column desktop
 * Uses Shopify CDN images from database
 */

interface Product {
  id: string;
  handle: string;
  title: string;
  price: number;
  image_url: string | null;
  images: Array<{ url: string; position: number; alt?: string }> | null;
}

async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('id, handle, title, price, image_url, images')
    .order('title');

  if (error) {
    console.error('[Shop] Failed to fetch products:', error);
    return [];
  }

  return data || [];
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="border-b border-black">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl md:text-6xl font-light tracking-tight">
            OBJECTS
          </h1>
          <p className="text-sm text-gray-600 mt-2 uppercase tracking-widest">
            {products.length} Items
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  // Get image from database - prioritize image_url, fallback to images array
  const imageUrl = product.image_url || (product.images && product.images.length > 0 ? product.images[0].url : null);

  return (
    <Link
      href={`/product/${product.handle}`}
      className="bg-white group block overflow-hidden"
    >
      {/* Image Container - aspect-square with relative positioning for Image fill */}
      <div className="relative aspect-square w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-400 uppercase tracking-wider">No Image</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Info */}
      <div className="p-4 bg-white border-t border-black">
        <h3 className="text-sm font-light tracking-wide truncate">
          {product.title}
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          ${product.price.toFixed(2)} USD
        </p>
      </div>
    </Link>
  );
}
