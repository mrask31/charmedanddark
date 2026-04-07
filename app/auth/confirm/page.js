'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AuthConfirmPage() {
  const [status, setStatus] = useState('confirming');
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setStatus('confirmed');
        setTimeout(() => router.push('/'), 3000);
      }
    });

    // Fallback: if no auth event fires within 5s, redirect anyway
    const fallback = setTimeout(() => {
      if (status === 'confirming') {
        setStatus('confirmed');
        setTimeout(() => router.push('/'), 2000);
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [router, status]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#08080F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', color: '#e8e4dc', padding: '2rem' }}>
        {status === 'confirming' ? (
          <>
            <p style={{ color: '#c9a96e', fontSize: '1.5rem' }}>🖤</p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', marginBottom: '1rem' }}>
              Entering the Sanctuary...
            </h1>
            <p style={{ color: 'rgba(232,228,220,0.6)', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
              Confirming your initiation.
            </p>
          </>
        ) : (
          <>
            <p style={{ color: '#c9a96e', fontSize: '2rem' }}>🖤</p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', marginBottom: '1rem' }}>
              You're in.
            </h1>
            <p style={{ color: 'rgba(232,228,220,0.6)', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Welcome to the Sanctuary.
            </p>
            <p style={{ color: 'rgba(232,228,220,0.4)', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem' }}>
              Returning you to the atelier...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
