import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/shopify/types';

interface HomeRitualsProps {
  products: Product[];
}

function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export default function HomeRituals({ products }: HomeRitualsProps) {
  if (!products.length) return null;

  return (
    <section className="rituals-section">
      <div className="rituals-header">
        <h2 className="rituals-title">Objects for the spaces you return to</h2>
        <p className="rituals-subtitle">
          Things you keep near you, not just around you.
        </p>
      </div>

      <div className="rituals-grid">
        {products.map((product) => (
          <Link 
            href={`/product/${product.handle}`} 
            key={product.id}
            className="ritual-card"
          >
            <div className="ritual-image">
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={300}
                  height={300}
                  loading="lazy"
                  className="ritual-img"
                />
              )}
            </div>
            <div className="ritual-info">
              <h3 className="ritual-title">{product.title}</h3>
              <p className="ritual-price">{formatPrice(product.price, product.currencyCode)}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="rituals-microcopy">The feeling shouldn't stop when the day does.</p>
    </section>
  );
}
