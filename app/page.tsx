'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHouseProducts } from '@/lib/products';

// Deterministic selection - no randomness
const LANDING_SELECTION = [
  'black-swan-whiskey-glass-set-of-4',
  'black-wood-board-small',
  'brass-and-glass-soap-dish',
  'calming-crystal-candle-with-rough-amethyst',
  'gothic-halloween-black-spider-teacup',
  'gothic-striped-bat-wing-halloween-teacup',
  'large-set-of-3-metallic-gold-cast-iron-starburst-wall-decor',
  'made-for-each-other-art-print',
  'midnight-wing-dual-taper-candle-holder-matte-black'
];

// Anchor object - the hero product
const ANCHOR_OBJECT_SLUG = 'calming-crystal-candle-with-rough-amethyst';

// Proof row - first 4 items
const PROOF_ROW_SLUGS = LANDING_SELECTION.slice(0, 4);

export default function HomePage() {
  const [anchorProduct, setAnchorProduct] = useState<any>(null);
  const [proofProducts, setProofProducts] = useState<any[]>([]);
  const [gridProducts, setGridProducts] = useState<any[]>([]);
  const [isSanctuary, setIsSanctuary] = useState(false);

  useEffect(() => {
    const houseProducts = getHouseProducts();
    
    // Get anchor object
    const anchor = houseProducts.find(p => p.slug === ANCHOR_OBJECT_SLUG);
    setAnchorProduct(anchor);
    
    // Get proof row products
    const proof = PROOF_ROW_SLUGS
      .map(slug => houseProducts.find(p => p.slug === slug))
      .filter(Boolean);
    setProofProducts(proof);
    
    // Get grid products (all 9)
    const grid = LANDING_SELECTION
      .map(slug => houseProducts.find(p => p.slug === slug))
      .filter(Boolean);
    setGridProducts(grid);

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
    <main className="landing-v2">
      {/* SECTION 1 — ABOVE THE FOLD: ANCHOR OBJECT + SUBTLE BACKGROUND */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">Charmed & Dark</h1>
          <p className="landing-hero-subhead">Objects made slowly.</p>
          <p className="landing-hero-microline">A house of pieces chosen to remain.</p>

          {/* Anchor Object Card */}
          {anchorProduct && (
            <Link href={`/product/${anchorProduct.slug}`} className="landing-anchor">
              <div className="landing-anchor-image">
                {anchorProduct.images[0] && (
                  <img 
                    src={anchorProduct.images[0]} 
                    alt={anchorProduct.name}
                    loading="eager"
                  />
                )}
              </div>
              <div className="landing-anchor-info">
                <h3 className="landing-anchor-name">{anchorProduct.name}</h3>
                <p className="landing-anchor-price">
                  {isSanctuary 
                    ? formatPrice(anchorProduct.priceSanctuary)
                    : formatPrice(anchorProduct.pricePublic)
                  }
                </p>
              </div>
            </Link>
          )}

          <div className="landing-hero-links">
            <Link href="/shop" className="landing-hero-link">
              View the Shop →
            </Link>
            <a href="#house-grid" className="landing-hero-link landing-hero-link-secondary">
              Explore the House →
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 2 — IMMEDIATE COMMERCIAL PROOF ROW */}
      <section className="landing-proof-row">
        <p className="landing-proof-label">Inside the House</p>
        
        <div className="landing-proof-grid">
          {proofProducts.map(product => (
            <Link 
              href={`/product/${product.slug}`} 
              key={product.id}
              className="landing-proof-card"
            >
              <div className="landing-proof-image">
                {product.images[0] && (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="landing-proof-info">
                <h3 className="landing-proof-name">{product.name}</h3>
                <p className="landing-proof-price">
                  {isSanctuary 
                    ? formatPrice(product.priceSanctuary)
                    : formatPrice(product.pricePublic)
                  }
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3 — SINGLE RESTRAINT BLOCK */}
      <section className="landing-rule">
        <div className="landing-rule-content">
          <h2 className="landing-rule-title">A simple rule</h2>
          <p className="landing-rule-body">
            No urgency. No personalization.<br />
            Nothing changes based on who is looking.
          </p>
        </div>
      </section>

      {/* SECTION 4 — THE HOUSE (CURATED GRID) */}
      <section className="landing-grid" id="house-grid">
        <div className="landing-grid-header">
          <p className="landing-grid-intro">
            A small selection from the collection. Everything shown is available.
          </p>
        </div>

        <div className="landing-grid-items">
          {gridProducts.map(product => (
            <Link 
              href={`/product/${product.slug}`} 
              key={product.id}
              className="landing-grid-card"
            >
              <div className="landing-grid-image">
                {product.images[0] && (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="landing-grid-info">
                <h3 className="landing-grid-name">{product.name}</h3>
                <p className="landing-grid-price">
                  {isSanctuary 
                    ? formatPrice(product.priceSanctuary)
                    : formatPrice(product.pricePublic)
                  }
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 5 — SANCTUARY REFERENCE (COLD, OPTIONAL) */}
      <section className="landing-sanctuary">
        <div className="landing-sanctuary-content">
          <h2 className="landing-sanctuary-title">The Sanctuary</h2>
          <p className="landing-sanctuary-body">
            Some visitors enter. Others do not.<br />
            It exists separately from the shop.
          </p>
          <Link href="/mirror" className="landing-sanctuary-link">
            Enter the Sanctuary →
          </Link>
        </div>
      </section>

      {/* SECTION 6 — FINAL BLOCK (AUTHORITY EXIT) */}
      <section className="landing-exit">
        <div className="landing-exit-content">
          <p className="landing-exit-statement">
            The objects will be here.<br />
            Nothing unlocks. Nothing expires.
          </p>
          <div className="landing-exit-links">
            <Link href="/shop" className="landing-exit-link">
              View the Shop →
            </Link>
            <Link href="/" className="landing-exit-link landing-exit-link-secondary">
              Leave the House →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
