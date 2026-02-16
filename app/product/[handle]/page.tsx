import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductByHandle } from '@/lib/storefront';
import { getProductBySlug } from '@/lib/products';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: {
    handle: string;
  };
}

function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

async function ProductDetails({ handle }: { handle: string }) {
  // Try Shopify first
  let product = await getProductByHandle(handle);
  
  // Fallback to legacy products if not found in Shopify
  if (!product) {
    const legacyProduct = getProductBySlug(handle);
    if (legacyProduct) {
      // Convert legacy product to Shopify format for display
      product = {
        id: legacyProduct.id,
        handle: legacyProduct.slug,
        title: legacyProduct.name,
        description: legacyProduct.description.ritualIntro,
        price: legacyProduct.pricePublic,
        currencyCode: 'USD',
        images: legacyProduct.images,
        tags: [],
        availableForSale: legacyProduct.inStock,
      };
    }
  }

  if (!product) {
    notFound();
  }

  return (
    <>
      <div className="product-container">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="product-main-image">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                width={600}
                height={750}
                priority
              />
            ) : (
              <div className="product-image-placeholder-large">
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="product-thumbnails">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="product-thumbnail">
                  <Image
                    src={image}
                    alt={`${product.title} view ${index + 2}`}
                    width={120}
                    height={150}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-details">
          <h1 className="product-detail-title">{product.title}</h1>

          {/* Pricing */}
          <div className="product-pricing-block">
            <p className="product-price-large">
              {formatPrice(product.price, product.currencyCode)}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="product-description">
              <p>{product.description}</p>
            </div>
          )}

          {/* Availability */}
          <div className="product-availability-detail">
            {product.availableForSale ? (
              <span className="availability-in-stock">Available</span>
            ) : (
              <span className="availability-out-of-stock">Out of Stock</span>
            )}
          </div>

          {/* CTAs */}
          <div className="product-ctas">
            <button className="btn-primary product-cta-primary" disabled={!product.availableForSale}>
              Add to Cart
            </button>
            <Link href="/shop" className="btn-secondary product-cta-secondary">
              Continue Shopping
            </Link>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="product-tags">
              {product.tags.map((tag) => (
                <span key={tag} className="product-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <main className="product-page">
      <Suspense fallback={
        <div className="loading-state">
          <p>Loading product...</p>
        </div>
      }>
        <ProductDetails handle={params.handle} />
      </Suspense>
    </main>
  );
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  // Try Shopify first
  let product = await getProductByHandle(params.handle);
  
  // Fallback to legacy products
  if (!product) {
    const legacyProduct = getProductBySlug(params.handle);
    if (legacyProduct) {
      return {
        title: `${legacyProduct.name} - Charmed & Dark`,
        description: legacyProduct.description.ritualIntro || legacyProduct.name,
        openGraph: {
          title: legacyProduct.name,
          description: legacyProduct.description.ritualIntro || legacyProduct.name,
          images: legacyProduct.images[0] ? [{ url: legacyProduct.images[0] }] : [],
          type: 'website',
        },
      };
    }
  }

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.title} - Charmed & Dark`,
    description: product.description || product.title,
    openGraph: {
      title: product.title,
      description: product.description || product.title,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
      type: 'website',
    },
  };
}
