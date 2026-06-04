'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { posthog } from '@/components/providers/posthog-provider';

function captureAuthEvent(eventName, properties = {}) {
  try {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture(eventName, {
        source: 'reset_password_page',
        ...properties,
      });
    }
  } catch (_) {
    // Do not block auth flows on analytics failures.
  }
}

function parseRecoveryParams(params, source) {
  const errorCode = params.get('error_code');
  const errorDescription = params.get('error_description');
  const error = params.get('error');

  if (!error && !errorCode && !errorDescription) return null;

  return {
    source,
    error,
    error_code: errorCode,
    error_description: errorDescription,
  };
}

function getRecoveryUrlError() {
  if (typeof window === 'undefined') return null;

  // Supabase usually returns recovery errors in the URL hash, e.g.
  // /reset-password#error=access_denied&error_code=otp_expired
  const hash = window.location.hash || '';
  if (hash) {
    const hashError = parseRecoveryParams(new URLSearchParams(hash.replace(/^#/, '')), 'hash');
    if (hashError) return hashError;
  }

  // Some mobile browsers, email clients, and manual tests can strip or rewrite
  // hashes. Support query params too so the same expired-link UX can still be
  // tested and handled safely.
  const search = window.location.search || '';
  if (search) {
    const queryError = parseRecoveryParams(new URLSearchParams(search), 'query');
    if (queryError) return queryError;
  }

  return null;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { supabase, resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null);
  const [recoveryError, setRecoveryError] = useState(null);

  useEffect(() => {
    const urlError = getRecoveryUrlError();
    if (!urlError) return;

    setRecoveryError(urlError);
    captureAuthEvent('password_reset_link_error', {
      error_code: urlError.error_code || 'unknown',
      error: urlError.error || 'unknown',
      url_error_source: urlError.source,
    });

    if (urlError.error_code === 'otp_expired') {
      captureAuthEvent('password_reset_link_expired', {
        url_error_source: urlError.source,
      });
    }
  }, []);

  async function handleRequestNewLink(e) {
    e.preventDefault();

    if (!email) {
      setStatus({ type: 'error', message: 'Enter your email and we will send a fresh reset link.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Sending a fresh reset link...' });
    captureAuthEvent('password_reset_requested', { location: 'expired_link_state' });

    const { error } = await resetPassword(email);
    if (error) {
      captureAuthEvent('password_reset_request_failed', {
        error_message: error.message,
        status: error.status,
        location: 'expired_link_state',
      });
      setStatus({ type: 'error', message: error.message || 'We could not send a reset link. Please try again.' });
      return;
    }

    captureAuthEvent('password_reset_email_sent', { location: 'expired_link_state' });
    setStatus({ type: 'success', message: 'A fresh reset link has been sent. Check your email.' });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (password.length < 8) {
      setStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Updating your password...' });

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      captureAuthEvent('password_reset_failed', {
        error_message: error.message,
        status: error.status,
      });
      setStatus({ type: 'error', message: error.message || 'We could not update your password. Please request a new reset link.' });
      return;
    }

    captureAuthEvent('password_reset_completed');
    setStatus({ type: 'success', message: 'Your password has been updated. Redirecting to the shop...' });
    setTimeout(() => router.push('/shop'), 1600);
  }

  const inputStyle = {
    width: '100%',
    padding: '0.9rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(201,169,110,0.3)',
    color: '#e8e4dc',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.95rem',
    outline: 'none',
  };

  const isExpiredLink = recoveryError?.error_code === 'otp_expired';

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24" style={{ backgroundColor: '#08080f' }}>
      <section className="w-full max-w-md text-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em]" style={{ color: '#c9a96e' }}>
          CHARMED &amp; DARK
        </p>

        {isExpiredLink ? (
          <>
            <h1
              className="mb-4 font-serif text-4xl italic"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#e8e4dc' }}
            >
              This link has gone quiet.
            </h1>
            <p className="mb-8 text-sm leading-6" style={{ color: 'rgba(232,228,220,0.58)', fontFamily: 'Inter, sans-serif' }}>
              Your reset link has expired. Enter your email and we will send a fresh one.
            </p>

            <form onSubmit={handleRequestNewLink} className="flex flex-col gap-4 text-left">
              <label className="text-xs uppercase tracking-[0.18em]" style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                required
                autoComplete="email"
                inputMode="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
              />

              {status?.message && (
                <p
                  role={status.type === 'error' ? 'alert' : 'status'}
                  className="text-center text-sm"
                  style={{ color: status.type === 'error' ? '#e24b4a' : '#c9a96e', fontFamily: 'Inter, sans-serif' }}
                >
                  {status.message}
                </p>
              )}

              <button
                type="submit"
                disabled={status?.type === 'loading'}
                className="mt-2 rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 disabled:opacity-50"
                style={{ border: '1px solid #c9a96e', color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}
              >
                {status?.type === 'loading' ? 'Sending...' : 'Send New Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1
              className="mb-4 font-serif text-4xl italic"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#e8e4dc' }}
            >
              Set a new password.
            </h1>
            <p className="mb-8 text-sm leading-6" style={{ color: 'rgba(232,228,220,0.58)', fontFamily: 'Inter, sans-serif' }}>
              Choose a new password for your Sanctuary account. After this, you can sign in normally whenever you return.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              <label className="text-xs uppercase tracking-[0.18em]" style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}>
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  minLength={8}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  style={{ ...inputStyle, paddingRight: '4rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-wider"
                  style={{ color: '#6b6760' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <label className="text-xs uppercase tracking-[0.18em]" style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}>
                Confirm password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                minLength={8}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={inputStyle}
              />

              {status?.message && (
                <p
                  role={status.type === 'error' ? 'alert' : 'status'}
                  className="text-center text-sm"
                  style={{ color: status.type === 'error' ? '#e24b4a' : '#c9a96e', fontFamily: 'Inter, sans-serif' }}
                >
                  {status.message}
                </p>
              )}

              <button
                type="submit"
                disabled={status?.type === 'loading'}
                className="mt-2 rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 disabled:opacity-50"
                style={{ border: '1px solid #c9a96e', color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}
              >
                {status?.type === 'loading' ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
