'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHouseProducts, type Product } from '@/lib/products';

// Deterministic selections - no randomness
const FEATURED_SLUGS = [
  'black-swan-whiskey-glass-set-of-4',
  'calming-crystal-candle-with-rough-amethyst',
  'gothic-halloween-black-spider-teacup',
  'large-set-of-3-metallic-gold-cast-iron-starburst-wall-decor',
  'made-for-each-other-art-print',
  'midnight-wing-dual-taper-candle-holder-matte-black',
  'brass-and-glass-soap-dish',
  'black-wood-board-small',
  'gothic-striped-bat-wing-halloween-teacup',
  'melancholy-monster-art-print',
  'heart-shaped-resin-flower-vase',
  'luxury-satin-6-piece-sheet-set'
];

const BEST_SELLERS_SLUGS = [
  'black-swan-whiskey-glass-set-of-4',
  'calming-crystal-candle-with-rough-amethyst',
  'large-set-of-3-metallic-gold-cast-iron-starburst-wall-decor',
  'midnight-wing-dual-taper-candle-holder-matte-black',
  'gothic-halloween-black-spider-teacup',
  'made-for-each-other-art-print'
];

// Canonical shop sections
const SHOP_SECTIONS = [
  { name: 'Objects of Use', slug: 'objects-of-use', description: 'Functional pieces for daily rituals' },
  { name: 'Ritual Drinkware', slug: 'ritual-drinkware', description: 'Vessels for contemplative moments' },
  { name: 'Candles & Candle Holders', slug: 'candles-scent', description: 'Light and shadow objects' },
  { name: 'Table & Display', slug: 'table-display', description: 'Surfaces and presentation pieces' },
  { name: 'Wall Objects', slug: 'wall-objects', description: 'Framed art and wall-mounted pieces' },
  { name: 'Decor Objects', slug: 'decor-objects', description: 'Textiles and decorative elements' },
  { name: 'Holiday', slug: 'holiday', description: 'Seasonal and celebratory objects' }
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isSanctuary, setIsSanctuary] = useState(false);

  useEffect(() => {
    const houseProducts = getHouseProducts();
    
    // Get featured products (deterministic)
    const featured = FEATURED_SLUGS
      .map(slug => houseProducts.find(p => p.slug === slug))
      .filter((p): p is Product => p !== undefined);
    setFeaturedProducts(featured);
    
    // Get best sellers (deterministic)
    const best = BEST_SELLERS_SLUGS
      .map(slug => houseProducts.find(p => p.slug === slug))
      .filter((p): p is Product => p !== undefined);
    setBestSellers(best);

    // Check sanctuary status
    if (typeof window !== 'undefined') {
      setIsSanctuary(localStorage.getItem('sanctuary_preview') === 'true');
    }
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <main className="ecom-landing">
      {/* A) HERO — VISUAL-FIRST */}
      <section className="ecom-hero">
        <div className="ecom-hero-bg" />
        <div className="ecom-hero-overlay" />
        
        <div className="ecom-hero-content">
          <div className="ecom-hero-text">
            <h1 className="ecom-hero-title">Charmed & Dark</h1>
            <p className="ecom-hero-subhead">Objects made slowly. Chosen to remain.</p>
            <div className="ecom-hero-rule" />
            <p className="ecom-hero-note">No urgency. No personalization.</p>
            
            <div className="ecom-hero-actions">
              <Link href="/shop" className="ecom-btn-primary">
                Shop The House
              </Link>
              <a href="#shop-sections" className="ecom-link-secondary">
                Explore the sections →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* B) FEATURED OBJECTS — COMMERCE-FIRST PROOF */}
      <section className="ecom-section">
        <div className="ecom-container">
          <h2 className="ecom-section-title">Featured Objects</h2>
          
          <div className="ecom-product-grid">
            {featuredProducts.map(product => (
              <Link 
                href={`/product/${product.slug}`} 
                key={product.id}
                className="ecom-product-card"
              >
                <div className="ecom-product-image">
                  {product.images[0] && (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="ecom-product-info">
                  <h3 className="ecom-product-name">{product.name}</h3>
                  <p className="ecom-product-price">
                    {isSanctuary 
                      ? formatPrice(product.priceSanctuary)
                      : formatPrice(product.pricePublic)
                    }
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* C) SHOP BY SECTION — FAST NAVIGATION */}
      <section className="ecom-section ecom-section-alt" id="shop-sections">
        <div className="ecom-container">
          <h2 className="ecom-section-title">Shop by Section</h2>
          
          <div className="ecom-section-grid">
            {SHOP_SECTIONS.map(section => (
              <Link 
                href="/shop" 
                key={section.slug}
                className="ecom-section-tile"
              >
                <h3 className="ecom-section-tile-name">{section.name}</h3>
                <p className="ecom-section-tile-desc">{section.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* D) BEST SELLERS */}
      <section className="ecom-section">
        <div className="ecom-container">
          <h2 className="ecom-section-title">Best Sellers</h2>
          
          <div className="ecom-product-grid ecom-product-grid-6">
            {bestSellers.map(product => (
              <Link 
                href={`/product/${product.slug}`} 
                key={product.id}
                className="ecom-product-card"
              >
                <div className="ecom-product-image">
                  {product.images[0] && (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="ecom-product-info">
                  <h3 className="ecom-product-name">{product.name}</h3>
                  <p className="ecom-product-price">
                    {isSanctuary 
                      ? formatPrice(product.priceSanctuary)
                      : formatPrice(product.pricePublic)
                    }
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* E) SMALL RESTRAINT NOTE */}
      <section className="ecom-restraint">
        <div className="ecom-container">
          <p className="ecom-restraint-text">
            Nothing here changes based on who is looking.<br />
            Everything shown is available.
          </p>
        </div>
      </section>

      {/* F) SANCTUARY — DE-EMPHASIZED */}
      <section className="ecom-footer-note">
        <div className="ecom-container">
          <p className="ecom-footer-text">
            The Sanctuary exists separately. <Link href="/mirror" className="ecom-footer-link">Enter →</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
