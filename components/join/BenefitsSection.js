"use client";

const benefits = [
  {
    title: 'Sanctuary Pricing',
    body: 'Two prices appear across the House. Members unlock the Sanctuary Price automatically.',
  },
  {
    title: 'Early Drop Windows',
    body: 'Early access to every new drop before the public.',
  },
  {
    title: 'The Grimoire',
    body: 'Your saved Mirror readings—private, timestamped, and always yours.',
  },
];

export default function BenefitsSection() {
  return (
    <section id="member-benefits" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
      <p
        className="mb-8 text-[11px] uppercase tracking-[0.3em]"
        style={{ color: '#c9a96e' }}
      >
        MEMBER BENEFITS
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => (
          <article
            key={b.title}
            className="flex flex-col gap-3 transition-shadow duration-300"
            style={{
              backgroundColor: '#0e0e1a',
              border: '1px solid rgba(201, 169, 110, 0.2)',
              borderRadius: '0px',
              padding: '28px 24px',
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
                fontSize: '22px',
                color: '#e8e4dc',
                fontWeight: 400,
              }}
            >
              {b.title}
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
              {b.body}
            </p>
          </article>
        ))}
      </div>

      <p
        className="mt-6 text-[10px] uppercase tracking-[0.3em]"
        style={{ color: 'rgba(232, 228, 220, 0.4)' }}
      >
        The Circle grows quietly each night.
      </p>
    </section>
  );
}
