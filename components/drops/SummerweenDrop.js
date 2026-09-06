"use client";

import Link from 'next/link';
import Image from 'next/image';
import { productIsAvailable } from '@/lib/product-display';

export default function SummerweenDrop({ products = [] }) {
  return (
    <section className="space-y-8" aria-labelledby="summerween-heading">
      <p
        className="text-[11px] uppercase tracking-[0.3em]"
        style={{ color: '#c9a96e' }}
      >
        CURRENT DROP
      </p>

      <h2
        id="summerween-heading"
        className="font-serif text-4xl italic text-white md:text-5xl"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
      >
        Summerween Is Open
      </h2>

      <p
        className="max-w-2xl text-base font-light"
        style={{ color: 'rgba(232,228,220,0.7)', fontFamily: 'Inter, sans-serif', lineHeight: 1.8 }}
      >
        Sun-warmed spells. Graveyard weekends. Gothic summer goods for those who never leave the dark behind.
      </p>

      {/* Product tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={(product.slug || product.handle)}
            href={`/shop/${(product.slug || product.handle)}`}
            className="group flex items-center gap-4 p-4 transition-colors hover:bg-white/5"
            style={{
              backgroundColor: '#0e0e1a',
              border: '1px solid rgba(201,169,110,0.15)',
            }}
          >
            {product.imageUrls?.[0] && (
              <Image
                src={product.imageUrls?.[0]}
                alt={product.name}
                loading="lazy"
                width={64}
                  height={64}
                className="h-16 w-16 object-cover shrink-0"
                style={{ backgroundColor: '#08080f' }}
              />
            )}
            <span
              className="text-[11px] uppercase tracking-[0.15em] transition-colors group-hover:text-[#c9a96e]"
              style={{ color: '#e8e4dc', fontFamily: 'Inter, sans-serif' }}
            >
              {product.name}
                {!productIsAvailable(product) && <span className="mt-1 block text-[10px] text-zinc-400">Out of stock</span>}
            </span>
          </Link>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-4 pt-4">
        <Link
          href="/shop?collection=summerween"
          className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10"
          style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}
        >
          Shop Summerween
        </Link>
        <Link
          href="/join"
          className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-white/5"
          style={{ border: '1px solid rgba(232,228,220,0.2)', color: '#e8e4dc' }}
        >
          Explore Sanctuary Benefits
        </Link>
      </div>
    </section>
  );
}
