'use client';

import { ProductVariant } from '@/lib/supabase/client';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onVariantChange: (variantId: string) => void;
}

export default function VariantSelector({ 
  variants, 
  selectedVariantId, 
  onVariantChange 
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <label style={styles.label}>Select Variant</label>
      <div style={styles.options}>
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          const isOutOfStock = variant.stock_quantity <= 0;
          
          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onVariantChange(variant.id)}
              disabled={isOutOfStock}
              style={{
                ...styles.option,
                ...(isSelected && styles.optionSelected),
                ...(isOutOfStock && styles.optionDisabled),
              }}
            >
              <span style={styles.optionName}>{variant.name}</span>
              {isOutOfStock && (
                <span style={styles.outOfStock}>Out of Stock</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 400,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#404040',
  },
  options: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
  },
  option: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#1a1a1a',
    border: '1px solid #e8e8e3',
    borderRadius: '0px',
    fontSize: '0.875rem',
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.25rem',
  },
  optionSelected: {
    backgroundColor: '#1a1a1a',
    color: '#f5f5f0',
    borderColor: '#1a1a1a',
  },
  optionDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  optionName: {
    display: 'block',
  },
  outOfStock: {
    fontSize: '0.65rem',
    letterSpacing: '0.05em',
    opacity: 0.7,
  },
} as const;
