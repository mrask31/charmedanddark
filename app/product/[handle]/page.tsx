'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient, ProductVariant } from '@/lib/supabase/client';
import { transformSupabaseProduct, UnifiedProduct } from '@/lib/products';
import { getPricingDisplay } from '@/lib/pricing';
import { trackProductView } from '@/lib/tracking';
import { useCart } from '@/lib/cart/context';
import Header from '@/components/Header';
import PricingDisplay from '@/components/PricingDisplay';
import ProductDescription from '@/components/ProductDescription';
import ProductImageGallery from '@/components/ProductImageGallery';
import VariantSelector from '@/components/VariantSelector';
import { Product as SupabaseProduct } from '@/lib/supabase/client';

export default function ProductPage() {
  const params = useParams();
  const handle = params.handle as string;
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<UnifiedProduct | null>(null);
  const [raw, setRaw] = useState<SupabaseProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        console.log('Loading product with handle:', handle);
        
        const supabase = getSupabaseClient();
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .eq('handle', handle)
          .single();

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          setError('Product not found');
          setLoading(false);
          return;
        }

        if (data) {
          console.log('Found product:', data);
          setProduct(transformSupabaseProduct(data));
          setRaw(data);
          
          // Auto-select first variant if product has variants
          if (data.variants && data.variants.length > 0) {
            setSelectedVariantId(data.variants[0].id);
          }
          
          setLoading(false);
          
          // Track product view
          trackProductView(data.id, handle);
          
          return;
        }

        setError('Product not found');
        setLoading(false);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product');
        setLoading(false);
      }
    }

    loadProduct();
  }, [handle]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.loading}>Loading...</div>
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.error}>
              <h1>Product Not Found</h1>
              <p>{error || 'The product you\'re looking for doesn\'t exist.'}</p>
              <Link href="/" style={styles.backLink}>
                ← Return to All Products
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Get selected variant or use parent product data
  const hasVariants = raw?.variants && raw.variants.length > 0;
  const selectedVariant = hasVariants 
    ? raw!.variants!.find((v: ProductVariant) => v.id === selectedVariantId)
    : null;

  // Use variant price if selected, otherwise parent price
  const displayPrice = selectedVariant?.price || product.price;
  const pricing = getPricingDisplay(displayPrice);

  // Get images for selected variant or all images
  const displayImages = (() => {
    if (selectedVariant?.image_indices && product.images.all) {
      // Map variant image indices to actual image URLs
      return selectedVariant.image_indices
        .map(idx => product.images.all![idx])
        .filter(Boolean);
    }
    return product.images.all || [product.images.hero];
  })();

  // Check stock for variant or parent
  const inStock = selectedVariant 
    ? selectedVariant.stock_quantity > 0
    : product.inStock;

  const handleAddToCart = () => {
    const cartItem = {
      productId: product.id,
      productHandle: product.handle,
      productTitle: product.title,
      variantId: selectedVariant?.id || null,
      variantName: selectedVariant?.name || null,
      sku: selectedVariant?.sku || null,
      price: displayPrice,
      housePrice: selectedVariant?.house_price || pricing.housePrice,
      quantity: 1,
      image: displayImages[0],
    };

    addItem(cartItem);
    
    // Show confirmation
    alert(`Added to House: ${product.title}${selectedVariant ? ` - ${selectedVariant.name}` : ''}`);
  };

  return (
    <>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <Link href="/" style={styles.back}>
            ← All Products
          </Link>

          <div style={styles.product}>
            <div style={styles.imageSection}>
              <ProductImageGallery 
                images={displayImages}
                productTitle={product.title}
              />
            </div>

            <div style={styles.details}>
              <h1 style={styles.title}>{product.title}</h1>
              
              {product.category && (
                <span style={styles.category}>{product.category}</span>
              )}

              <PricingDisplay pricing={pricing} />

              {hasVariants && (
                <VariantSelector
                  variants={raw!.variants!}
                  selectedVariantId={selectedVariantId}
                  onVariantChange={setSelectedVariantId}
                />
              )}

              <div style={styles.description}>
                <ProductDescription 
                  description={product.description}
                  lines={raw?.description_lines || undefined}
                />
              </div>

              {inStock ? (
                <button style={styles.addButton} onClick={handleAddToCart}>
                  Add to House
                </button>
              ) : (
                <div style={styles.outOfStock}>Out of Stock</div>
              )}

              <div style={styles.source}>
                {product.source === 'shopify' ? 'Apparel' : 'Home Object'}
                {selectedVariant?.sku && ` • SKU: ${selectedVariant.sku}`}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    paddingTop: '2rem',
    paddingBottom: '3rem',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#404040',
  },
  error: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#404040',
  },
  backLink: {
    display: 'inline-block',
    marginTop: '2rem',
    color: '#1a1a1a',
    textDecoration: 'underline',
  },
  back: {
    display: 'inline-block',
    marginBottom: '2rem',
    fontSize: '0.9rem',
    color: '#404040',
    fontFamily: "'Inter', sans-serif",
  },
  product: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  details: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  title: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '2rem',
    fontWeight: 400,
    color: '#1a1a1a',
  },
  category: {
    fontSize: '0.75rem',
    color: '#404040',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontWeight: 300,
  },
  description: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    lineHeight: 1.8,
    color: '#2d2d2d',
    letterSpacing: '0.02em',
  },
  addButton: {
    padding: '1rem 2rem',
    backgroundColor: 'transparent',
    color: '#1a1a1a',
    border: '1px solid #1a1a1a',
    borderRadius: '0px',
    fontSize: '0.9rem',
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
  },
  outOfStock: {
    padding: '1rem 2rem',
    backgroundColor: '#e8e8e3',
    color: '#404040',
    fontSize: '0.9rem',
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    textAlign: 'center' as const,
  },
  source: {
    fontSize: '0.75rem',
    color: '#404040',
    fontFamily: "'Inter', sans-serif",
    paddingTop: '1rem',
    borderTop: '1px solid #e8e8e3',
  },
} as const;
