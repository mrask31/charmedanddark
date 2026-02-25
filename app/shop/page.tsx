import { getSupabaseServerClient } from '@/lib/supabase/server';

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
    <div style={{ minHeight: '100vh', backgroundColor: 'white', color: 'black' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid black' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 300, letterSpacing: '-0.02em' }}>
            OBJECTS
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {products.length} Items
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
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
    <a
      href={`/product/${product.handle}`}
      style={{
        display: 'block',
        backgroundColor: 'white',
        border: '1px solid #e5e5e5',
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden'
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', overflow: 'hidden' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            loading="lazy"
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              No Image
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1rem', backgroundColor: 'white' }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: 300,
          letterSpacing: '0.02em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: '0.25rem'
        }}>
          {product.title}
        </h3>
        <p style={{ fontSize: '0.75rem', color: '#666' }}>
          ${product.price.toFixed(2)} USD
        </p>
      </div>
    </a>
  );
}
