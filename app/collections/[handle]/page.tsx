import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCollectionByHandle } from '@/lib/shopify/storefront';
import type { Metadata } from 'next';

interface CollectionPageProps {
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

async function CollectionProducts({ handle }: { handle: string }) {
  const collection = await getCollectionByHandle(handle, 50);

  if (!collection) {
    notFound();
  }

  if (!collection.products.length) {
    return (
      <div className="empty-state">
        <p>No products found in this collection.</p>
        <Link href="/" className="btn-secondary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="collection-header">
        <h1 className="collection-title">{collection.title}</h1>
        {collection.description && (
          <p className="collection-description">{collection.description}</p>
        )}
        <p className="collection-count">
          {collection.products.length} {collection.products.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="product-grid">
        {collection.products.map((product) => (
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
              <p className="product-price">
                {formatPrice(product.price, product.currencyCode)}
              </p>
              {!product.availableForSale && (
                <p className="product-unavailable">Out of stock</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function CollectionPage({ params }: CollectionPageProps) {
  return (
    <main className="collection-page">
      <div className="container">
        <Suspense fallback={
          <div className="loading-state">
            <p>Loading collection...</p>
          </div>
        }>
          <CollectionProducts handle={params.handle} />
        </Suspense>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collection = await getCollectionByHandle(params.handle);

  if (!collection) {
    return {
      title: 'Collection Not Found',
    };
  }

  return {
    title: `${collection.title} - Charmed & Dark`,
    description: collection.description || `Shop ${collection.title} at Charmed & Dark`,
    openGraph: {
      title: collection.title,
      description: collection.description || `Shop ${collection.title}`,
      type: 'website',
    },
  };
}
