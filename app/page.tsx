'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { transformSupabaseProduct, UnifiedProduct } from '@/lib/products';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const supabase = getSupabaseClient();
        
        // Fetch exactly 6 curated products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .gt('stock_quantity', 0)
          .order('title')
          .limit(6);

        if (error) {
          console.error('Error loading featured products:', error);
          setLoading(false);
          return;
        }

        const unified = (data || []).map(transformSupabaseProduct);
        console.log('Featured products:', unified.map(p => ({ handle: p.handle, title: p.title, image: p.images.hero })));
        setFeaturedProducts(unified);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setLoading(false);
      }
    }

    loadFeaturedProducts();
  }, []);

  const scrollToCuration = () => {
    const curationSection = document.getElementById('curation');
    if (curationSection) {
      curationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Header />
      <main style={styles.main}>
        {/* 1. Hero Section */}
        <section style={styles.hero}>
          <div style={styles.heroImageContainer}>
            <div style={styles.heroImagePlaceholder}>
              <div style={styles.heroOverlay} />
            </div>
          </div>
          <div style={styles.heroContent}>
            <h1 style={styles.heroHeadline}>
              The Architecture of Shadow.
            </h1>
            <button 
              style={styles.heroCTA}
              onClick={scrollToCuration}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
                e.currentTarget.style.color = '#f5f5f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#1a1a1a';
              }}
            >
              Enter the Collection
            </button>
          </div>
        </section>

        {/* 2. Ethos Block */}
        <section style={styles.ethos}>
          <div style={styles.ethosContainer}>
            <h2 style={styles.ethosText}>
              We dictate silhouette before we dictate space. Charmed & Dark constructs 
              premium, restrained apparel designed for permanence, accompanied by a 
              curated collection of heavy, physical objects to anchor your home.
            </h2>
          </div>
        </section>

        {/* 3. Curated Grid */}
        <section id="curation" style={styles.curation}>
          <div style={styles.container}>
            {loading ? (
              <div style={styles.loadingState}>
                <p style={styles.loadingText}>Loading...</p>
              </div>
            ) : (
              <>
                <div style={styles.productGrid}>
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} isRecognized={false} />
                  ))}
                </div>
                <div style={styles.viewAllContainer}>
                  <Link href="/collections/all" style={styles.viewAllLink}>
                    View the Complete Record →
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 4. Category Portals */}
        <section style={styles.portals}>
          <div style={styles.portalsContainer}>
            <Link href="/collections/wardrobe" style={styles.portal}>
              <div style={{
                ...styles.portalImagePlaceholder,
                backgroundImage: 'url(https://images.unsplash.com/photo-1558769132-cb1aea1c8a5c?q=80&w=2400&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
                <div style={styles.portalOverlay} />
              </div>
              <div style={styles.portalContent}>
                <h2 style={styles.portalTitle}>The Wardrobe</h2>
                <p style={styles.portalSubtitle}>Apparel</p>
              </div>
            </Link>
            
            <Link href="/collections/objects" style={styles.portal}>
              <div style={{
                ...styles.portalImagePlaceholder,
                backgroundImage: 'url(https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=2400&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
                <div style={styles.portalOverlay} />
              </div>
              <div style={styles.portalContent}>
                <h2 style={styles.portalTitle}>The Objects</h2>
                <p style={styles.portalSubtitle}>Physical Goods</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
  },
  
  // Hero Section
  hero: {
    position: 'relative' as const,
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImageContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  heroImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2400&auto=format&fit=crop)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative' as const,
  },
  heroOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  heroContent: {
    position: 'relative' as const,
    zIndex: 1,
    textAlign: 'center' as const,
    padding: '0 2rem',
    maxWidth: '900px',
  },
  heroHeadline: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 300,
    letterSpacing: '0.05em',
    color: '#f5f5f0',
    marginBottom: '3rem',
    lineHeight: 1.3,
  },
  heroCTA: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 400,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    padding: '1rem 2.5rem',
    border: '1px solid #f5f5f0',
    backgroundColor: 'transparent',
    color: '#f5f5f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  // Ethos Block
  ethos: {
    padding: '8rem 2rem',
    backgroundColor: '#f5f5f0',
  },
  ethosContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  ethosText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
    fontWeight: 300,
    letterSpacing: '0.03em',
    lineHeight: 1.8,
    color: '#1a1a1a',
  },
  
  // Curation Section
  curation: {
    padding: '6rem 0',
    backgroundColor: '#f5f5f0',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
    marginBottom: '4rem',
  },
  loadingState: {
    textAlign: 'center' as const,
    padding: '4rem 0',
  },
  loadingText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    letterSpacing: '0.1em',
    color: '#404040',
  },
  viewAllContainer: {
    textAlign: 'center' as const,
    paddingTop: '2rem',
  },
  viewAllLink: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 400,
    letterSpacing: '0.1em',
    color: '#404040',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
    transition: 'border-color 0.2s ease',
    display: 'inline-block',
    ':hover': {
      borderBottomColor: '#404040',
    },
  },
  
  // Category Portals
  portals: {
    padding: '4rem 2rem',
    backgroundColor: '#f5f5f0',
  },
  portalsContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  portal: {
    position: 'relative' as const,
    height: '500px',
    overflow: 'hidden',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  portalImagePlaceholder: {
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    transition: 'transform 0.3s ease',
  },
  portalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  portalContent: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: '2rem',
    background: 'linear-gradient(to top, rgba(26, 26, 26, 0.9) 0%, transparent 100%)',
  },
  portalTitle: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '2rem',
    fontWeight: 400,
    letterSpacing: '0.05em',
    color: '#f5f5f0',
    marginBottom: '0.5rem',
  },
  portalSubtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 300,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#e8e8e3',
  },
} as const;
