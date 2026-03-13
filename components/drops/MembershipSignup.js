"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function MembershipSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) return;

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/sanctuary`,
        },
      });

      if (authError) throw authError;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/sanctuary';
      }, 1500);
    } catch (err) {
      setError(err.message || 'Unable to join at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="membership-signup" className="mt-16 space-y-4 text-center" aria-labelledby="signup-heading">
      {/* Heading */}
      <h3
        id="signup-heading"
        className="font-serif text-3xl italic text-white md:text-4xl"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
      >
        Join free. Leave anytime.
      </h3>

      {/* Subtext */}
      <p
        className="mx-auto max-w-lg text-base font-light"
        style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
      >
        No credit card. No performance. Just the quieter side of the drop.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-6 flex w-full max-w-md flex-col items-center gap-3 px-4 sm:flex-row sm:px-0"
        aria-label="Membership signup form"
      >
        <label htmlFor="membership-email" className="sr-only">
          Email address for membership signup
        </label>
        <input
          id="membership-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address for membership signup"
          aria-required="true"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'signup-error' : success ? 'signup-success' : undefined}
          required
          className="w-full px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
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
          disabled={loading}
          className="w-full whitespace-nowrap rounded-full px-6 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f] disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
          style={{
            border: '1px solid #c9a96e',
            color: '#c9a96e',
          }}
          aria-label={loading ? 'Joining Sanctuary, please wait' : 'Join the Sanctuary'}
        >
          {loading ? 'Joining…' : 'Join the Sanctuary'}
        </button>
      </form>

      {/* Feedback messages */}
      {success && (
        <p id="signup-success" className="mt-4 text-sm" style={{ color: '#c9a96e' }} role="status" aria-live="polite">
          Welcome to the Sanctuary. Redirecting…
        </p>
      )}
      {error && (
        <p id="signup-error" className="mt-4 text-sm" style={{ color: '#e05252' }} role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      {/* Sign-in link */}
      <p
        className="mt-6 text-[11px] uppercase tracking-[0.3em]"
        style={{ color: 'rgba(232, 228, 220, 0.5)' }}
      >
        ALREADY A MEMBER?{' '}
        <a
          href="/join"
          className="underline transition-colors hover:text-[#c9a96e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
          style={{ color: 'rgba(232, 228, 220, 0.5)' }}
          aria-label="Sign in to existing membership"
        >
          SIGN IN.
        </a>
      </p>
    </section>
  );
}
