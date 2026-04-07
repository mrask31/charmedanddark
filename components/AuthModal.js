"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setFirstName('');
      setStatus(null);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(201,169,110,0.3)',
    borderRadius: '0px',
    color: '#e8e4dc',
    fontFamily: 'Inter, sans-serif',
  };

  async function handleSignIn(e) {
    e.preventDefault();
    setStatus({ type: 'loading' });
    const { error } = await signIn(email, password);
    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setToast('🖤 Welcome back to the Sanctuary');
      setTimeout(() => { setToast(null); onClose(); }, 1500);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (password.length < 8) {
      setStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }
    setStatus({ type: 'loading' });
    const { error } = await signUp(email, password, {
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
      // Also subscribe to Klaviyo
      fetch('/api/klaviyo/sanctuary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName }),
      }).catch(() => {});
      onClose();
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

  return (
    <>
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 text-sm"
          style={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(201,169,110,0.4)', color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}>
          {toast}
        </div>
      )}
      <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div
          className="relative w-full max-w-sm mx-4 p-8 flex flex-col gap-5"
          style={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(201,169,110,0.2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-[#6b6760] hover:text-[#e8e4dc] text-sm">✕</button>

          <h2 className="font-serif text-2xl text-center" style={{ color: '#e8e4dc', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            {mode === 'signin' ? '🖤 Welcome Back' : 'Join the Sanctuary'}
          </h2>

          <form onSubmit={mode === 'signin' ? handleSignIn : handleJoin} className="flex flex-col gap-3">
            {mode === 'join' && (
              <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]" style={inputStyle} />
            )}
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]" style={inputStyle} />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" required minLength={mode === 'join' ? 8 : undefined}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-14 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]" style={inputStyle} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider" style={{ color: '#6b6760' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {status?.type === 'error' && <p className="text-xs" style={{ color: '#e24b4a' }}>{status.message}</p>}
            {status?.type === 'info' && <p className="text-xs" style={{ color: '#c9a96e' }}>{status.message}</p>}

            <button type="submit" disabled={status?.type === 'loading'}
              className="w-full py-3 text-sm uppercase tracking-[0.12em] font-medium transition-colors hover:bg-[#c9a96e]/10 disabled:opacity-50"
              style={{ border: '1px solid #c9a96e', color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}>
              {status?.type === 'loading' ? 'Loading...' : mode === 'signin' ? 'Enter the Sanctuary' : 'Join'}
            </button>
          </form>

          <div className="flex flex-col items-center gap-2 text-xs" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>
            {mode === 'signin' && (
              <button onClick={handleForgot} className="hover:text-[#c9a96e] transition-colors">Forgot password?</button>
            )}
            <button onClick={() => { setMode(mode === 'signin' ? 'join' : 'signin'); setStatus(null); }} className="hover:text-[#e8e4dc] transition-colors">
              {mode === 'signin' ? 'New member? Join here' : 'Already a member? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
