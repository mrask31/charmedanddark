'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getActiveCoreUniform, 
  getActiveDrops, 
  formatPrice,
  getDropDescription,
  getDropName,
  type ApparelItem 
} from '@/lib/apparel';

function ApparelCard({ item, isSanctuary }: { item: ApparelItem; isSanctuary: boolean }) {
  return (
    <Link 
      href={`/uniform/${item.slug}`}
      className="apparel-card"
    >
      <div className="apparel-image">
        {item.images.length > 0 ? (
          <img 
            src={item.images[0]} 
            alt={item.name}
            loading="lazy"
          />
        ) : (
          <div className="apparel-image-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>
      
      <div className="apparel-info">
        <h3 className="apparel-name">{item.name}</h3>
        <p className="apparel-short-description">{item.shortDescription}</p>
        
        <div className="apparel-pricing">
          {isSanctuary ? (
            <>
              <div className="price-row sanctuary primary">
                <span className="price-label">Sanctuary</span>
                <span className="price-sanctuary">{formatPrice(item.priceSanctuary)}</span>
              </div>
              <div className="price-row secondary">
                <span className="price-label">Public</span>
                <span className="price-public">{formatPrice(item.pricePublic)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="price-row">
                <span className="price-label">Public</span>
                <span className="price-public">{formatPrice(item.pricePublic)}</span>
              </div>
              <div className="price-row sanctuary">
                <span className="price-label">Sanctuary</span>
                <span className="price-sanctuary">{formatPrice(item.priceSanctuary)}</span>
              </div>
            </>
          )}
        </div>

        <div className="apparel-availability">
          <span className="in-wardrobe">In the Wardrobe</span>
        </div>
      </div>
    </Link>
  );
}

export default function UniformPage() {
  const [isSanctuary, setIsSanctuary] = useState(false);
  const coreItems = getActiveCoreUniform();
  const activeDrops = getActiveDrops();

  useEffect(() => {
    // Check sanctuary status on mount
    if (typeof window !== 'undefined') {
      setIsSanctuary(localStorage.getItem('sanctuary_preview') === 'true');
    }
  }, []);

  return (
    <div className="uniform-page">
      {/* Hero Section */}
      <section className="uniform-hero">
        <div className="uniform-hero-content">
          <h1 className="uniform-title">The Uniform</h1>
          <p className="uniform-subhead">A quiet exterior for loud places.</p>
          <p className="uniform-intro">
            Black, structured, and intentional. Pieces chosen to disappear into the world — while you remain yourself.
          </p>
        </div>
      </section>

      {/* Core Uniform Section */}
      <section className="uniform-section">
        <div className="uniform-section-header">
          <h2 className="uniform-section-title">Core Uniform</h2>
          <p className="uniform-section-description">Chosen to be worn often.</p>
        </div>
        
        <div className="uniform-grid">
          {coreItems.map(item => (
            <ApparelCard key={item.id} item={item} isSanctuary={isSanctuary} />
          ))}
        </div>
      </section>

      {/* Seasonal Drops Section */}
      {activeDrops.size > 0 && (
        <section className="uniform-section drops-section">
          <div className="uniform-section-header">
            <h2 className="uniform-section-title">Seasonal Drops</h2>
            <p className="uniform-section-description">Appears briefly. Leaves quietly.</p>
          </div>

          {Array.from(activeDrops.entries()).map(([dropTag, items]) => (
            <div key={dropTag} className="drop-group">
              <div className="drop-header">
                <h3 className="drop-title">{getDropName(dropTag)}</h3>
                <p className="drop-description">{getDropDescription(dropTag)}</p>
              </div>
              
              <div className="uniform-grid">
                {items.map(item => (
                  <ApparelCard key={item.id} item={item} isSanctuary={isSanctuary} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Cross-link to The House */}
      <section className="uniform-crosslink">
        <div className="crosslink-card">
          <h3 className="crosslink-title">Back to the House</h3>
          <p className="crosslink-description">Objects chosen to remain.</p>
          <Link href="/shop" className="crosslink-button">
            Enter The House →
          </Link>
        </div>
      </section>
    </div>
  );
}
