"use client";

import Link from 'next/link';

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();
}

export default function JournalHero({ featured }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#08080f', paddingTop: '80px', paddingBottom: '60px' }}
      aria-label="Journal hero section"
    >
      {/* Radial nebula gradient — identical to Sanctuary/Drops */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(75, 0, 130, 0.3), rgba(138, 43, 226, 0.2), transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Micro star field — identical to Sanctuary/Drops */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.1 + 0.1,
            }}
          />
        ))}
      </div>

      {/* Crescent moon SVG — top-right, partially visible — identical to SanctuaryHero */}
      <svg
        className="absolute right-0 top-0 opacity-[0.08]"
        width="280"
        height="280"
        viewBox="0 0 280 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ pointerEvents: 'none' }}
      >
        <path
          d="M140 20C140 20 100 60 100 140C100 220 140 260 140 260C80 260 20 200 20 140C20 80 80 20 140 20Z"
          fill="white"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        {/* Eyebrow */}
        <p
          className="text-[11px] uppercase tracking-[0.3em]"
          style={{ color: '#c9a96e' }}
        >
          THE JOURNAL
        </p>

        {/* Heading */}
        <h1
          className="mt-4 font-serif text-4xl italic text-white sm:text-5xl md:text-6xl lg:text-[72px]"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Quiet Reflections
        </h1>

        {/* Subtext */}
        <p
          className="mt-6 max-w-2xl text-base font-light md:text-lg"
          style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
        >
          Gothic musings, ritual notes, and tales from the sanctuary.
        </p>

        {/* Gold divider */}
        <div
          className="mx-auto mt-8"
          style={{ width: '120px', height: '1px', backgroundColor: '#c9a96e' }}
          aria-hidden="true"
        />

        {/* Featured post block */}
        {featured && (
          <div className="mt-10 max-w-2xl space-y-4">
            {featured.category && (
              <p
                className="text-[11px] uppercase tracking-[0.3em]"
                style={{ color: '#c9a96e' }}
              >
                {featured.category}
              </p>
            )}

            <h2
              className="font-serif text-3xl italic text-white sm:text-4xl md:text-[48px] md:leading-tight"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {featured.title}
            </h2>

            {featured.excerpt && (
              <p
                className="mx-auto max-w-xl text-base font-light line-clamp-2"
                style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
              >
                {featured.excerpt}
              </p>
            )}

            <p
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: 'rgba(232, 228, 220, 0.5)' }}
            >
              CHARMED &amp; DARK · {formatDate(featured.created_at)}
            </p>

            <Link
              href={`/journal/${featured.slug}`}
              className="inline-block text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
              style={{ color: '#c9a96e' }}
            >
              READ MORE ›
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
