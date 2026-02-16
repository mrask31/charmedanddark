import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts, getCollectionByHandle } from '@/lib/storefront';
import { STOREFRONT_CONFIG } from '@/lib/storefront/config';

// Apparel category tiles
const APPAREL_CATEGORIES = [
  { name: 'Tees', handle: 'tees', image: '/images/Female_tshirt.png' },
  { name: 'Hoodies', handle: 'hoodies', image: '/images/Female_signature_hoodie.png' },
  { name: 'Hats/Beanies', handle: 'headwear', image: '/images/female_beanie.png' },
  { name: 'Layers', handle: 'layers', image: '/images/Female_zip_up_hoodie.png' },
  { name: 'New', handle: 'new', image: '/images/male_female_tshirt.png' },
];

// Capsule collections
const CAPSULES = [
  { 
    name: 'Stillness', 
    handle: 'stillness',
    description: 'Quiet pieces for grounded moments'
  },
  { 
    name: 'After Hours', 
    handle: 'after-hours',
    description: 'Made for the night'
  },
  { 
    name: 'Solace', 
    handle: 'solace',
    description: 'Comfort in restraint'
  },
];

function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

async function FeaturedApparel() {
  const products = await getFeaturedProducts(
    STOREFRONT_CONFIG.collections.apparelFeatured,
    'apparel-featured',
    STOREFRONT_CONFIG.limits.homepageApparelFeatured
  );

  if (!products.length) {
    return (
      <div className="empty-state">
        <p>Featured apparel coming soon.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <Link 
          href={`/product/${product.handle}`} 
          key={product.id}
          className="product-card"
        >
          <div className="product-image">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                width={400}
                height={500}
                loading="lazy"
              />
            ) : (
              <div className="product-image-placeholder">No image</div>
            )}
            {product.tags.includes('new') && (
              <span className="product-badge">New</span>
            )}
          </div>
          <div className="product-info">
            <h3 className="product-title">{product.title}</h3>
            <p className="product-price">{formatPrice(product.price, product.currencyCode)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function HomeDecorPreview() {
  const products = await getFeaturedProducts(
    STOREFRONT_CONFIG.collections.decorFeatured,
    'decor-featured',
    STOREFRONT_CONFIG.limits.homepageDecorPreview
  );

  if (!products.length) {
    return null;
  }

  return (
    <div className="decor-grid">
      {products.map((product) => (
        <Link 
          href={`/product/${product.handle}`} 
          key={product.id}
          className="decor-card"
        >
          <div className="decor-image">
            {product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.title}
                width={300}
                height={300}
                loading="lazy"
              />
            )}
          </div>
          <div className="decor-info">
            <h3 className="decor-title">{product.title}</h3>
            <p className="decor-price">{formatPrice(product.price, product.currencyCode)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="homepage">
      {/* HERO - Apparel First */}
      <section className="hero">
        <div className="hero-image">
          <Image
            src="/images/male_female_signature_and_zipup.png"
            alt="Charmed & Dark Apparel"
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">Elegant gothic.<br />Everyday wearable.</h1>
          <p className="hero-subtitle">Modern apparel with a dark edge</p>
          <div className="hero-actions">
            <Link href="/collections/apparel" className="btn-primary">
              Shop Apparel
            </Link>
            <Link href="/collections/new" className="btn-secondary">
              Shop New
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category - Apparel */}
      <section className="section category-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="category-grid">
            {APPAREL_CATEGORIES.map((category) => (
              <Link
                href={`/collections/${category.handle}`}
                key={category.handle}
                className="category-card"
              >
                <div className="category-image">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={300}
                    height={400}
                    loading="lazy"
                  />
                </div>
                <div className="category-overlay">
                  <h3 className="category-name">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Apparel Grid */}
      <section className="section featured-section">
        <div className="container">
          <h2 className="section-title">Featured Apparel</h2>
          <Suspense fallback={<div className="loading">Loading products...</div>}>
            <FeaturedApparel />
          </Suspense>
        </div>
      </section>

      {/* Collections / Capsules */}
      <section className="section capsule-section">
        <div className="container">
          <h2 className="section-title">Collections</h2>
          <div className="capsule-grid">
            {CAPSULES.map((capsule) => (
              <Link
                href={`/collections/${capsule.handle}`}
                key={capsule.handle}
                className="capsule-card"
              >
                <h3 className="capsule-name">{capsule.name}</h3>
                <p className="capsule-description">{capsule.description}</p>
                <span className="capsule-link">View →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Wear Context Strip */}
      <section className="section context-section">
        <div className="container">
          <div className="context-grid">
            <div className="context-image">
              <Image
                src="/images/Blonde and Brunette females full graphic shirt.png"
                alt="Worn daily"
                width={400}
                height={500}
                loading="lazy"
              />
            </div>
            <div className="context-image">
              <Image
                src="/images/mohawk blonde in unisex shirt.png"
                alt="Built to last"
                width={400}
                height={500}
                loading="lazy"
              />
            </div>
            <div className="context-image">
              <Image
                src="/images/Purple Hair model.png"
                alt="Worn quietly"
                width={400}
                height={500}
                loading="lazy"
              />
            </div>
          </div>
          <p className="context-text">Worn quietly. Built to last.</p>
        </div>
      </section>

      {/* Home & Decor Preview */}
      <section className="section decor-section">
        <div className="container">
          <h2 className="section-title">Home & Decor</h2>
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <HomeDecorPreview />
          </Suspense>
          <div className="section-cta">
            <Link href="/collections/home-decor" className="link-secondary">
              View Home & Decor →
            </Link>
          </div>
        </div>
      </section>

      {/* Sanctuary Teaser */}
      <section className="section sanctuary-teaser">
        <div className="container">
          <div className="sanctuary-card">
            <p className="sanctuary-text">
              The Sanctuary is separate. Some enter. Others do not.
            </p>
            <Link href="/mirror" className="sanctuary-link">
              Enter →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-links">
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns">Returns</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
          <p className="footer-copy">&copy; {new Date().getFullYear()} Charmed & Dark</p>
        </div>
      </footer>
    </main>
  );
}

export const metadata = {
  title: 'Charmed & Dark - Elegant Gothic Apparel',
  description: 'Modern gothic apparel and home decor. Elegant, wearable, built to last.',
  openGraph: {
    title: 'Charmed & Dark',
    description: 'Elegant gothic apparel for everyday wear',
    type: 'website',
  },
};
