'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/context';
import { getSupabaseClient } from '@/lib/supabase/client';
import { applyMemberDiscount } from '@/lib/sanctuary/auth';
import Header from '@/components/Header';
import PricingDisplay from '@/components/PricingDisplay';
import ProductDescription from '@/components/ProductDescription';
import ProductImageGallery from '@/components/ProductImageGallery';
import VariantSelector from '@/components/VariantSelector';
import { getPricingDisplay } from '@/lib/pricing';
import type { UnifiedProduct } from '@/lib/products';
import type { Product as SupabaseProduct, ProductVariant } from '@/lib/supabase/client';

interface ProductClientProps {
  product: UnifiedProduct;
  raw: SupabaseProduct;
  curatorNote: string | null;
}

export default function ProductClient({ product, raw, curatorNote }: ProductClientProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    raw.variants && raw.variants.length > 0 ? raw.variants[0].id : null
  );
  const [isSanctuaryMember, setIsSanctuaryMember] = useState(false);
  const supabase = getSupabaseClient();

  // Check Sanctuary membership
  useEffect(() => {
    const checkMembership = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSanctuaryMember(session?.user?.user_metadata?.sanctuary_member === true);
    };
    checkMembership();
  }, [supabase]);

  // Get selected variant or use parent product data
  const hasVariants = raw?.variants && raw.variants.length > 0;
  const selectedVariant = hasVariants 
    ? raw!.variants!.find((v: ProductVariant) => v.id === selectedVariantId)
    : null;

  // Use variant price if selected, otherwise parent price
  const basePrice = selectedVariant?.price || product.price;
  const displayPrice = isSanctuaryMember ? applyMemberDiscount(basePrice) : basePrice;
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
      housePrice: selectedVariant?.house_price || pricing.house,
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

              {isSanctuaryMember ? (
                <div style={styles.memberPricing}>
                  <div style={styles.memberPrice}>
                    ${displayPrice.toFixed(2)}
                  </div>
                  <div style={styles.memberLabel}>Member Price</div>
                  <div style={styles.originalPrice}>${basePrice.toFixed(2)}</div>
                </div>
              ) : (
                <PricingDisplay pricing={pricing} />
              )}

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

              {curatorNote && (
                <div style={styles.curatorNote}>
                  <div style={styles.curatorLabel}>Curator's Note</div>
                  <div style={styles.curatorText}>{curatorNote}</div>
                </div>
              )}

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
  memberPricing: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  memberPrice: {
    fontSize: '1.75rem',
    fontWeight: 300,
    color: '#1a1a1a',
  },
  memberLabel: {
    fontSize: '0.75rem',
    color: '#404040',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontFamily: "'Inter', sans-serif",
  },
  originalPrice: {
    fontSize: '0.875rem',
    color: '#999',
    textDecoration: 'line-through',
  },
  curatorNote: {
    padding: '1rem',
    backgroundColor: '#fafafa',
    border: '1px solid #e8e8e3',
    marginTop: '0.5rem',
  },
  curatorLabel: {
    fontSize: '0.65rem',
    color: '#404040',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    marginBottom: '0.5rem',
  },
  curatorText: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    color: '#2d2d2d',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    letterSpacing: '0.01em',
  },
} as const;
