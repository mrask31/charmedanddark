"use client";

import { useState } from 'react';

export default function JoinCta() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    console.log('Sanctuary signup:', email);
    setSubmitted(true);
  }

  return (
    <section style={{ paddingTop: '40px', paddingBottom: '80px', backgroundColor: '#08080f' }}>
      <div className="mx-auto max-w-[1280px] px-6 flex justify-center">
        <div
          className="w-full flex flex-col items-center text-center gap-6"
          style={{
            maxWidth: '680px',
            backgroundColor: '#0e0e1a',
            border: '1px solid rgba(201, 169, 110, 0.2)',
            borderRadius: '0px',
            padding: 'clamp(40px, 6vw, 64px) clamp(28px, 5vw, 56px)',
          }}
        >
          <h2
            className="text-balance leading-tight"
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: '#e8e4dc',
              fontWeight: 400,
            }}
          >
            Join Free. Save 10% forever.
          </h2>

          <p
            className="font-light"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              color: 'rgba(232, 228, 220, 0.55)',
              lineHeight: 1.8,
            }}
          >
            Your Circle entry is instant. You can leave anytime.
          </p>

          <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col items-center gap-4">
            <label htmlFor="cta-email" className="sr-only">Email address</label>
            <input
              id="cta-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-5 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e1a]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(201,169,110,0.3)',
                borderRadius: '0px',
                color: '#e8e4dc',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <button
              type="submit"
              className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]"
              style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}
            >
              Enter the Sanctuary
            </button>
            {submitted && (
              <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: '#c9a96e' }} role="status">
                You&apos;re in. Check your email soon.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
