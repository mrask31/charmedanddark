'use client';

import { useState } from 'react';
import Link from 'next/link';

const SUBJECTS = ['Order Issue', 'Returns', 'Wholesale/Collab', 'Sanctuary', 'General'];

const FAQ_DATA = [
  {
    title: 'Shipping',
    content: 'Free shipping on orders $100+, continental US only. Standard shipping takes 5–8 business days. Orders are processed within 1–3 business days. We do not offer international shipping at this time.',
  },
  {
    title: 'Returns & Orders',
    content: 'Contact us within 14 days of delivery for returns. Items must be unworn and in unused condition. Print-on-demand items (apparel, wall art) — please contact us directly for quality issues. Sale items are final sale.',
  },
  {
    title: 'The Sanctuary',
    content: 'Membership is completely free. Members receive 10% off every order automatically — no codes needed. You also get early access to new Drops and a birthday gift of 15% off during your birthday month.',
  },
  {
    title: 'The Mirror',
    content: 'The Mirror is our AI-powered mood oracle. It offers a personal reading mode and a gift shopping mode to help you find the right piece. You can find it in the Sanctuary section of the site.',
  },
  {
    title: 'Drops',
    content: 'Drops are limited release collections that arrive quietly and disappear just as cleanly. Sanctuary members get early access before the public. Follow us on Instagram and TikTok for announcements.',
  },
  {
    title: 'The Grimoire',
    content: 'The Grimoire is exclusive content for Sanctuary members only. It becomes accessible after joining and contains dark lifestyle content, rituals, and brand lore.',
  },
  {
    title: 'Wholesale & Collabs',
    content: 'For wholesale inquiries, email hello@charmedanddark.com. For creator collaborations, please include your handle and audience size in your message.',
  },
];

function FaqItem({ title, content }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(201,169,110,0.15)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 0', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem',
          color: '#e8e4dc', textAlign: 'left',
        }}
      >
        {title}
        <span style={{ color: '#c9a96e', fontSize: '1.5rem', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <p style={{
          padding: '0 0 1.25rem 0', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
          color: 'rgba(232,228,220,0.6)', lineHeight: 1.8,
        }}>
          {content}
        </p>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0e0e1a',
    border: '1px solid rgba(201,169,110,0.2)', borderRadius: '0',
    color: '#e8e4dc', fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter, sans-serif',
  };

  return (
    <main style={{ backgroundColor: '#08080f', minHeight: '100vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 120px' }}>

        {/* Header */}
        <p style={{ color: '#c9a96e', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Contact
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#e8e4dc', fontWeight: 400, marginBottom: '0.75rem' }}>
          Reach Into the Dark
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(232,228,220,0.55)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Questions, concerns, or whispers — we're listening.
        </p>

        {/* Form */}
        {status === 'success' ? (
          <div style={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(201,169,110,0.2)', padding: '2.5rem', textAlign: 'center' }}>
            <p style={{ color: '#c9a96e', fontSize: '1.5rem', marginBottom: '0.75rem' }}>🖤</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', color: '#e8e4dc', marginBottom: '0.5rem' }}>
              Message sent.
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(232,228,220,0.5)' }}>
              We'll get back to you within 24–48 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <select value={subject} onChange={(e) => setSubject(e.target.value)}
              style={{ ...inputStyle, color: subject ? '#e8e4dc' : 'rgba(232,228,220,0.4)', appearance: 'none', WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c9a96e' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', paddingRight: '2.5rem', cursor: 'pointer' }}>
              <option value="">Subject</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea placeholder="Your message..." required value={message} onChange={(e) => setMessage(e.target.value)} rows={6}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }} />

            {status === 'error' && (
              <p style={{ color: '#e24b4a', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>Something went wrong. Please try again.</p>
            )}

            <button type="submit" disabled={status === 'loading'}
              style={{
                padding: '0.85rem 2rem', border: '1px solid #c9a96e', color: '#c9a96e',
                backgroundColor: 'transparent', fontSize: '0.8rem', fontWeight: 500,
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', opacity: status === 'loading' ? 0.5 : 1,
              }}>
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        {/* FAQ */}
        <div style={{ marginTop: '4rem' }}>
          <p style={{ color: '#c9a96e', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Frequently Asked Questions
          </p>
          {FAQ_DATA.map((faq) => <FaqItem key={faq.title} title={faq.title} content={faq.content} />)}
        </div>
      </div>
    </main>
  );
}
