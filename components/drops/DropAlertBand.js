"use client";

import { useState } from 'react';

/**
 * Basic email format validation.
 * Exported for testing.
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function DropAlertBand() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/mailchimp/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to subscribe');
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="drop-alerts"
      style={{
        backgroundColor: '#0e0e1a',
        borderTop: '1px solid #c9a96e',
        borderBottom: '1px solid #c9a96e',
        borderRadius: '0px',
      }}
      aria-labelledby="drop-alerts-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
          {/* Left side — label + subtext */}
          <div className="space-y-2">
            <h2
              id="drop-alerts-heading"
              className="text-[11px] uppercase tracking-[0.3em]"
              style={{ color: '#c9a96e' }}
            >
              STAY IN THE WINDOW
            </h2>
            <p
              className="max-w-md text-sm font-light sm:text-base"
              style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
            >
              Get notified before each drop opens. No spam—just a quiet signal when it's time.
            </p>
          </div>

          {/* Right side — form */}
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            aria-label="Drop alerts subscription form"
          >
            <label htmlFor="drop-alert-email" className="sr-only">
              Email address for drop alerts
            </label>
            <input
              id="drop-alert-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address for drop alerts"
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'alert-error' : success ? 'alert-success' : undefined}
              className="w-full px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e1a] sm:w-64"
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
              className="w-full rounded-full px-6 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e1a] disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
              style={{
                border: '1px solid #c9a96e',
                color: '#c9a96e',
              }}
              aria-label={loading ? 'Subscribing to drop alerts, please wait' : 'Subscribe to drop alerts'}
            >
              {loading ? 'SENDING…' : 'NOTIFY ME'}
            </button>
          </form>
        </div>

        {/* Feedback messages */}
        {success && (
          <p
            id="alert-success"
            className="mt-4 text-sm"
            style={{ color: '#c9a96e' }}
            role="status"
            aria-live="polite"
          >
            You're on the list. We'll signal you when the window opens.
          </p>
        )}
        {error && (
          <p
            id="alert-error"
            className="mt-4 text-sm"
            style={{ color: '#e05252' }}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
