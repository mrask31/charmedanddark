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
        <div style={styles.recognizedPrice}>
          <span style={styles.housePrice}>${pricing.house.toFixed(0)}</span>
          <span style={styles.housePriceLabel}>House Price</span>
        </div>
      ) : (
        <div style={styles.dualPricing}>
          <span style={styles.basePrice}>${pricing.standard.toFixed(0)}</span>
          <span style={styles.separator}>|</span>
          <span style={styles.housePrice}>${pricing.house.toFixed(0)}</span>
          <span style={styles.housePriceLabel}>House</span>
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
  recognizedPrice: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.75rem',
  },
  dualPricing: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '1rem',
  },
  basePrice: {
    fontSize: '1.5rem',
    fontFamily: "'Inter', sans-serif",
    color: '#404040',
    fontWeight: 300,
    letterSpacing: '0.02em',
  },
  separator: {
    fontSize: '1.5rem',
    color: '#e8e8e3',
    fontWeight: 300,
  },
  housePrice: {
    fontSize: '1.75rem',
    fontFamily: "'Inter', sans-serif",
    color: '#1a1a1a',
    fontWeight: 400,
    letterSpacing: '0.02em',
  },
  housePriceLabel: {
    fontSize: '0.75rem',
    color: '#404040',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
  },
} as const;
