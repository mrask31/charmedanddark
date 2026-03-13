'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/storefront/types';

interface FeaturedProductsProps {
  products: Product[];
}

function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

function getSanctuaryPrice(price: number): number {
  return Math.floor(price * 0.85);
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-24 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <span className="text-xs font-sans uppercase tracking-widest text-gold">
            Curated Selections
          </span>
          <Link
            href="/shop"
            className="text-xs font-sans uppercase tracking-widest text-zinc-400 hover:text-white transition-colors duration-160"
          >
            View All
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.handle}`}
              className="group"
            >
              <div className="relative aspect-[3/4] mb-4 overflow-hidden border border-transparent group-hover:border-gold transition-colors duration-160">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                    <span className="text-zinc-600 text-xs uppercase tracking-widest">
                      No Image
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-sm text-white mb-2 leading-tight">
                {product.title}
              </h3>
              <p className="text-sm text-zinc-400">
                {formatPrice(product.price, product.currencyCode)}
              </p>
              <p className="text-sm text-gold mt-1">
                Sanctuary: {formatPrice(getSanctuaryPrice(product.price), product.currencyCode)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Fallback with static products when no Shopify data
export function FeaturedProductsStatic() {
  const staticProducts = [
    {
      id: '1',
      handle: 'signature-hoodie',
      title: 'Signature Pullover Hoodie',
      image: '/images/Female_signature_hoodie.png',
      price: 78,
    },
    {
      id: '2',
      handle: 'crest-tee',
      title: 'Crest Logo Tee',
      image: '/images/Female_tshirt.png',
      price: 42,
    },
    {
      id: '3',
      handle: 'trinket-dish',
      title: 'Trinket Dish & Mirror Set',
      image: '/images/BEST trinket dish, table top mirror, and sage.png',
      price: 36,
    },
    {
      id: '4',
      handle: 'star-candle',
      title: 'Three Star Candle',
      image: '/images/threeStarCandle1.png',
      price: 28,
    },
  ];

  return (
    <section className="py-24 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <span className="text-xs font-sans uppercase tracking-widest text-gold">
            Curated Selections
          </span>
          <Link
            href="/shop"
            className="text-xs font-sans uppercase tracking-widest text-zinc-400 hover:text-white transition-colors duration-160"
          >
            View All
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {staticProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.handle}`}
              className="group"
            >
              <div className="relative aspect-[3/4] mb-4 overflow-hidden border border-transparent group-hover:border-gold transition-colors duration-160">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-sm text-white mb-2 leading-tight">
                {product.title}
              </h3>
              <p className="text-sm text-zinc-400">
                ${product.price}
              </p>
              <p className="text-sm text-gold mt-1">
                Sanctuary: ${Math.floor(product.price * 0.85)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
