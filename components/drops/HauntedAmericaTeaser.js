"use client";

import Link from 'next/link';

export default function HauntedAmericaTeaser() {
  return (
    <section
      className="space-y-6"
      aria-labelledby="haunted-america-heading"
      style={{
        backgroundColor: '#0e0e1a',
        border: '1px solid rgba(201,169,110,0.15)',
        padding: 'clamp(32px, 5vw, 56px) clamp(24px, 4vw, 48px)',
      }}
    >
      <p
        className="text-[11px] uppercase tracking-[0.3em]"
        style={{ color: '#c9a96e' }}
      >
        NEXT THRESHOLD
      </p>

      <h2
        id="haunted-america-heading"
        className="font-serif text-3xl italic text-white md:text-4xl"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
      >
        Haunted America
      </h2>

      <p
        className="max-w-2xl text-base font-light"
        style={{ color: 'rgba(232,228,220,0.6)', fontFamily: 'Inter, sans-serif', lineHeight: 1.8 }}
      >
        We're preparing something for Haunted America: ritual goods, dark little luxuries, and event-ready pieces for those drawn to the darker side of the weekend.
      </p>

      <Link
        href="/join"
        className="inline-block rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10"
        style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}
      >
        Join for Event Updates
      </Link>
    </section>
  );
}
