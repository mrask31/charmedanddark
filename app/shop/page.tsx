import { getSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';

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
  const supabase = getSupabaseServerClient();
  
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      className="bg-white group block overflow-hidden border border-gray-200"
    >
      {/* Image Container - aspect-square */}
      <div className="relative w-full" style={{ paddingBottom: '100%' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-400 uppercase tracking-wider">No Image</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-white">
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
