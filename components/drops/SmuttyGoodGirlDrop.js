"use client";

import Link from 'next/link';

const PRODUCTS = [
  {
    name: 'Smutty Good Girl Society Tote',
    handle: 'smutty-good-girl-society-tote',
    image: 'https://cdn.shopify.com/s/files/1/0861/2079/2098/files/SGG_Tote_bag2.png?v=1784758418',
  },
  {
    name: 'Smutty Good Girl Reading Fuel Mug',
    handle: 'smutty-good-girl-reading-fuel-accent-coffee-mug-15oz',
    image: 'https://cdn.shopify.com/s/files/1/0861/2079/2098/files/SGG_Mug_2.png?v=1784758465',
  },
  {
    name: 'S.G.G. Enchanted Reads Water Bottle',
    handle: 's-g-g-enchanted-reads-water-bottle-20oz',
    image: 'https://cdn.shopify.com/s/files/1/0861/2079/2098/files/SGG_Water_Bottle_label_2.png?v=1784758569',
  },
  {
    name: 'S.G.G. Secret Society Water Bottle',
    handle: 's-g-g-secret-society-water-bottle-20oz',
    image: 'https://cdn.shopify.com/s/files/1/0861/2079/2098/files/SGG_Water_Bottle_1.png?v=1784758514',
  },
];

export default function SmuttyGoodGirlDrop() {
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
              Sanctuary Members Save 10%
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {PRODUCTS.map((product) => (
            <Link
              key={product.handle}
              href={`/shop/${product.handle}`}
              className="group overflow-hidden border transition-colors hover:border-[#d7a0b5]/50"
              style={{ borderColor: 'rgba(215,160,181,0.15)', backgroundColor: '#08080f' }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p
                className="px-3 py-3 text-[10px] uppercase tracking-[0.14em] transition-colors group-hover:text-[#d7a0b5] sm:text-[11px]"
                style={{ color: '#e8e4dc', fontFamily: 'Inter, sans-serif' }}
              >
                {product.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
