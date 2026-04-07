'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

async function handleJoinSubmit(email, password, firstName, setStatus, signUp, resetPassword) {
  if (!email || !email.includes('@')) {
    setStatus({ type: 'error', message: 'Please enter a valid email address.' })
    return
  }
  if (!password || password.length < 8) {
    setStatus({ type: 'error', message: 'Password must be at least 8 characters.' })
    return
  }

  setStatus({ type: 'loading', message: 'Entering the Sanctuary...' })

  try {
    // Supabase auth signUp
    const { error: authError } = await signUp(email, password, {
      is_sanctuary_member: true,
      first_name: firstName || undefined,
    });

    if (authError) {
      if (authError.message?.includes('already') || authError.status === 422) {
        await resetPassword(email);
        setStatus({ type: 'success', message: 'An account exists — check your email to set your password.', alreadyMember: true })
        return
      }
      throw authError;
    }

    // Subscribe to Klaviyo Sanctuary Members list
    const klaviyoRes = await fetch('/api/klaviyo/sanctuary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName, source: 'join-page' }),
    })

    // Also subscribe to newsletter list
    await fetch('/api/klaviyo/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName, source: 'sanctuary-join' }),
    })

    setStatus({ type: 'success', message: "You're in. Welcome to the Sanctuary." })
  } catch (err) {
    console.error('Join form error:', err)
    setStatus({ type: 'error', message: err.message || 'Something went wrong. Please try again.' })
  }
}

function JoinForm({ inputId = 'join-email', buttonLabel = 'Enter the Sanctuary' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState(null)
  const { signUp, resetPassword } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    await handleJoinSubmit(email, password, firstName, setStatus, signUp, resetPassword)
  }

  if (status?.type === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <p style={{ color: '#c9a96e', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '22px', fontStyle: 'italic' }}>
          {status.alreadyMember ? "An account exists — check your email." : "You're in. Welcome to the Sanctuary."}
        </p>
        <p style={{ color: 'rgba(232, 228, 220, 0.55)', fontFamily: 'Inter, sans-serif', fontSize: '14px', marginTop: '8px' }}>
          {status.alreadyMember ? "We sent a password reset link." : "Check your inbox — a welcome awaits."}
        </p>
      </div>
    )
  }

  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(201,169,110,0.3)',
    borderRadius: '0px',
    color: '#e8e4dc',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col items-center gap-3">
      <label htmlFor={`${inputId}-name`} className="sr-only">First name</label>
      <input
        id={`${inputId}-name`}
        type="text"
        placeholder="First name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        disabled={status?.type === 'loading'}
        className="w-full px-5 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
        style={inputStyle}
      />
      <label htmlFor={inputId} className="sr-only">Email address</label>
      <input
        id={inputId}
        type="email"
        placeholder="you@example.com"
        required
        aria-required="true"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status?.type === 'loading'}
        className="w-full px-5 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
        style={inputStyle}
      />
      <div className="relative w-full">
        <label htmlFor={`${inputId}-pw`} className="sr-only">Password</label>
        <input
          id={`${inputId}-pw`}
          type={showPassword ? 'text' : 'password'}
          placeholder="Password (min 8 characters)"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={status?.type === 'loading'}
          className="w-full px-5 py-3 pr-16 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
          style={inputStyle}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-wider"
          style={{ color: '#6b6760' }}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      {status?.type === 'error' && (
        <p style={{ color: '#e24b4a', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
          {status.message}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row mt-1">
        <button
          type="submit"
          disabled={status?.type === 'loading'}
          className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f] disabled:opacity-50"
          style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}
        >
          {status?.type === 'loading' ? 'Entering...' : buttonLabel}
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
    </form>
  )
}

function CtaForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    await handleJoinSubmit(email, setStatus)
  }

  if (status?.type === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <p style={{ color: '#c9a96e', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '20px', fontStyle: 'italic' }}>
          {status.alreadyMember ? "You're already one of us." : "You're in. Welcome to the Sanctuary."}
        </p>
        <p style={{ color: 'rgba(232, 228, 220, 0.55)', fontFamily: 'Inter, sans-serif', fontSize: '14px', marginTop: '8px' }}>
          {status.alreadyMember ? "The Sanctuary remembers you." : "Check your inbox — a welcome awaits."}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col items-center gap-4">
      <label htmlFor="cta-email" className="sr-only">Email address</label>
      <input
        id="cta-email"
        type="email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status?.type === 'loading'}
        className="w-full px-5 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e1a]"
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(201,169,110,0.3)',
          borderRadius: '0px',
          color: '#e8e4dc',
          fontFamily: 'Inter, sans-serif',
        }}
      />
      {status?.type === 'error' && (
        <p style={{ color: '#e24b4a', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
          {status.message}
        </p>
      )}
      <button
        type="submit"
        disabled={status?.type === 'loading'}
        className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] disabled:opacity-50"
        style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}
      >
        {status?.type === 'loading' ? 'Entering...' : 'Enter the Sanctuary'}
      </button>
    </form>
  )
}

