"use client";

const steps = [
  { title: 'Join', body: 'Enter an email. Step into the Circle.' },
  { title: 'Unlock', body: 'Sanctuary pricing + private access appears across the site.' },
  { title: 'Return', body: 'Drops + Mirror readings create a daily ritual loop.' },
];

export default function HowItWorks() {
  return (
    <section style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <p
        className="mb-8 text-[11px] uppercase tracking-[0.3em]"
        style={{ color: '#c9a96e' }}
      >
        HOW IT WORKS
      </p>

      <div className="grid gap-5 sm:grid-cols-3">
        {steps.map((s) => (
          <article
            key={s.title}
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
              {s.title}
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
              {s.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
