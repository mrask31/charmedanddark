'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getProductsByCategory, type Product } from '@/lib/products';

// Format price as USD
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
}

// Get related products from same category
function getRelatedProducts(product: Product): Product[] {
  const sameCategory = getProductsByCategory(product.category);
  return sameCategory
    .filter(p => p.id !== product.id)
    .slice(0, 3);
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [isSanctuary, setIsSanctuary] = useState(false);
  const product = getProductBySlug(params.slug);

  useEffect(() => {
    // Check sanctuary status on mount
    if (typeof window !== 'undefined') {
      setIsSanctuary(localStorage.getItem('sanctuary_preview') === 'true');
    }
  }, []);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);

  return (
    <div className="product-page">
      {/* Product Hero */}
      <section className="product-hero">
        <div className="product-container">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="product-main-image">
              {product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                />
              ) : (
                <div className="product-image-placeholder-large">
                  <span>No Image Available</span>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((image, index) => (
                  <div key={index} className="product-thumbnail">
                    <img src={image} alt={`${product.name} view ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-details">
            <div className="product-category-label">{product.category}</div>
            
            <h1 className="product-detail-title">{product.name}</h1>

            {/* Pricing */}
            <div className="product-pricing-block">
              {isSanctuary ? (
                <>
                  <div className="price-item sanctuary-highlight primary">
                    <span className="price-label-detail sanctuary">Sanctuary Price</span>
                    <span className="price-value-sanctuary">{formatPrice(product.priceSanctuary)}</span>
                  </div>
                  <div className="price-item secondary">
                    <span className="price-label-detail">Public Price</span>
                    <span className="price-value-public">{formatPrice(product.pricePublic)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="price-item">
                    <span className="price-label-detail">Public Price</span>
                    <span className="price-value-public">{formatPrice(product.pricePublic)}</span>
                  </div>
                  <div className="price-item sanctuary-highlight">
                    <span className="price-label-detail sanctuary">Sanctuary Price</span>
                    <span className="price-value-sanctuary">{formatPrice(product.priceSanctuary)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Ritual Intro */}
            <div className="product-ritual-intro">
              <p>{product.description.ritualIntro}</p>
            </div>

            {/* Object Details */}
            <div className="product-object-details">
              <h3 className="details-heading">Object Details</h3>
              <ul className="details-list">
                {product.description.objectDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>

            {/* Who For */}
            <div className="product-who-for">
              <p className="who-for-text">{product.description.whoFor}</p>
            </div>

            {/* CTAs */}
            <div className="product-ctas">
              {isSanctuary ? (
                <>
                  <p className="sanctuary-recognition">Sanctuary recognition applied.</p>
                  <Link href="/shop" className="btn-secondary product-cta-secondary">
                    Back to Shop
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/join" className="btn-primary product-cta-primary">
                    Enter the Sanctuary to Unlock Price
                  </Link>
                  <Link href="/shop" className="btn-secondary product-cta-secondary">
                    Back to Shop
                  </Link>
                </>
              )}
            </div>

            {/* Availability */}
            <div className="product-availability-detail">
              {product.inStock ? (
                <span className="availability-in-stock">In the House</span>
              ) : (
                <span className="availability-out-of-stock">Gone Quiet</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-products">
          <div className="related-container">
            <h2 className="related-heading">Related Objects</h2>
            <div className="related-grid">
              {relatedProducts.map(relatedProduct => (
                <Link 
                  href={`/product/${relatedProduct.slug}`} 
                  key={relatedProduct.id}
                  className="related-card"
                  tabIndex={0}
                >
                  <div className="related-image">
                    {relatedProduct.images.length > 0 ? (
                      <img 
                        src={relatedProduct.images[0]} 
                        alt={relatedProduct.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="related-image-placeholder">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="related-info">
                    <h3 className="related-name">{relatedProduct.name}</h3>
                    <p className="related-price">{formatPrice(relatedProduct.pricePublic)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
