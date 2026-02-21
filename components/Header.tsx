'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function Header() {
  const [isRecognized, setIsRecognized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const supabase = getSupabaseClient();
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsRecognized(!!session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsRecognized(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link href="/" style={styles.logo}>
          Charmed & Dark
        </Link>
        
        <nav style={styles.nav}>
          <Link href="/collections/wardrobe" style={styles.link}>
            The Wardrobe
          </Link>
          <Link href="/collections/objects" style={styles.link}>
            The Objects
          </Link>
          <Link href="/ethos" style={styles.link}>
            The Ethos
          </Link>
          <Link href="/archive" style={styles.link}>
            The Archive
          </Link>
          
          {!mounted ? null : isRecognized ? (
            <>
              <Link href="/sanctuary" style={styles.link}>
                Sanctuary
              </Link>
              <button onClick={handleSignOut} style={styles.linkButton}>
                Leave
              </button>
            </>
          ) : (
            <Link href="/threshold/enter" style={styles.link}>
              Enter
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    borderBottom: '1px solid #2d2d2d',
    padding: '1.5rem 0',
    backgroundColor: '#f5f5f0',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '1.5rem',
    fontWeight: 400,
    letterSpacing: '0.05em',
    color: '#1a1a1a',
  },
  nav: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
  },
  status: {
    color: '#404040',
    fontWeight: 300,
  },
  link: {
    color: '#1a1a1a',
    fontWeight: 400,
    transition: 'opacity 0.2s',
    cursor: 'pointer',
    ':hover': {
      opacity: 0.6,
    },
  },
  linkButton: {
    color: '#1a1a1a',
    fontWeight: 400,
    transition: 'opacity 0.2s',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
    padding: 0,
  },
} as const;
