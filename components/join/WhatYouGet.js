"use client";

export default function WhatYouGet() {
  return (
    <section style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div
        className="grid gap-8 md:grid-cols-2"
        style={{
          backgroundColor: '#0e0e1a',
          border: '1px solid rgba(201, 169, 110, 0.2)',
          borderRadius: '0px',
          padding: '32px 28px',
        }}
      >
        <div className="space-y-4">
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '24px',
              color: '#e8e4dc',
              fontWeight: 400,
            }}
          >
            What you get
          </h2>
          <ul
            className="space-y-2 font-light"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(232, 228, 220, 0.55)', lineHeight: 1.8 }}
          >
            <li>Sanctuary Price across the House</li>
            <li>Early access to Drops</li>
            <li>Saved Mirror readings in the Grimoire</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '24px',
              color: '#e8e4dc',
              fontWeight: 400,
            }}
          >
            What we don&apos;t do
          </h2>
          <ul
            className="space-y-2 font-light"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(232, 228, 220, 0.55)', lineHeight: 1.8 }}
          >
            <li>No spam, no loud promos</li>
            <li>No public posts, no performance</li>
            <li>No noisy feed or pressure to buy</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
