'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { initializeSectionReveals } from './utils/sectionReveal';
import { getHouseProducts } from '@/lib/products';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isSanctuary, setIsSanctuary] = useState(false);

  // Initialize section reveal observer
  useEffect(() => {
    const cleanup = initializeSectionReveals();
    return cleanup;
  }, []);

  useEffect(() => {
    // Get 6-9 featured products from the house
    const houseProducts = getHouseProducts();
    const featured = houseProducts.slice(0, 9);
    setFeaturedProducts(featured);

    // Check sanctuary status
    if (typeof window !== 'undefined') {
      setIsSanctuary(localStorage.getItem('sanctuary_preview') === 'true');
    }
  }, []);

  // Format price as USD
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <>
      <Head>
        <title>Charmed & Dark | Objects made slowly</title>
        <meta name="description" content="Objects made slowly. Nothing here is optimized to persuade you." />
      </Head>

      <main className="landing">
        {/* 1. ABOVE THE FOLD — IMMEDIATE SIGNAL */}
        <section className="hero-hybrid">
          <div className="hero-hybrid-content">
            <h1 className="hero-hybrid-title">Charmed & Dark</h1>
            
            <p className="hero-hybrid-statement">
              Objects made slowly. Nothing here is optimized to persuade you.
            </p>
            
            <p className="hero-hybrid-statement">
              We make pieces for people who already know what they're looking for.
            </p>

            <div className="hero-hybrid-paths">
              <Link href="/shop" className="path-primary">
                View the Objects
              </Link>
              <Link href="#how-it-works" className="path-secondary">
                Learn how this works
              </Link>
            </div>
          </div>
        </section>

        {/* 2. PROOF OF RESTRAINT — WHY THIS FEELS DIFFERENT */}
        <section className="proof-section">
          <div className="proof-content">
            <p className="proof-statement">
              We don't use urgency. We don't personalize pricing or recommendations. We don't track you to convince you later.
            </p>
            
            <p className="proof-statement">
              Nothing on this site changes based on who you are, what you click, or how long you stay.
            </p>
            
            <p className="proof-statement">
              You're free to look. You're free to leave. You're free to return later.
            </p>
          </div>
        </section>

        {/* 3. OBJECTS FIRST — VALUE WITHOUT SELLING */}
        <section className="objects-first">
          <div className="objects-first-header">
            <h2 className="objects-first-title">The House</h2>
            <p className="objects-first-subtitle">
              A small selection from the collection. Everything shown is available.
            </p>
          </div>

          <div className="objects-first-grid">
            {featuredProducts.map(product => (
              <Link 
                href={`/product/${product.slug}`} 
                key={product.id}
                className="featured-product-card"
              >
                <div className="featured-product-image">
                  {product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="featured-product-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                
                <div className="featured-product-info">
                  <h3 className="featured-product-name">{product.name}</h3>
                  
                  <div className="featured-product-pricing">
                    {isSanctuary ? (
                      <>
                        <span className="featured-price sanctuary">{formatPrice(product.priceSanctuary)}</span>
                        <span className="featured-price-label">Sanctuary</span>
                      </>
                    ) : (
                      <span className="featured-price">{formatPrice(product.pricePublic)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. HOW THE SHOP WORKS — CLARITY = CONVERSION */}
        <section className="how-it-works" id="how-it-works">
          <div className="how-it-works-content">
            <p className="how-it-works-statement">
              The shop is organized by where objects live, not by trend or theme.
            </p>
            
            <p className="how-it-works-statement">
              Nothing is hidden. Nothing appears or disappears. If it's here, it's for sale.
            </p>
            
            <p className="how-it-works-statement">
              You'll see the full collection inside.
            </p>
          </div>
        </section>

        {/* 5. SANCTUARY — DEPTH, NOT A FEATURE */}
        <section className="sanctuary-reference">
          <div className="sanctuary-reference-content">
            <p className="sanctuary-reference-statement">
              Some visitors choose to enter the Sanctuary.
            </p>
            
            <p className="sanctuary-reference-statement">
              It's a private space. It doesn't sell anything. It doesn't learn from you. It doesn't remember you.
            </p>
            
            <p className="sanctuary-reference-statement">
              It exists separately from the shop.
            </p>
            
            <p className="sanctuary-reference-statement">
              You don't need it to purchase. You don't need to understand it to ignore it.
            </p>

            <p className="sanctuary-reference-invitation">
              Those who wish may enter.
            </p>

            <Link href="/mirror" className="sanctuary-reference-link">
              Enter the Sanctuary
            </Link>
          </div>
        </section>

        {/* 6. EXIT WITH AGENCY — PERMISSION TO LEAVE */}
        <section className="exit-section">
          <div className="exit-content">
            <p className="exit-statement">
              You don't need to decide today.
            </p>
            
            <p className="exit-statement">
              The objects will be here. Nothing unlocks. Nothing expires.
            </p>
            
            <p className="exit-statement">
              When you're ready, you'll know.
            </p>

            <div className="exit-paths">
              <Link href="/shop" className="exit-path">
                View the Shop
              </Link>
              <Link href="/" className="exit-path">
                Return Later
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
