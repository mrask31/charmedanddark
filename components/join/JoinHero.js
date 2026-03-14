"use client";

import { useState } from 'react';

export default function JoinHero() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // TODO: wire to Supabase auth.signUp
    console.log('Sanctuary signup:', email);
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#08080f', paddingTop: '80px', paddingBottom: '60px' }}
      aria-label="Join the Sanctuary hero"
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

      {/* Crescent moon SVG — top-right — identical to SanctuaryHero */}
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
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p
          className="text-[11px] uppercase tracking-[0.3em]"
          style={{ color: '#c9a96e' }}
        >
          JOIN THE SANCTUARY
        </p>

        <h1
          className="mt-4 font-serif text-4xl italic text-white sm:text-5xl md:text-6xl lg:text-[72px]"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Step into the Circle.
        </h1>

        <p
          className="mt-6 max-w-xl text-base font-light md:text-lg"
          style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
        >
          The world is loud. Your home should be quiet.
        </p>

        {/* Quick benefits */}
        <ul
          className="mt-6 space-y-2 text-sm font-light"
          style={{ color: 'rgba(232, 228, 220, 0.55)', fontFamily: 'Inter, sans-serif' }}
        >
          <li>10% off always (Sanctuary Price)</li>
          <li>Early access to every new drop before the public</li>
          <li>Save your Mirror readings privately in your Grimoire</li>
        </ul>

        {/* Signup form */}
        <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md flex-col items-center gap-4">
          <label htmlFor="join-email" className="sr-only">Email address</label>
          <input
            id="join-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            aria-required="true"
            className="w-full px-5 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(201,169,110,0.3)',
              borderRadius: '0px',
              color: '#e8e4dc',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f] disabled:opacity-50"
              style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}
            >
              {loading ? 'JOINING…' : 'Enter the Sanctuary'}
            </button>
            <a
              href="#member-benefits"
              className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8e4dc] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
              style={{ border: '1px solid rgba(232, 228, 220, 0.2)', color: '#e8e4dc' }}
            >
              See member benefits
            </a>
          </div>
          <p className="text-xs" style={{ color: 'rgba(232, 228, 220, 0.4)' }}>
            Free to join. Purchases are separate.
          </p>
          {submitted && (
            <p
              className="text-[11px] uppercase tracking-[0.3em]"
              style={{ color: '#c9a96e' }}
              role="status"
            >
              You&apos;re in. Check your email soon.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
