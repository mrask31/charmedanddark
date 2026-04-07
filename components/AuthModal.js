"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [birthday, setBirthday] = useState('');
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setFirstName('');
      setBirthday('');
      setStatus(null);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(201,169,110,0.3)',
    borderRadius: '0px',
    color: '#e8e4dc',
    fontFamily: 'Inter, sans-serif',
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
  };

  async function handleSignIn(e) {
    e.preventDefault();
    setStatus({ type: 'loading' });
    try {
      console.log('Attempting sign in with:', email);
      const { data, error } = await signIn(email, password);
      console.log('Sign in result:', { data: !!data, error });
      if (error) {
        setStatus({ type: 'error', message: error.message });
        return;
      }
      setStatus(null);
      onClose();
      setToast('🖤 Welcome back to the Sanctuary');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Sign in exception:', err);
      setStatus({ type: 'error', message: err.message || 'Sign in failed. Please try again.' });
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (password.length < 8) {
      setStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }
    setStatus({ type: 'loading' });
    const { data: signUpData, error } = await signUp(email, password, {
      is_sanctuary_member: true,
      first_name: firstName || undefined,
    });
    if (error) {
      if (error.message?.includes('already') || error.status === 422) {
        await resetPassword(email);
        setStatus({ type: 'error', message: 'An account exists — check your email to set your password.' });
        return;
      }
      setStatus({ type: 'error', message: error.message });
    } else {
      const userId = signUpData?.user?.id;
      fetch('/api/klaviyo/sanctuary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, birthday: birthday || null }),
      }).catch(() => {});
      fetch('/api/auth/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, userId, birthday: birthday || null }),
      }).catch(() => {});
      setStatus({ type: 'joined' });
    }
  }

  async function handleForgot() {
    if (!email) {
      setStatus({ type: 'error', message: 'Enter your email first.' });
      return;
    }
    await resetPassword(email);
    setStatus({ type: 'info', message: 'Password reset link sent — check your email.' });
  }

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100000, padding: '0.75rem 1.5rem', borderRadius: '9999px', fontSize: '0.875rem',
          backgroundColor: '#1a1a2e', border: '1px solid rgba(201,169,110,0.4)',
          color: '#c9a96e', fontFamily: 'Inter, sans-serif', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        }}>
          {toast}
        </div>
      )}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)', overflowY: 'auto',
        }}
        onClick={onClose}
      >
        <div
          style={{
            position: 'relative', width: '100%', maxWidth: '28rem',
            margin: '6rem auto 2rem auto', backgroundColor: '#0e0e1a',
            border: '1px solid rgba(201,169,110,0.2)', borderRadius: '0.5rem',
            padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              color: 'rgba(232,228,220,0.4)', background: 'none',
              border: 'none', fontSize: '1.25rem', cursor: 'pointer',
            }}
          >✕</button>

          {status?.type === 'joined' ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ color: '#c9a96e', fontSize: '1.5rem' }}>🖤</p>
              <h2 style={{ color: '#e8e4dc', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', marginBottom: '0.75rem' }}>
                You're in. Almost.
              </h2>
              <p style={{ color: 'rgba(232,228,220,0.7)', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
                Check your inbox and verify your email to activate your Sanctuary membership.
              </p>
              <p style={{ color: 'rgba(232,228,220,0.4)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>
                Your 10% member discount will apply automatically once your email is confirmed.
              </p>
              <button onClick={onClose}
                style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', border: '1px solid rgba(201,169,110,0.3)',
                  color: '#c9a96e', background: 'none', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>
                Close
              </button>
            </div>
          ) : (
          <>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem',
            textAlign: 'center', color: '#e8e4dc', marginBottom: '1.25rem',
          }}>
            {mode === 'signin' ? '🖤 Welcome Back' : 'Join the Sanctuary'}
          </h2>

          <form onSubmit={mode === 'signin' ? handleSignIn : handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mode === 'join' && (
              <input type="text" placeholder="First name" value={firstName}
                onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
            )}
            <input type="email" placeholder="Email" required value={email}
              onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Password"
                required minLength={mode === 'join' ? 8 : undefined}
                value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: '3.5rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  color: '#6b6760', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {mode === 'join' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.625rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(232,228,220,0.5)', marginBottom: '0.4rem', fontFamily: 'Inter, sans-serif' }}>
                  Birthday <span style={{ color: 'rgba(232,228,220,0.3)' }}>(optional)</span>
                </label>
                <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)}
                  style={inputStyle} />
                <p style={{ fontSize: '0.7rem', color: 'rgba(232,228,220,0.3)', marginTop: '0.3rem', fontFamily: 'Inter, sans-serif' }}>
                  We'll send you something special on your birthday 🖤
                </p>
              </div>
            )}

            {status?.type === 'error' && (
              <p style={{ color: '#e24b4a', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}>{status.message}</p>
            )}
            {status?.type === 'info' && (
              <p style={{ color: '#c9a96e', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif' }}>{status.message}</p>
            )}

            <button type="submit" disabled={status?.type === 'loading'}
              style={{
                width: '100%', padding: '0.75rem', fontSize: '0.875rem',
                textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500,
                border: '1px solid #c9a96e', color: '#c9a96e', backgroundColor: 'transparent',
                cursor: status?.type === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status?.type === 'loading' ? 0.5 : 1,
                fontFamily: 'Inter, sans-serif',
              }}>
              {status?.type === 'loading' ? 'Loading...' : mode === 'signin' ? 'Enter the Sanctuary' : 'Join'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>
            {mode === 'signin' && (
              <button onClick={handleForgot} style={{ background: 'none', border: 'none', color: '#6b6760', cursor: 'pointer' }}>
                Forgot password?
              </button>
            )}
            <button onClick={() => { setMode(mode === 'signin' ? 'join' : 'signin'); setStatus(null); }}
              style={{ background: 'none', border: 'none', color: '#6b6760', cursor: 'pointer' }}>
              {mode === 'signin' ? 'New member? Join here' : 'Already a member? Sign in'}
            </button>
          </div>
          </>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
