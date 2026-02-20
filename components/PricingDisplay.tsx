'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { PricingDisplay as PricingData } from '@/lib/pricing';

interface PricingDisplayProps {
  pricing: PricingData;
}

export default function PricingDisplay({ pricing }: PricingDisplayProps) {
  const [isRecognized, setIsRecognized] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsRecognized(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsRecognized(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div style={styles.container}>
      {isRecognized ? (
        <div style={styles.housePrice}>{pricing.formatted.house}</div>
      ) : (
        <div style={styles.dualPricing}>
          <div style={styles.standard}>
            <span style={styles.label}>Standard</span>
            <span style={styles.price}>{pricing.formatted.standard}</span>
          </div>
          <div style={styles.house}>
            <span style={styles.label}>House</span>
            <span style={styles.price}>{pricing.formatted.house}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem 0',
    borderTop: '1px solid #e8e8e3',
    borderBottom: '1px solid #e8e8e3',
  },
  housePrice: {
    fontSize: '1.75rem',
    fontFamily: "'Crimson Pro', serif",
    color: '#1a1a1a',
    fontWeight: 400,
  },
  dualPricing: {
    display: 'flex',
    gap: '2rem',
  },
  standard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  house: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.75rem',
    color: '#404040',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontFamily: "'Inter', sans-serif",
  },
  price: {
    fontSize: '1.5rem',
    fontFamily: "'Crimson Pro', serif",
    color: '#1a1a1a',
    fontWeight: 400,
  },
} as const;
