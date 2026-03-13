'use client';

import Link from 'next/link';
import Image from 'next/image';

const PORTALS = [
  {
    label: 'THE WARDROBE',
    description: 'Apparel for the everyday dark.',
    href: '/collections/apparel',
    image: '/images/Female_signature_hoodie_2.png',
  },
  {
    label: 'THE RITUAL',
    description: 'Objects for quiet spaces.',
    href: '/collections/home-decor',
    image: '/images/Dark haired female burning sage with candles.png',
  },
];

export default function CategoryPortals() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {PORTALS.map((portal) => (
        <Link
          key={portal.label}
          href={portal.href}
          className="group relative h-[500px] lg:h-[600px] overflow-hidden"
        >
          {/* Image */}
          <Image
            src={portal.image}
            alt={portal.label}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-160" />
          
          {/* Gold Border on Hover */}
          <div className="absolute inset-0 border border-transparent group-hover:border-gold transition-colors duration-160" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <span className="text-xs font-sans uppercase tracking-widest text-zinc-400 mb-3">
              {portal.label}
            </span>
            <p className="text-sm text-zinc-400 mb-6">
              {portal.description}
            </p>
            <span className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-white group-hover:text-gold transition-colors duration-160">
              Explore
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-160"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
