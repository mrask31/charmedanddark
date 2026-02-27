'use client';

/**
 * ProductDetailClient - Single-object intimate viewing chamber
 * Feature: product-detail-focus
 * 
 * Enforces:
 * - Image-dominant layout (monument breathes)
 * - Narrative Engine integration (museum plaque aesthetic)
 * - Singular CTA with Accent Reveal (gold/red ritual interaction)
 * - Darkroom pending state (grayscale + PROCESSING tag)
 * - Dual Pricing Law
 * - Absolute Geometry (0px border radius)
 * - Distraction-free (NO related products, cross-sells, timers, urgency)
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UnifiedProduct } from '@/lib/products';
import { calculateHousePrice } from '@/lib/products-discovery';
import { getSupabaseClient } from '@/lib/supabase/client';

interface ProductDetailClientProps {
  product: UnifiedProduct;
  initialAuthState: boolean;
}

interface NarrativeBundle {
  short_description: string;
  long_ritual_description: string;
  ritual_intention_prompt: string;
  care_use_note: string;
  alt_text: string;
}

export default function ProductDetailClient({ product, initialAuthState }: ProductDetailClientProps) {
  const [narrative, setNarrative] = useState<NarrativeBundle | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(true);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // Darkroom state detection
  const darkroomUrl = product.metadata?.darkroom_url;
  const isDarkroomProcessing = !darkroomUrl && product.images.hero;
  const displayImage = darkroomUrl || product.images.hero;

  // Variant detection (for Shopify apparel)
  const hasVariants = product.source === 'shopify' || (product as any).variants?.length > 0;
  const variants = (product as any).variants || [];

  // Pricing - Dual Pricing Law
  const standardPrice = product.price;
  const housePrice = calculateHousePrice(standardPrice);

  // Fetch narrative from Narrative Engine
  useEffect(() => {
    async function fetchNarrative() {
      try {
        console.log('[Narrative] Starting fetch for:', product.title);
        setNarrativeLoading(true);
        setNarrativeError(null);
        
        const response = await fetch('/api/generate-narrative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item_name: product.title,
            item_type: inferItemType(product.category),
            primary_symbol: 'devotion',
            emotional_core: 'devotion',
            energy_tone: 'balanced_reverent',
          }),
        });

        console.log('[Narrative] Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Narrative] API error:', response.status, errorText);
          throw new Error(`Narrative API returned ${response.status}`);
        }

        const result = await response.json();
        console.log('[Narrative] API result:', result);
        
        if (result.success && result.data) {
          console.log('[Narrative] Successfully loaded narrative');
          setNarrative(result.data);
        } else {
          console.error('[Narrative] API returned unsuccessful result:', result);
          setNarrativeError('Narrative generation failed');
        }
      } catch (error) {
        console.error('[Narrative] Fetch failed:', error);
        setNarrativeError('Failed to load narrative');
      } finally {
        setNarrativeLoading(false);
      }
    }

    fetchNarrative();
  }, [product.title, product.category]);

  // Authentication state listener
  useEffect(() => {
    const supabase = getSupabaseClient();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Singular CTA handler (stub for cart integration)
  const handleClaim = () => {
    console.log('[CLAIM ACTION]', {
      productId: product.id,
      productHandle: product.handle,
      productTitle: product.title,
      price: standardPrice,
      housePrice,
      timestamp: new Date().toISOString(),
    });
    
    // TODO: Wire to cart in next sprint
    alert(`Claimed: ${product.title}\n\nThis will be wired to the cart in the next sprint.`);
  };

  return (
    <div style={styles.page}>
      {/* Back navigation */}
      <div style={styles.container}>
        <Link href="/shop" style={styles.back}>
          ← All Products
        </Link>
      </div>

      {/* Image-dominant layout */}
      <div style={styles.productLayout}>
        {/* Image Gallery - The Monument */}
        <div style={styles.imageSection}>
          <div style={styles.imageContainer}>
            {!imageLoaded && (
              <div style={styles.imagePlaceholder}>
                {isDarkroomProcessing && (
                  <div style={styles.darkroomOverlay}>
                    PROCESSING // DARKROOM
                  </div>
                )}
              </div>
            )}
            
            <Image
              src={displayImage}
              alt={narrative?.alt_text || product.title}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              style={{
                objectFit: 'cover',
                filter: isDarkroomProcessing ? 'grayscale(100%) contrast(1.2)' : 'none',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 300ms ease',
              }}
              onLoad={() => setImageLoaded(true)}
              priority
            />

            {isDarkroomProcessing && imageLoaded && (
              <div style={styles.darkroomOverlay}>
                PROCESSING // DARKROOM
              </div>
            )}
          </div>
        </div>

        {/* Product Info - The Plaque */}
        <div style={styles.infoSection}>
          <div style={styles.infoContainer}>
            {/* Title */}
            <h1 style={styles.title}>{product.title}</h1>

            {/* Category */}
            {product.category && (
              <div style={styles.category}>{product.category}</div>
            )}

            {/* Pricing - Dual Pricing Law */}
            <div style={styles.pricingSection}>
              {isAuthenticated ? (
                // Recognized: House price only
                <div style={styles.houseOnly}>
                  <span style={styles.priceValue}>${housePrice}</span>
                </div>
              ) : (
                // Uninitiated: Side-by-side
                <div style={styles.dualPricing}>
                  <span style={styles.priceValue}>${standardPrice}</span>
                  <span style={styles.housePriceLabel}>
                    ${housePrice} House
                  </span>
                </div>
              )}
            </div>

            {/* Narrative - Museum Plaque Aesthetic */}
            <div style={styles.narrativeSection}>
              {narrativeLoading ? (
                <div style={styles.narrativeLoading}>
                  INVOKING NARRATIVE...
                </div>
              ) : narrativeError || !narrative ? (
                <div style={styles.narrativeFallback}>
                  {product.description || 'A carefully curated object for everyday gothic living.'}
                </div>
              ) : (
                <>
                  <div style={styles.shortDescription}>
                    {narrative.short_description}
                  </div>
                  <div style={styles.longDescription}>
                    {narrative.long_ritual_description}
                  </div>
                  {narrative.ritual_intention_prompt && (
                    <div style={styles.intentionPrompt}>
                      {narrative.ritual_intention_prompt}
                    </div>
                  )}
                  {narrative.care_use_note && (
                    <div style={styles.careNote}>
                      {narrative.care_use_note}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Variant Selector - For Apparel */}
            {hasVariants && variants.length > 0 && (
              <div style={styles.variantSection}>
                <div style={styles.variantLabel}>Size</div>
                <div style={styles.variantGrid}>
                  {variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      style={{
                        ...styles.variantButton,
                        ...(selectedVariant === variant.id ? styles.variantButtonSelected : {}),
                        ...(variant.stock_quantity === 0 ? styles.variantButtonDisabled : {}),
                      }}
                      disabled={variant.stock_quantity === 0}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Singular CTA - The Ritual Interaction */}
            <button
              onClick={handleClaim}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={!product.inStock || (hasVariants && !selectedVariant)}
              style={{
                ...styles.claimButton,
                ...(isHovered && product.inStock && (!hasVariants || selectedVariant) ? styles.claimButtonHover : {}),
                ...((!product.inStock || (hasVariants && !selectedVariant)) ? styles.claimButtonDisabled : {}),
              }}
            >
              {!product.inStock 
                ? 'Out of Stock' 
                : hasVariants && !selectedVariant 
                  ? 'Select Size' 
                  : 'Claim'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Infer item type from category for Narrative Engine
 */
function inferItemType(category?: string): string {
  if (!category) return 'home_object';
  
  const cat = category.toLowerCase();
  if (cat.includes('apparel') || cat.includes('clothing')) return 'apparel';
  if (cat.includes('candle')) return 'candle_holder';
  if (cat.includes('light')) return 'candle_holder';
  
  return 'home_object';
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f0', // Off-white
    paddingTop: '2rem',
    paddingBottom: '4rem',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 3rem',
  },
  back: {
    display: 'inline-block',
    fontSize: '0.875rem',
    color: '#404040',
    textDecoration: 'none',
    marginBottom: '2rem',
    fontFamily: "'Inter', sans-serif",
  },
  productLayout: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 3rem',
    display: 'grid',
    gridTemplateColumns: '60% 40%', // Image dominance
    gap: '3rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  imageSection: {
    position: 'relative' as const,
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%',
    aspectRatio: '4/5',
    backgroundColor: '#e8e8e3',
    borderRadius: '0px', // Absolute Geometry
    overflow: 'hidden',
  },
  imagePlaceholder: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#e8e8e3',
  },
  darkroomOverlay: {
    position: 'absolute' as const,
    top: '1rem',
    left: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#f5f5f0',
    fontSize: '0.75rem',
    letterSpacing: '0.2em',
    fontWeight: 300,
    fontFamily: "'Inter', sans-serif",
    zIndex: 10,
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 400,
    fontFamily: "'Crimson Pro', serif",
    color: '#1a1a1a',
    lineHeight: 1.2,
    marginBottom: '0.5rem',
  },
  category: {
    fontSize: '0.75rem',
    color: '#404040',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontFamily: "'Inter', sans-serif",
  },
  pricingSection: {
    paddingTop: '1rem',
    borderTop: '1px solid #e8e8e3',
  },
  houseOnly: {
    fontSize: '1.75rem',
    fontWeight: 300,
    color: '#1a1a1a',
  },
  dualPricing: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: '1.75rem',
    fontWeight: 300,
    color: '#1a1a1a',
  },
  housePriceLabel: {
    fontSize: '1.25rem',
    fontWeight: 300,
    color: '#404040',
  },
  narrativeSection: {
    paddingTop: '1rem',
    borderTop: '1px solid #e8e8e3',
  },
  narrativeLoading: {
    fontSize: '0.75rem',
    color: '#404040',
    letterSpacing: '0.2em',
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase' as const,
  },
  narrativeFallback: {
    fontSize: '1rem',
    lineHeight: 1.8,
    color: '#2d2d2d',
    fontFamily: "'Inter', sans-serif",
  },
  shortDescription: {
    fontSize: '1.1rem',
    lineHeight: 1.8,
    color: '#1a1a1a',
    fontFamily: "'Crimson Pro', serif",
    marginBottom: '1.5rem',
  },
  longDescription: {
    fontSize: '1rem',
    lineHeight: 1.8,
    color: '#2d2d2d',
    fontFamily: "'Inter', sans-serif",
    marginBottom: '1.5rem',
  },
  intentionPrompt: {
    fontSize: '0.9rem',
    lineHeight: 1.7,
    color: '#404040',
    fontFamily: "'Inter', sans-serif",
    fontStyle: 'italic' as const,
    marginBottom: '1rem',
  },
  careNote: {
    fontSize: '0.85rem',
    lineHeight: 1.6,
    color: '#666',
    fontFamily: "'Inter', sans-serif",
    paddingTop: '1rem',
    borderTop: '1px solid #e8e8e3',
  },
  variantSection: {
    paddingTop: '1rem',
    borderTop: '1px solid #e8e8e3',
  },
  variantLabel: {
    fontSize: '0.75rem',
    color: '#404040',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontFamily: "'Inter', sans-serif",
    marginBottom: '0.75rem',
  },
  variantGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '0.5rem',
  },
  variantButton: {
    padding: '0.75rem',
    backgroundColor: 'transparent',
    color: '#1a1a1a',
    border: '1px solid #e8e8e3',
    borderRadius: '0px', // Absolute Geometry
    fontSize: '0.875rem',
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  variantButtonSelected: {
    borderColor: '#1a1a1a',
    backgroundColor: '#1a1a1a',
    color: '#f5f5f0',
  },
  variantButtonDisabled: {
    borderColor: '#e8e8e3',
    color: '#ccc',
    cursor: 'not-allowed',
    textDecoration: 'line-through',
  },
  claimButton: {
    padding: '1rem 2rem',
    backgroundColor: 'transparent',
    color: '#1a1a1a',
    border: '2px solid #d4af37', // Gold - Accent Reveal
    borderRadius: '0px', // Absolute Geometry
    fontSize: '0.9rem',
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    width: '100%',
    marginTop: '1rem',
  },
  claimButtonHover: {
    borderColor: '#8b0000', // Red - Accent Reveal
    boxShadow: '0 0 20px rgba(139, 0, 0, 0.3)',
  },
  claimButtonDisabled: {
    borderColor: '#e8e8e3',
    color: '#999',
    cursor: 'not-allowed',
  },
} as const;
