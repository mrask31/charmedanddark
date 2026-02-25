'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function EnterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = getSupabaseClient();

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Success - redirect to home
        router.push('/');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Success - redirect to home
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <Link href="/" style={styles.back}>
          ← Return
        </Link>
        
        <h1 style={styles.title}>Enter the House</h1>
        <p style={styles.subtitle}>
          {isSignUp ? 'Create your account' : 'Recognized members receive House pricing'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
              disabled={loading}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Enter'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          style={styles.toggle}
          disabled={loading}
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    backgroundColor: '#f5f5f0',
  },
  box: {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem',
    backgroundColor: '#fff',
    border: '1px solid #e8e8e3',
  },
  back: {
    display: 'inline-block',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    color: '#404040',
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '2rem',
    fontWeight: 400,
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    color: '#404040',
    marginBottom: '2rem',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 400,
    color: '#1a1a1a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #e8e8e3',
    fontSize: '1rem',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#fff',
    color: '#1a1a1a',
    transition: 'border-color 0.2s',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#2d2d2d',
    color: '#f5f5f0',
    fontSize: '0.85rem',
    fontFamily: "'Inter', sans-serif",
  },
  button: {
    padding: '1rem',
    backgroundColor: '#1a1a1a',
    color: '#f5f5f0',
    fontSize: '0.9rem',
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
  },
  toggle: {
    marginTop: '1rem',
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.85rem',
    color: '#404040',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
} as const;
