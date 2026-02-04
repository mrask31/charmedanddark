'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  getApparelBySlug, 
  getRelatedApparel,
  formatPrice,
  type ApparelItem 
} from '@/lib/apparel';

type Props = {
  params: { slug: string };
};

function RelatedApparelCard({ item }: { item: ApparelItem }) {
  return (
    <Link 
      href={`/uniform/${item.slug}`}
      className="related-apparel-card"
    >
      <div className="related-apparel-image">
        {item.images.length > 0 ? (
          <img 
            src={item.images[0]} 
            alt={item.name}
            loading="lazy"
          />
        ) : (
          <div className="related-apparel-image-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>
      <div className="related-apparel-info">
        <h4 className="related-apparel-name">{item.name}</h4>
        <p className="related-apparel-price">{formatPrice(item.pricePublic)}</p>
      </div>
    </Link>
  );
}

export default function ApparelDetailPage({ params }: Props) {
  const [isSanctuary, setIsSanctuary] = useState(false);
  const item = getApparelBySlug(params.slug);
  
  useEffect(() => {
    // Check sanctuary status on mount
    if (typeof window !== 'undefined') {
      setIsSanctuary(localStorage.getItem('sanctuary_preview') === 'true');
    }
  }, []);
  
  if (!item) {
    notFound();
  }

  const relatedItems = getRelatedApparel(item, 3);

  return (
    <div className="apparel-detail-page">
      {/* Breadcrumb */}
      <nav className="apparel-breadcrumb">
        <Link href="/uniform" className="breadcrumb-link">
          ← Back to The Uniform
        </Link>
      </nav>

      {/* Main Content */}
      <div className="apparel-detail-container">
        {/* Image Gallery */}
        <div className="apparel-detail-gallery">
          {item.images.length > 0 ? (
            <>
              <div className="apparel-primary-image">
                <img 
                  src={item.images[0]} 
                  alt={item.name}
                />
              </div>
              
              {item.images.length > 1 && (
                <div className="apparel-thumbnails">
                  {item.images.map((image, index) => (
                    <div key={index} className="apparel-thumbnail">
                      <img 
                        src={image} 
                        alt={`${item.name} view ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="apparel-image-placeholder-large">
              <span>No Image Available</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="apparel-detail-info">
          <div className="apparel-detail-header">
            <h1 className="apparel-detail-name">{item.name}</h1>
            <div className="apparel-detail-meta">
              <span className="apparel-category">{item.category}</span>
              <span className="apparel-cadence-separator">•</span>
              <span className="apparel-cadence">
                {item.cadence === 'core' ? 'Core Uniform' : 'Seasonal Drop'}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="apparel-detail-pricing">
            <div className="price-block">
              {isSanctuary ? (
                <>
                  <div className="price-row sanctuary-highlight primary">
                    <span className="price-label">Sanctuary Price</span>
                    <span className="price-sanctuary">{formatPrice(item.priceSanctuary)}</span>
                  </div>
                  <div className="price-row secondary">
                    <span className="price-label">Public Price</span>
                    <span className="price-public">{formatPrice(item.pricePublic)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="price-row">
                    <span className="price-label">Public Price</span>
                    <span className="price-public">{formatPrice(item.pricePublic)}</span>
                  </div>
                  <div className="price-row sanctuary-highlight">
                    <span className="price-label">Sanctuary Price</span>
                    <span className="price-sanctuary">{formatPrice(item.priceSanctuary)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Ritual Intro */}
          <div className="apparel-ritual-intro">
            <p>{item.ritualIntro}</p>
          </div>

          {/* Details */}
          <div className="apparel-details">
            <h3 className="apparel-details-heading">Details</h3>
            <ul className="apparel-details-list">
              {item.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>

          {/* Who For */}
          <div className="apparel-who-for">
            <p className="who-for-text">{item.whoFor}</p>
          </div>

          {/* CTA */}
          <div className="apparel-cta">
            {isSanctuary ? (
              <p className="sanctuary-recognition">Sanctuary recognition applied.</p>
            ) : (
              <Link href="/join" className="apparel-cta-primary">
                Enter the Sanctuary to unlock recognition pricing
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <section className="apparel-related-section">
          <h2 className="apparel-related-heading">Related Pieces</h2>
          <div className="apparel-related-grid">
            {relatedItems.map(relatedItem => (
              <RelatedApparelCard key={relatedItem.id} item={relatedItem} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
