'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getHouseProducts, type ProductCategory, type Product } from '@/lib/products';

// Section configuration - explicit ordering and naming (7 canonical sections)
const SECTIONS: { title: string; category: ProductCategory }[] = [
  { title: "Objects of Use", category: "Objects of Use" },
  { title: "Ritual Drinkware", category: "Ritual Drinkware" },
  { title: "Candles & Candle Holders", category: "Candles & Scent" },
  { title: "Table & Display", category: "Table & Display" },
  { title: "Wall Objects", category: "Wall Objects" },
  { title: "Decor Objects", category: "Decor Objects" },
  { title: "Holiday", category: "Holiday" }
];

const ITEMS_PER_PAGE = 8;

export default function ShopPage() {
  const [isSanctuary, setIsSanctuary] = useState(false);
  const [sectionPages, setSectionPages] = useState<Record<string, number>>({});

  useEffect(() => {
    // Check sanctuary status on mount
    if (typeof window !== 'undefined') {
      setIsSanctuary(localStorage.getItem('sanctuary_preview') === 'true');
    }
  }, []);

  // Get all House products (realm === 'house' AND status !== 'archive')
  const houseProducts = getHouseProducts();

  // Group products by category - ALL products are available for sale
  const productsByCategory = SECTIONS.reduce((acc, section) => {
    acc[section.category] = houseProducts.filter(p => p.category === section.category);
    return acc;
  }, {} as Record<ProductCategory, Product[]>);

  // Format price as USD
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Get current page for a section
  const getCurrentPage = (category: string) => sectionPages[category] || 1;

  // Set page for a section
  const setPage = (category: string, page: number) => {
    setSectionPages(prev => ({ ...prev, [category]: page }));
  };

  // Get paginated products for a section
  const getPaginatedProducts = (products: Product[], category: string) => {
    const currentPage = getCurrentPage(category);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return products.slice(startIndex, endIndex);
  };

  // Calculate total pages for a section
  const getTotalPages = (products: Product[]) => {
    return Math.ceil(products.length / ITEMS_PER_PAGE);
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

      {/* Sectioned Inventory */}
      {SECTIONS.map(section => {
        const products = productsByCategory[section.category];
        if (!products || products.length === 0) return null;

        const totalPages = getTotalPages(products);
        const currentPage = getCurrentPage(section.category);
        const displayedProducts = getPaginatedProducts(products, section.category);

        return (
          <section key={section.category} className="shop-section">
            <div className="shop-section-header">
              <h2 className="shop-section-title">{section.title}</h2>
              <p className="shop-section-count">{products.length} {products.length === 1 ? 'object' : 'objects'}</p>
            </div>

            <div className="shop-grid">
              {displayedProducts.map(product => (
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
                      <span className="in-stock">In the House</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="shop-section-pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setPage(section.category, currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setPage(section.category, currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        );
      })}

    </div>
  );
}
