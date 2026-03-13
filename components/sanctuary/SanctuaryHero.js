import { ChevronDown } from 'lucide-react';

export default function SanctuaryHero({ onScrollClick }) {
  return (
    <section className="relative overflow-hidden py-20 md:py-24" style={{ backgroundColor: '#08080f', paddingTop: '80px', paddingBottom: '60px' }}>
      {/* Radial nebula gradient */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at top right, rgba(75, 0, 130, 0.3), rgba(138, 43, 226, 0.2), transparent 70%)'
        }}
      />
      
      {/* Micro star field */}
      <div className="absolute inset-0 pointer-events-none">
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

      {/* Crescent moon SVG */}
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
        <p 
          className="text-[11px] uppercase tracking-[0.3em]"
          style={{ color: '#c9a96e' }}
        >
          The Sanctuary
        </p>
        
        <h1 
          className="mt-4 font-serif text-5xl italic text-white md:text-7xl lg:text-8xl"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Enter the Sanctuary
        </h1>
        
        <p 
          className="mt-6 max-w-2xl text-base font-light md:text-lg"
          style={{ color: '#e8e4dc', fontWeight: 300 }}
        >
          A private space for members—where readings are saved, prices are lower, and the experience is yours alone.
        </p>

        {/* Scroll chevron */}
        <button
          onClick={onScrollClick}
          className="mt-12 animate-pulse"
          aria-label="Scroll to features"
          style={{ color: '#c9a96e' }}
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      </div>
    </section>
  );
}
