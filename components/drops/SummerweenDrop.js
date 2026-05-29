"use client";

import Link from 'next/link';

const SUMMERWEEN_PRODUCTS = [
  { name: 'Summerween Women\'s Flowy Scoop Muscle Tank', handle: 'summerween-womens-flowy-scoop-muscle-tank' },
  { name: 'Summerween Trucker Snapback Hat', handle: 'summerween-trucker-snapback-hat' },
  { name: 'Bones and Brew Summer Unisex Tee', handle: 'bones-and-brew-summer-unisex-tee-1' },
  { name: 'Hexes & Heat Unisex Summer Tee', handle: 'hexes-heat-unisex-summer-tee-1' },
  { name: 'Salty Spells & Sunset Sins Women\'s Boxy Tee', handle: 'salty-spells-sunset-sins-womens-boxy-tee' },
  { name: 'Camp Charmed and Dark Unisex Ringer Tee', handle: 'camp-charmed-and-dark-unisex-ringer-tee' },
];

export default function SummerweenDrop() {
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
        {SUMMERWEEN_PRODUCTS.map((product) => (
          <Link
            key={product.handle}
            href={`/shop/${product.handle}`}
            className="group flex items-center gap-4 p-4 transition-colors hover:bg-white/5"
            style={{
              backgroundColor: '#0e0e1a',
              border: '1px solid rgba(201,169,110,0.15)',
            }}
          >
            <span
              className="text-[11px] uppercase tracking-[0.15em] transition-colors group-hover:text-[#c9a96e]"
              style={{ color: '#e8e4dc', fontFamily: 'Inter, sans-serif' }}
            >
              {product.name}
            </span>
          </Link>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-4 pt-4">
        <Link
          href="/shop"
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
          Join the Sanctuary for 10% off
        </Link>
      </div>
    </section>
  );
}
