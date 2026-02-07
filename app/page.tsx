'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getActiveCoreUniform, type ApparelItem } from '@/lib/apparel';
import { getHouseProducts, type Product } from '@/lib/products';

// Deterministic featured apparel selection
const FEATURED_APPAREL_SLUGS = [
  'crest-tee',
  'full-graphic-tee',
  'pullover-hoodie',
  'zip-hoodie',
  'crop-tee',
  'gothic-tee',
  'beanie',
  'valentines-tee'
];

// Category tiles with images
const APPAREL_CATEGORIES = [
  { 
    name: 'T-Shirts', 
    slug: 't-shirts',
    image: '/images/Female_tshirt.png',
    link: '/uniform'
  },
  { 
    name: 'Hoodies', 
    slug: 'hoodies',
    image: '/images/Female_signature_hoodie.png',
    link: '/uniform'
  },
  { 
    name: 'Headwear', 
    slug: 'headwear',
    image: '/images/female_beanie.png',
    link: '/uniform'
  },
  { 
    name: 'Accessories', 
    slug: 'accessories',
    image: '/images/female_beanie_white.png',
    link: '/uniform'
  }
];

// House objects preview (3-4 items)
const HOUSE_PREVIEW_SLUGS = [
  'black-swan-whiskey-glass-set-of-4',
  'calming-crystal-candle-with-rough-amethyst',
  'midnight-wing-dual-taper-candle-holder-matte-black',
  'gothic-halloween-black-spider-teacup'
];

export default function HomePage() {
  const [featuredApparel, setFeaturedApparel] = useState<ApparelItem[]>([]);
  const [housePreview, setHousePreview] = useState<Product[]>([]);
  const [isSanctuary, setIsSanctuary] = useState(false);

  useEffect(() => {
    // Get featured apparel (deterministic)
    const allApparel = getActiveCoreUniform();
    const featured = FEATURED_APPAREL_SLUGS
      .map(slug => allApparel.find(item => item.slug === slug))
      .filter((item): item is ApparelItem => item !== undefined);
    setFeaturedApparel(featured);
    
    // Get house objects preview (deterministic)
    const houseProducts = getHouseProducts();
    const preview = HOUSE_PREVIEW_SLUGS
      .map(slug => houseProducts.find(p => p.slug === slug))
      .filter((p): p is Product => p !== undefined);
    setHousePreview(preview);

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
    <main className="fashion-landing">
      {/* HERO — FASHION-FIRST */}
      <section className="fashion-hero">
        <div className="fashion-hero-bg" />
        <div className="fashion-hero-overlay" />
        
        <div className="fashion-hero-content">
          <div className="fashion-hero-text">
            <h1 className="fashion-hero-title">Charmed & Dark.<br />Made to be worn.</h1>
            <p className="fashion-hero-subline">Modern gothic apparel designed for daily wear.</p>
            
            <div className="fashion-hero-actions">
              <Link href="/uniform" className="fashion-btn-primary">
                Shop Apparel
              </Link>
              <Link href="/shop" className="fashion-link-secondary">
                View all products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED APPAREL */}
      <section className="fashion-section">
        <div className="fashion-container">
          <h2 className="fashion-section-title">Featured Apparel</h2>
          
          <div className="fashion-apparel-grid">
            {featuredApparel.map(item => (
              <Link 
                href={`/uniform/${item.slug}`} 
                key={item.id}
                className="fashion-apparel-card"
              >
                <div className="fashion-apparel-image">
                  {item.images[0] && (
                    <img 
                      src={item.images[0]} 
                      alt={item.name}
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="fashion-apparel-info">
                  <h3 className="fashion-apparel-name">{item.name}</h3>
                  <p className="fashion-apparel-price">
                    {isSanctuary 
                      ? formatPrice(item.priceSanctuary)
                      : formatPrice(item.pricePublic)
                    }
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="fashion-section fashion-section-alt">
        <div className="fashion-container">
          <h2 className="fashion-section-title">Shop by Category</h2>
          
          <div className="fashion-category-grid">
            {APPAREL_CATEGORIES.map(category => (
              <Link 
                href={category.link} 
                key={category.slug}
                className="fashion-category-card"
              >
                <div className="fashion-category-image">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    loading="lazy"
                  />
                </div>
                <div className="fashion-category-overlay">
                  <h3 className="fashion-category-name">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND ETHOS */}
      <section className="fashion-ethos">
        <div className="fashion-container">
          <p className="fashion-ethos-text">
            Charmed & Dark creates everyday pieces with a gothic edge. Designed to be worn, not performed.
          </p>
        </div>
      </section>

      {/* HOUSE OBJECTS PREVIEW */}
      <section className="fashion-section">
        <div className="fashion-container">
          <h2 className="fashion-section-title">Objects for the home</h2>
          
          <div className="fashion-house-grid">
            {housePreview.map(product => (
              <Link 
                href={`/product/${product.slug}`} 
                key={product.id}
                className="fashion-house-card"
              >
                <div className="fashion-house-image">
                  {product.images[0] && (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="fashion-house-info">
                  <h3 className="fashion-house-name">{product.name}</h3>
                  <p className="fashion-house-price">
                    {isSanctuary 
                      ? formatPrice(product.priceSanctuary)
                      : formatPrice(product.pricePublic)
                    }
                  </p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="fashion-house-cta">
            <Link href="/shop" className="fashion-link-secondary">
              View all objects →
            </Link>
          </div>
        </div>
      </section>

      {/* THE MIRROR (SECONDARY) */}
      <section className="fashion-mirror">
        <div className="fashion-container">
          <p className="fashion-mirror-text">
            The Mirror exists separately. <Link href="/mirror" className="fashion-mirror-link">Enter →</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
