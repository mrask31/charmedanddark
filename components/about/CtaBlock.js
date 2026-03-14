"use client";

import Link from 'next/link';

export default function CtaBlock() {
  return (
    <section style={{ paddingTop: '60px', paddingBottom: '60px', backgroundColor: '#08080f' }}>
      <div className="w-full max-w-[1280px] mx-auto px-6 flex justify-center">
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
          {/* Eyebrow */}
          <span
            className="font-light tracking-[0.22em]"
            style={{ color: '#c9a96e', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}
          >
            AN INVITATION
          </span>

          {/* Heading */}
          <h2
            className="text-balance leading-tight"
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: '#e8e4dc',
              fontWeight: 400,
            }}
          >
            You don&apos;t have to be loud to be unforgettable.
          </h2>

          {/* Body */}
          <p
            className="font-light text-pretty"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              color: 'rgba(232, 228, 220, 0.55)',
              lineHeight: 1.8,
              maxWidth: '480px',
            }}
          >
            You don&apos;t have to explain your darkness to deserve softness. Enter when you&apos;re ready.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <Link
              href="/shop"
              className="font-light transition-all duration-200 hover:shadow-[0_0_20px_rgba(201,169,110,0.08)] hover:bg-[rgba(201,169,110,0.06)]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                letterSpacing: '0.12em',
                color: '#c9a96e',
                border: '1px solid #c9a96e',
                borderRadius: '999px',
                padding: '12px 28px',
                textDecoration: 'none',
              }}
            >
              Shop the House
            </Link>
            <Link
              href="/sanctuary"
              className="font-light transition-all duration-200 hover:shadow-[0_0_20px_rgba(201,169,110,0.08)] hover:border-[rgba(201,169,110,0.3)]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                letterSpacing: '0.12em',
                color: 'rgba(232, 228, 220, 0.55)',
                border: '1px solid rgba(232, 228, 220, 0.2)',
                borderRadius: '999px',
                padding: '12px 28px',
                textDecoration: 'none',
              }}
            >
              Enter the Sanctuary
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
