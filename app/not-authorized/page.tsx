'use client';

import Link from 'next/link';
import Header from '@/components/Header';

export default function NotAuthorizedPage() {
  return (
    <>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>Access Denied</h1>
            <p style={styles.message}>
              You do not have permission to access this area.
            </p>
            <p style={styles.submessage}>
              This section is restricted to authorized administrators only.
            </p>
            <Link href="/" style={styles.link}>
              ← Return to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  container: {
    maxWidth: '600px',
    width: '100%',
  },
  content: {
    backgroundColor: '#fff',
    border: '1px solid #e8e8e3',
    padding: '3rem',
    textAlign: 'center' as const,
  },
  title: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '2rem',
    fontWeight: 400,
    color: '#1a1a1a',
    marginBottom: '1rem',
    letterSpacing: '0.02em',
  },
  message: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    color: '#404040',
    marginBottom: '0.5rem',
    lineHeight: 1.6,
  },
  submessage: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '2rem',
    lineHeight: 1.6,
  },
  link: {
    display: 'inline-block',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    color: '#1a1a1a',
    textDecoration: 'underline',
    letterSpacing: '0.05em',
  },
} as const;
