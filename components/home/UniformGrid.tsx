import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/shopify/types';

interface UniformGridProps {
  products: Product[];
}

function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export default function UniformGrid({ products }: UniformGridProps) {
  return (
    <section className="uniform-section">
      <div className="uniform-header">
        <h2 className="uniform-title">The Uniform</h2>
        <p className="uniform-subtitle">
          What you reach for when you want to feel like yourself.
        </p>
      </div>

      <div className="uniform-grid">
        {products.map((product) => (
          <Link 
            href={`/product/${product.handle}`} 
            key={product.id}
            className="uniform-card"
          >
            <div className="uniform-image">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={400}
                  height={500}
                  loading="lazy"
                  className="uniform-img"
                />
              ) : (
                <div className="uniform-image-placeholder">No image</div>
              )}
              {product.tags.includes('new') && (
                <span className="uniform-badge">New</span>
              )}
            </div>
            <div className="uniform-info">
              <h3 className="uniform-product-title">{product.title}</h3>
              <p className="uniform-price">{formatPrice(product.price, product.currencyCode)}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="uniform-microcopy">Built for repetition, not occasions.</p>
    </section>
  );
}
