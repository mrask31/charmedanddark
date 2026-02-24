import { getSupabaseClient } from '@/lib/supabase/client';
import { devLog } from '@/lib/utils/logger';
import Link from 'next/link';
import Image from 'next/image';

/**
 * The Object Gallery
 * Monochromatic Brutalism - 2-column mobile, 4-column desktop
 * Prioritizes Darkroom images over raw Shopify images
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

async function getDarkroomImage(handle: string): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();
    
    // Check if branded image exists in Darkroom bucket
    const { data, error } = await supabase
      .storage
      .from('darkroom')
      .list(`products/${handle}`, {
        limit: 1,
        search: 'branded',
      });

    if (error) {
      devLog.warn(`[Shop] Failed to check Darkroom for ${handle}:`, error.message);
      return null;
    }

    if (data && data.length > 0) {
      const { data: { publicUrl } } = supabase
        .storage
        .from('darkroom')
        .getPublicUrl(`products/${handle}/${data[0].name}`);
      
      devLog.log(`[Shop] Using Darkroom image for ${handle}`);
      return publicUrl;
    }

    return null;
  } catch (error) {
    console.error(`[Shop] Error fetching Darkroom image for ${handle}:`, error);
    return null;
  }
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

async function ProductCard({ product }: { product: Product }) {
  const supabaseImage = product.image_url || (product.images && product.images[0]?.url);
  const darkroomImage = await getDarkroomImage(product.handle);
  
  // Prioritize Darkroom, fallback to Supabase
  const imageUrl = darkroomImage || supabaseImage;
  
  // Debug logging (only in development)
  if (!imageUrl) {
    console.log(`[Shop] No image for ${product.handle}:`, {
      image_url: product.image_url,
      images: product.images,
      darkroom: darkroomImage,
    });
  }

  return (
    <Link
      href={`/product/${product.handle}`}
      className="bg-white group block relative aspect-square overflow-hidden"
    >
      {/* Image - graceful fallback if missing */}
      {imageUrl ? (
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized={imageUrl.includes('shopify')}
          />
        </div>
      ) : (
        <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
          <span className="text-xs text-gray-400 uppercase tracking-wider">No Image</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-black">
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
