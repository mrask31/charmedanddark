"use client";

import Link from 'next/link';
import Image from 'next/image';
import { productIsAvailable } from '@/lib/product-display';

export default function SmuttyGoodGirlDrop({ products = [] }) {
  return (
    <section
      className="overflow-hidden border p-6 sm:p-8 lg:p-10"
      style={{
        borderColor: 'rgba(215,160,181,0.2)',
        background: 'radial-gradient(circle at 10% 0%, rgba(129,58,83,0.22), transparent 38%), #0e0a10',
      }}
      aria-labelledby="sgg-drop-heading"
    >
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: '#d7a0b5' }}>
            New Collection
          </p>
          <h2
            id="sgg-drop-heading"
            className="mt-4 font-serif text-4xl italic text-white md:text-5xl"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Smutty Good Girl
          </h2>
          <p
            className="mt-5 max-w-xl text-base font-light"
            style={{ color: 'rgba(232,228,220,0.72)', fontFamily: 'Inter, sans-serif', lineHeight: 1.8 }}
          >
            Bookish essentials for good girls with questionable reading habits. Built for dark-romance readers, fictional-boyfriend collectors, and suspiciously long TBR lists.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em]" style={{ color: '#997785', fontFamily: 'Inter, sans-serif' }}>
            Sweet on the outside. Unhinged between chapters.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/collections/smutty-good-girl"
              className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#d7a0b5]/10"
              style={{ border: '1px solid #d7a0b5', color: '#d7a0b5' }}
            >
              Shop the Collection
            </Link>
            <Link
              href="/join"
              className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-white/5"
              style={{ border: '1px solid rgba(232,228,220,0.2)', color: '#e8e4dc' }}
            >
              Explore Sanctuary Benefits
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {products.map((product) => (
            <Link
              key={(product.slug || product.handle)}
              href={`/shop/${(product.slug || product.handle)}`}
              className="group overflow-hidden border transition-colors hover:border-[#d7a0b5]/50"
              style={{ borderColor: 'rgba(215,160,181,0.15)', backgroundColor: '#08080f' }}
            >
              <div className="aspect-square overflow-hidden">
                {product.imageUrls?.[0] ? <Image
                  src={product.imageUrls?.[0]}
                  alt={product.name}
                  loading="lazy"
                  width={320}
                  height={320}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                /> : <div className="flex h-full items-center justify-center text-zinc-500">S.G.G.</div>}
              </div>
              <p
                className="px-3 py-3 text-[10px] uppercase tracking-[0.14em] transition-colors group-hover:text-[#d7a0b5] sm:text-[11px]"
                style={{ color: '#e8e4dc', fontFamily: 'Inter, sans-serif' }}
              >
                {product.name}
                {!productIsAvailable(product) && <span className="mt-1 block text-[10px] text-zinc-400">Out of stock</span>}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
