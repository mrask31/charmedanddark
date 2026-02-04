'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getHouseProducts, type ProductCategory } from '@/lib/products';

// All available categories
const categories: ProductCategory[] = [
  "Candles & Scent",
  "Ritual Drinkware",
  "Wall Objects",
  "Decor Objects",
  "Table & Display",
  "Objects of Use"
];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [isSanctuary, setIsSanctuary] = useState(false);

  useEffect(() => {
    // Check sanctuary status on mount
    if (typeof window !== 'undefined') {
      setIsSanctuary(localStorage.getItem('sanctuary_preview') === 'true');
    }
  }, []);

  // Get all House products (realm === 'house' AND status !== 'archive')
  const houseProducts = getHouseProducts();

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All' 
    ? houseProducts 
    : houseProducts.filter(p => p.category === selectedCategory);

  // Format price as USD
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="shop-page">
      {/* Hero Section */}
      <section className="shop-hero">
        <div className="shop-hero-content">
          <h1 className="shop-title">The House</h1>
          <p className="shop-description">
            Objects that make a room feel different. Candles that burn clean. Pieces chosen with intention.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="shop-filters">
        <div className="category-filters">
          <button
            className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <p className="shop-filters-note">Objects chosen to remain.</p>
      </section>

      {/* Product Grid */}
      <section className="shop-grid-section">
        <div className="shop-grid">
          {filteredProducts.map(product => (
            <Link 
              href={`/product/${product.slug}`} 
              key={product.id}
              className="product-card"
              tabIndex={0}
            >
              <div className="product-image">
                {product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="product-image-placeholder">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              
              <div className="product-info">
                <h2 className="product-name">{product.name}</h2>
                <p className="product-short-description">{product.shortDescription}</p>
                
                <div className="product-pricing">
                  {isSanctuary ? (
                    <>
                      <div className="price-row sanctuary primary">
                        <span className="price-label">Sanctuary</span>
                        <span className="price-sanctuary">{formatPrice(product.priceSanctuary)}</span>
                      </div>
                      <div className="price-row secondary">
                        <span className="price-label">Public</span>
                        <span className="price-public">{formatPrice(product.pricePublic)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="price-row">
                        <span className="price-label">Public</span>
                        <span className="price-public">{formatPrice(product.pricePublic)}</span>
                      </div>
                      <div className="price-row sanctuary">
                        <span className="price-label">Sanctuary</span>
                        <span className="price-sanctuary">{formatPrice(product.priceSanctuary)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="product-availability">
                  {product.inStock ? (
                    <span className="in-stock">In the House</span>
                  ) : (
                    <span className="out-of-stock">Gone Quiet</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>No objects found in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
}
