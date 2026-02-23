import { storefrontRequest } from '@/lib/shopify/storefront';
import { getSupabaseClient } from '@/lib/supabase/client';
import { devLog } from '@/lib/utils/logger';
import Link from 'next/link';
import Image from 'next/image';

/**
 * The Object Gallery
 * Monochromatic Brutalism - 2-column mobile, 4-column desktop
 * Prioritizes Darkroom images over raw Shopify images
 */

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText?: string;
      };
    }>;
  };
}

const PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

async function getProducts(): Promise<ShopifyProduct[]> {
  const data = await storefrontRequest<{
    products: {
      edges: Array<{ node: ShopifyProduct }>;
    };
  }>(PRODUCTS_QUERY, { first: 50 });

  if (!data) {
    return [];
  }

  return data.products.edges.map(edge => edge.node);
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

async function ProductCard({ product }: { product: ShopifyProduct }) {
  const shopifyImage = product.images.edges[0]?.node.url;
  const darkroomImage = await getDarkroomImage(product.handle);
  
  // Prioritize Darkroom, fallback to Shopify
  const imageUrl = darkroomImage || shopifyImage;
  const price = parseFloat(product.priceRange.minVariantPrice.amount);

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
          ${price.toFixed(2)} {product.priceRange.minVariantPrice.currencyCode}
        </p>
      </div>
    </Link>
  );
}
