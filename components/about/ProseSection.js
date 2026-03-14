"use client";

export default function ProseSection({ pullQuote, body }) {
  return (
    <section
      className="flex flex-col items-center text-center"
      style={{ paddingTop: '60px', paddingBottom: '60px', backgroundColor: '#08080f' }}
    >
      <div className="w-full max-w-[760px] mx-auto px-6 flex flex-col items-center gap-6">
        <h2
          className="text-balance leading-tight"
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(34px, 5vw, 48px)',
            color: '#e8e4dc',
            fontWeight: 400,
          }}
        >
          {pullQuote}
        </h2>

        <p
          className="font-light text-pretty"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '17px',
            color: 'rgba(232, 228, 220, 0.55)',
            lineHeight: 1.85,
          }}
        >
          {body}
        </p>

        {/* Thin gold divider */}
        <div
          style={{ width: '60px', height: '1px', backgroundColor: '#c9a96e', opacity: 0.5, marginTop: '8px' }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
