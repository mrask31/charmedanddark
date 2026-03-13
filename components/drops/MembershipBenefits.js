"use client";

import MembershipSignup from './MembershipSignup';

const benefits = [
  {
    title: 'Always First',
    description: 'Early access to every drop before the public window opens.',
  },
  {
    title: 'Always Less',
    description: 'Sanctuary pricing on all drops—lower than public rates.',
  },
  {
    title: 'Always Yours',
    description: 'Your readings saved in The Grimoire, your space preserved.',
  },
];

export default function MembershipBenefits() {
  return (
    <section className="space-y-6" aria-labelledby="membership-heading">
      {/* Eyebrow */}
      <p
        className="text-[11px] uppercase tracking-[0.3em]"
        style={{ color: '#c9a96e' }}
        aria-label="Section label"
      >
        MEMBERSHIP
      </p>

      {/* Heading */}
      <h2
        id="membership-heading"
        className="font-serif text-4xl italic text-white md:text-5xl"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
      >
        The quieter way in.
      </h2>

      {/* Subtext */}
      <p
        className="max-w-2xl text-base font-light"
        style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
      >
        Free to join. No feed. No noise. Just access.
      </p>

      {/* Benefit Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3" role="list" aria-label="Membership benefits">
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="p-6"
            style={{
              backgroundColor: '#0e0e1a',
              border: '1px solid rgba(201, 169, 110, 0.15)',
              borderRadius: '0px',
            }}
            role="listitem"
          >
            <h3
              className="font-serif text-xl text-white"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {benefit.title}
            </h3>
            <p
              className="mt-3 text-sm font-light"
              style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
            >
              {benefit.description}
            </p>
          </article>
        ))}
      </div>

      {/* Membership Signup */}
      <MembershipSignup />
    </section>
  );
}
