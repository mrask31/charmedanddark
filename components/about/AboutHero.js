"use client";

export default function AboutHero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden text-center"
      style={{ backgroundColor: '#08080f', paddingTop: '80px', paddingBottom: '80px', minHeight: '480px' }}
      aria-label="About hero section"
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
      <div className="relative z-10 flex flex-col items-center gap-5 px-6 max-w-3xl mx-auto">
        <span
          className="text-[11px] uppercase tracking-[0.22em]"
          style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
        >
          ABOUT THE HOUSE
        </span>

        <h1
          className="leading-none text-balance"
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(52px, 8vw, 80px)',
            color: '#e8e4dc',
            fontWeight: 400,
          }}
        >
          Charmed &amp; Dark
        </h1>

        <p
          className="text-center text-balance font-light"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '17px',
            color: 'rgba(232, 228, 220, 0.55)',
            lineHeight: 1.7,
            maxWidth: '520px',
          }}
        >
          A boutique for the modern shadow—crafted for quiet, beauty, and ritual.
        </p>

        {/* Thin gold divider */}
        <div
          style={{ width: '120px', height: '1px', backgroundColor: '#c9a96e', opacity: 0.5, marginTop: '4px' }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
