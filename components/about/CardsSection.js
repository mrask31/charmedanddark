"use client";

export default function CardsSection({ eyebrow, subtext, cards }) {
  return (
    <section style={{ paddingTop: '60px', paddingBottom: '60px', backgroundColor: '#08080f' }}>
      <div className="w-full max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-10">
          <span
            className="font-light tracking-[0.22em]"
            style={{ color: '#c9a96e', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}
          >
            {eyebrow}
          </span>
          {subtext && (
            <p
              className="font-light"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                color: 'rgba(232, 228, 220, 0.55)',
                lineHeight: 1.7,
                maxWidth: '600px',
              }}
            >
              {subtext}
            </p>
          )}
        </div>

        {/* Cards grid */}
        <div className={`grid gap-5 ${cards.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {cards.map((card) => (
            <article
              key={card.heading}
              className="flex flex-col gap-4 transition-shadow duration-300"
              style={{
                backgroundColor: '#0e0e1a',
                border: '1px solid rgba(201, 169, 110, 0.2)',
                borderRadius: '0px',
                padding: '32px 28px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(201, 169, 110, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: '24px',
                  color: '#e8e4dc',
                  fontWeight: 400,
                  lineHeight: 1.2,
                }}
              >
                {card.heading}
              </h3>
              <p
                className="font-light"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  color: 'rgba(232, 228, 220, 0.55)',
                  lineHeight: 1.8,
                }}
              >
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
