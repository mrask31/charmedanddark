'use client';

/**
 * ProductDetailClient - Single-object intimate viewing chamber
 * Feature: product-detail-focus
 * 
 * Enforces:
 * - Image-dominant layout (monument breathes)
 * - Narrative Engine integration (museum plaque aesthetic)
 * - Singular CTA with Accent Reveal (gold/red ritual interaction)
 * - Full color reveal (Darkroom complete)
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
  const [claimError, setClaimError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Display image (Darkroom filters removed - full color reveal)
  const displayImage = darkroomUrl || product.images.hero;

  // Variant detection (for Shopify apparel)
  const hasVariants = product.variants && product.variants.length > 1; // Only show selector if multiple variants
  const variants = product.variants || [];
  const isSingleVariant = variants.length === 1;

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
        
        // Build valid payload with intelligent fallbacks
        const payload = {
          item_name: product.title,
          item_type: inferItemType(product.category),
          primary_symbol: inferPrimarySymbol(product.title, product.category),
          emotional_core: inferEmotionalCore(product.title, product.category),
          energy_tone: inferEnergyTone(product.category),
        };
        
        console.log('[Narrative] Payload:', payload);
        
        const response = await fetch('/api/generate-narrative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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

  // Singular CTA handler - Wire to cart
  const handleClaim = async () => {
    if (isClaiming) return;
    
    try {
      setIsClaiming(true);
      setClaimError(null);
      
      // Get or create cart ID
      let cartId = localStorage.getItem('shopify_cart_id');
      
      if (!cartId) {
        // Create new cart
        const { createCart } = await import('@/lib/cart/shopify');
        const newCart = await createCart();
        
        if (newCart) {
          cartId = newCart.id;
          localStorage.setItem('shopify_cart_id', cartId);
        } else {
          setClaimError('Unable to add to cart. Please try again.');
          setIsClaiming(false);
          return;
        }
      }
      
      // Determine variant ID
      let variantId: string;
      
      if (hasVariants && variants.length > 1) {
        // Multiple variants - user must select
        if (!selectedVariant) {
          // No variant selected - should not happen due to button disabled state
          setIsClaiming(false);
          return;
        }
        variantId = selectedVariant;
        console.log('[CLAIM] Multi-variant product, using selected variant:', variantId);
      } else if (isSingleVariant) {
        // Single-variant products: Use the default variant ID
        // CRITICAL: Shopify requires merchandiseId (variant ID), not product ID
        variantId = variants[0].id;
        console.log('[CLAIM] Single-variant product detected, using default variant:', variantId);
      } else {
        // Fallback for products without variants array
        variantId = (product as any).metadata?.shopify_variant_id || product.id;
        console.warn('[CLAIM] No variants array found, using fallback variant ID:', variantId);
      }
      
      // Add to cart
      const { addLineItem } = await import('@/lib/cart/shopify');
      const updatedCart = await addLineItem(cartId, variantId, 1);
      
      if (updatedCart) {
        // Navigate to cart
        window.location.href = '/cart';
      } else {
        setClaimError('Unable to add to cart. Please try again.');
        setIsClaiming(false);
      }
    } catch (error) {
      console.error('[CLAIM ACTION] Failed:', error);
      setClaimError('Unable to add to cart. Please try again.');
      setIsClaiming(false);
    }
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
              <div style={styles.imagePlaceholder} />
            )}
            
            <Image
              src={displayImage}
              alt={narrative?.alt_text || product.title}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              style={{
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 300ms ease',
              }}
              onLoad={() => setImageLoaded(true)}
              priority
            />
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
              disabled={!product.inStock || (hasVariants && !selectedVariant) || isClaiming}
              style={{
                ...styles.claimButton,
                ...(isHovered && product.inStock && (!hasVariants || selectedVariant) && !isClaiming ? styles.claimButtonHover : {}),
                ...((!product.inStock || (hasVariants && !selectedVariant) || isClaiming) ? styles.claimButtonDisabled : {}),
              }}
            >
              {!product.inStock 
                ? 'Out of Stock' 
                : isClaiming
                  ? 'Adding...'
                  : hasVariants && !selectedVariant 
                    ? 'Select Size' 
                    : 'Claim'}
            </button>

            {/* Inline error display (NO modals) */}
            {claimError && (
              <div style={styles.claimError}>
                {claimError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Narrative Engine Schema Mapping
 * Ensures all payloads pass strict validation
 */

type PrimarySymbol = "moon" | "rose" | "heart" | "blade" | "bone" | "mirror" | "candle";
type EmotionalCore = "devotion" | "grief" | "protection" | "longing" | "transformation" | "memory" | "power";
type EnergyTone = "soft_whispered" | "balanced_reverent" | "dark_commanding";
type ItemType = "jewelry" | "apparel" | "home_object" | "altar_piece" | "wearable_symbol";

/**
 * Infer item type from category for Narrative Engine
 * CASE-INSENSITIVE keyword matching
 */
function inferItemType(category?: string): ItemType {
  if (!category) return 'home_object';
  
  const cat = category.toLowerCase();
  
  // Apparel detection (case-insensitive)
  if (cat.includes('apparel') || cat.includes('clothing') || cat.includes('hoodie') || cat.includes('shirt') || cat.includes('jacket') || cat.includes('sweater') || cat.includes('coat')) return 'apparel';
  
  // Jewelry detection
  if (cat.includes('jewelry') || cat.includes('ring') || cat.includes('necklace') || cat.includes('bracelet')) return 'jewelry';
  
  // Altar pieces
  if (cat.includes('altar')) return 'altar_piece';
  
  return 'home_object';
}

/**
 * Infer primary symbol from product title and category
 * Maps to valid enum: ["moon","rose","heart","blade","bone","mirror","candle"]
 * CASE-INSENSITIVE keyword matching
 */
function inferPrimarySymbol(title: string, category?: string): PrimarySymbol {
  const text = `${title} ${category || ''}`.toLowerCase();
  
  // Direct symbol matches (case-insensitive)
  if (text.includes('moon') || text.includes('lunar')) return 'moon';
  if (text.includes('rose') || text.includes('floral')) return 'rose';
  if (text.includes('heart')) return 'heart';
  if (text.includes('blade') || text.includes('sword') || text.includes('dagger') || text.includes('obsidian')) return 'blade';
  if (text.includes('bone') || text.includes('skull')) return 'bone';
  if (text.includes('mirror')) return 'mirror';
  if (text.includes('candle') || text.includes('light')) return 'candle';
  
  // Category-based fallbacks (case-insensitive)
  if (category) {
    const cat = category.toLowerCase();
    if (cat.includes('apparel') || cat.includes('clothing') || cat.includes('hoodie') || cat.includes('shirt') || cat.includes('jacket')) return 'blade'; // Armor/protection
    if (cat.includes('jewelry')) return 'heart'; // Adornment/devotion
    if (cat.includes('home')) return 'candle'; // Warmth/sanctuary
  }
  
  // Title-based apparel detection (case-insensitive)
  if (text.includes('hoodie') || text.includes('shirt') || text.includes('jacket') || text.includes('sweater') || text.includes('coat')) return 'blade';
  
  // Safe default
  return 'moon';
}

/**
 * Infer emotional core from product context
 * Maps to valid enum: ["devotion","grief","protection","longing","transformation","memory","power"]
 */
function inferEmotionalCore(title: string, category?: string): EmotionalCore {
  const text = `${title} ${category || ''}`.toLowerCase();
  
  // Keyword-based inference
  if (text.includes('protect') || text.includes('guard') || text.includes('shield')) return 'protection';
  if (text.includes('memory') || text.includes('remember') || text.includes('memorial')) return 'memory';
  if (text.includes('transform') || text.includes('change') || text.includes('rebirth')) return 'transformation';
  if (text.includes('grief') || text.includes('mourn') || text.includes('loss')) return 'grief';
  if (text.includes('power') || text.includes('strength') || text.includes('command')) return 'power';
  if (text.includes('long') || text.includes('yearn') || text.includes('desire')) return 'longing';
  
  // Safe default - devotion is universal
  return 'devotion';
}

/**
 * Infer energy tone from product type
 * Maps to valid enum: ["soft_whispered","balanced_reverent","dark_commanding"]
 */
function inferEnergyTone(category?: string): EnergyTone {
  if (!category) return 'balanced_reverent';
  
  const cat = category.toLowerCase();
  
  // Soft for delicate items
  if (cat.includes('jewelry') || cat.includes('candle')) return 'soft_whispered';
  
  // Dark for bold items
  if (cat.includes('apparel') || cat.includes('blade') || cat.includes('armor')) return 'dark_commanding';
  
  // Balanced default
  return 'balanced_reverent';
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
  claimError: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    backgroundColor: 'transparent',
    color: '#8b0000', // Deep red (blood)
    fontSize: '0.875rem',
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.5,
    textAlign: 'center' as const,
  },
} as const;