export default function JoinPage() {
  return (
    <main style={{ backgroundColor: '#08080f', overflowX: 'hidden' }}>
      {/* Hero / main join section */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: '#08080f', paddingTop: '80px', paddingBottom: '60px' }}
        aria-label="Join the Sanctuary hero"
      >
        {/* Background effects */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, rgba(75, 0, 130, 0.3), rgba(138, 43, 226, 0.2), transparent 70%)' }}
          aria-hidden="true"
        />
        <svg
          className="absolute right-0 top-0 opacity-[0.08]"
          width="280" height="280" viewBox="0 0 280 280"
          fill="none" xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ pointerEvents: 'none' }}
        >
          <path d="M140 20C140 20 100 60 100 140C100 220 140 260 140 260C80 260 20 200 20 140C20 80 80 20 140 20Z" fill="white" />
        </svg>

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: '#c9a96e' }}>
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
          <ul
            className="mt-6 space-y-2 text-sm font-light"
            style={{ color: 'rgba(232, 228, 220, 0.55)', fontFamily: 'Inter, sans-serif' }}
          >
            <li>10% off always (Sanctuary Price)</li>
            <li>Early access to every new drop before the public</li>
            <li>Save your Mirror readings privately in your Grimoire</li>
          </ul>

          <div className="mt-8 w-full max-w-md">
            <JoinForm inputId="join-email" buttonLabel="Enter the Sanctuary" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6">
        {/* Member Benefits */}
        <section id="member-benefits" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <p className="mb-8 text-[11px] uppercase tracking-[0.3em]" style={{ color: '#c9a96e' }}>
            MEMBER BENEFITS
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
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
            ].map((b) => (
              <article
                key={b.title}
                className="flex flex-col gap-3"
                style={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(201, 169, 110, 0.2)', borderRadius: '0px', padding: '28px 24px' }}
              >
                <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '22px', color: '#e8e4dc', fontWeight: 400 }}>
                  {b.title}
                </h3>
                <p className="font-light" style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(232, 228, 220, 0.55)', lineHeight: 1.8 }}>
                  {b.body}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-[10px] uppercase tracking-[0.3em]" style={{ color: 'rgba(232, 228, 220, 0.4)' }}>
            The Circle grows quietly each night.
          </p>
        </section>

        {/* How it works */}
        <section style={{ paddingTop: '40px', paddingBottom: '60px' }}>
          <p className="mb-8 text-[11px] uppercase tracking-[0.3em]" style={{ color: '#c9a96e' }}>
            HOW IT WORKS
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { title: 'Join', body: 'Enter an email. Step into the Circle.' },
              { title: 'Unlock', body: 'Sanctuary pricing + private access appears across the site.' },
              { title: 'Return', body: 'Drops + Mirror readings create a daily ritual loop.' },
            ].map((s) => (
              <article
                key={s.title}
                className="flex flex-col gap-3"
                style={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(201, 169, 110, 0.2)', borderRadius: '0px', padding: '28px 24px' }}
              >
                <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '22px', color: '#e8e4dc', fontWeight: 400 }}>
                  {s.title}
                </h3>
                <p className="font-light" style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(232, 228, 220, 0.55)', lineHeight: 1.8 }}>
                  {s.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* What you get / What we don't do */}
        <section style={{ paddingTop: '40px', paddingBottom: '60px' }}>
          <div
            className="grid gap-8 md:grid-cols-2"
            style={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(201, 169, 110, 0.2)', borderRadius: '0px', padding: '32px 28px' }}
          >
            <div className="space-y-4">
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '24px', color: '#e8e4dc', fontWeight: 400 }}>
                What you get
              </h2>
              <ul className="space-y-2 font-light" style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(232, 228, 220, 0.55)', lineHeight: 1.8 }}>
                <li>Sanctuary Price across the House</li>
                <li>Early access to Drops</li>
                <li>Saved Mirror readings in the Grimoire</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '24px', color: '#e8e4dc', fontWeight: 400 }}>
                What we don&apos;t do
              </h2>
              <ul className="space-y-2 font-light" style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(232, 228, 220, 0.55)', lineHeight: 1.8 }}>
                <li>No spam, no loud promos</li>
                <li>No public posts, no performance</li>
                <li>No noisy feed or pressure to buy</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ paddingTop: '40px', paddingBottom: '60px' }}>
          <p className="mb-8 text-[11px] uppercase tracking-[0.3em]" style={{ color: '#c9a96e' }}>
            FAQ
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { q: 'Is it really free?', a: 'Yes—joining is free. Purchases are separate.' },
              { q: 'How does Sanctuary pricing work?', a: 'Two prices appear. Members unlock the Sanctuary Price automatically.' },
              { q: 'Do I have to buy anything?', a: 'No. Membership simply unlocks access and pricing.' },
              { q: 'What is The Mirror?', a: 'A private reflection and recommendation experience—quiet, personal, and on-brand.' },
            ].map((faq) => (
              <article
                key={faq.q}
                className="flex flex-col gap-3"
                style={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(201, 169, 110, 0.2)', borderRadius: '0px', padding: '28px 24px' }}
              >
                <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '20px', color: '#e8e4dc', fontWeight: 400 }}>
                  {faq.q}
                </h3>
                <p className="font-light" style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(232, 228, 220, 0.55)', lineHeight: 1.8 }}>
                  {faq.a}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
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
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', color: '#e8e4dc', fontWeight: 400 }}
            >
              Join Free. Save 10% forever.
            </h2>
            <p className="font-light" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'rgba(232, 228, 220, 0.55)', lineHeight: 1.8 }}>
              Your Circle entry is instant. You can leave anytime.
            </p>
            <CtaForm />
          </div>
        </div>
      </section>
    </main>
  )
}
