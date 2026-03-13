"use client";

export default function DropsHero({ onScrollToSignup, onScrollToAlerts }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#08080f', paddingTop: '80px', paddingBottom: '60px' }}
      aria-label="Drops hero section"
    >
      {/* Radial nebula gradient - decorative */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(75, 0, 130, 0.3), rgba(138, 43, 226, 0.2), transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Micro star field - decorative */}
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

      {/* Crescent moon SVG — bottom-left, partially cropped - decorative */}
      <svg
        className="absolute bottom-0 left-0 opacity-[0.08]"
        width="280"
        height="280"
        viewBox="0 0 280 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ pointerEvents: 'none', transform: 'translate(-30%, 30%)' }}
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
          aria-label="Section label"
        >
          DROPS
        </p>

        {/* Heading */}
        <h1
          className="mt-4 font-serif text-3xl italic text-white sm:text-5xl md:text-7xl lg:text-8xl"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Limited releases. Quiet power.
        </h1>

        {/* Subtext */}
        <p
          className="mt-6 max-w-2xl text-base font-light md:text-lg"
          style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
        >
          Rare pieces released in small batches. Once the window closes, they're gone.
        </p>

        {/* CTA Buttons */}
        <nav className="mt-10 flex w-full flex-col items-center gap-4 px-4 sm:w-auto sm:flex-row sm:px-0" aria-label="Primary actions">
          <button
            onClick={onScrollToSignup}
            className="w-full rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f] sm:w-auto"
            style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}
            aria-label="Join the Sanctuary membership"
          >
            Join the Sanctuary
          </button>
          <button
            onClick={onScrollToAlerts}
            className="w-full rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8e4dc] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f] sm:w-auto"
            style={{ border: '1px solid rgba(232, 228, 220, 0.3)', color: '#e8e4dc' }}
            aria-label="Subscribe to drop alerts"
          >
            Get drop alerts
          </button>
        </nav>

        {/* Member benefit line */}
        <p
          className="mt-8 text-[11px] uppercase tracking-[0.3em]"
          style={{ color: '#c9a96e' }}
        >
          MEMBERS UNLOCK SANCTUARY PRICING AND EARLY ACCESS.
        </p>
      </div>
    </section>
  );
}
