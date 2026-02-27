'use client';

/**
 * CartItemCard - Individual cart item presentation
 * Feature: cart
 * 
 * Enforces:
 * - 18px internal spacing between elements
 * - Absolute Geometry (0px border radius)
 * - Darkroom fallback (grayscale + PROCESSING tag)
 * - Deep red hover states (300ms transitions)
 * - Muted gold price emphasis
 * - Subtle modification feedback (NO modals)
 */

import { useState } from 'react';
import Image from 'next/image';
import { updateLineItem, removeLineItem } from '@/lib/cart/shopify';
import type { CartLineItem, Cart } from '@/lib/cart/types';

interface CartItemCardProps {
  lineItem: CartLineItem;
  cartId: string;
  onUpdate: (updatedCart: Cart, feedback?: any) => void;
}

export default function CartItemCard({ lineItem, cartId, onUpdate }: CartItemCardProps) {
  const [isModifying, setIsModifying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeHover, setRemoveHover] = useState(false);
  const [decrementHover, setDecrementHover] = useState(false);
  const [incrementHover, setIncrementHover] = useState(false);

  // Darkroom state detection
  const isDarkroomProcessing = !lineItem.image.url.includes('cdn.shopify.com');
  const displayImage = lineItem.image.url;

  // Handle quantity change
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || isModifying) return;
    
    setIsModifying(true);
    
    const result = await updateLineItem(cartId, lineItem.id, newQuantity);
    
    if (result.success) {
      onUpdate(result.updatedCart, result.feedback);
    } else {
      onUpdate(result.updatedCart, result.feedback);
    }
    
    setIsModifying(false);
  };

  // Handle remove item
  const handleRemove = async () => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    
    const result = await removeLineItem(cartId, lineItem.id);
    
    if (result.success) {
      onUpdate(result.updatedCart, result.feedback);
    } else {
      onUpdate(result.updatedCart, result.feedback);
      setIsRemoving(false);
    }
  };

  return (
    <div style={{
      ...styles.card,
      opacity: isRemoving ? 0.5 : 1,
      transition: 'opacity 300ms ease',
    }}>
      {/* Product image */}
      <div style={styles.imageContainer}>
        <Image
          src={displayImage}
          alt={lineItem.image.alt}
          width={120}
          height={120}
          style={{
            objectFit: 'cover',
            filter: isDarkroomProcessing ? 'grayscale(100%) contrast(1.2)' : 'none',
            borderRadius: '0px', // Absolute Geometry
          }}
        />
        
        {isDarkroomProcessing && (
          <div style={styles.darkroomTag}>
            PROCESSING // DARKROOM
          </div>
        )}
      </div>

      {/* Product details */}
      <div style={styles.details}>
        <div style={styles.titleSection}>
          <h3 style={styles.title}>{lineItem.title}</h3>
          {lineItem.variantTitle && (
            <div style={styles.variant}>{lineItem.variantTitle}</div>
          )}
        </div>

        <div style={styles.priceSection}>
          <span style={styles.price}>${lineItem.price.toFixed(2)}</span>
        </div>

        {/* Quantity controls */}
        <div style={styles.quantitySection}>
          <div style={styles.quantityLabel}>Quantity</div>
          <div style={styles.quantityControls}>
            <button
              onClick={() => handleQuantityChange(lineItem.quantity - 1)}
              disabled={lineItem.quantity === 1 || isModifying}
              onMouseEnter={() => setDecrementHover(true)}
              onMouseLeave={() => setDecrementHover(false)}
              style={{
                ...styles.quantityButton,
                ...(decrementHover && lineItem.quantity > 1 ? styles.quantityButtonHover : {}),
                ...(lineItem.quantity === 1 ? styles.quantityButtonDisabled : {}),
              }}
            >
              −
            </button>
            <span style={styles.quantityDisplay}>{lineItem.quantity}</span>
            <button
              onClick={() => handleQuantityChange(lineItem.quantity + 1)}
              disabled={isModifying}
              onMouseEnter={() => setIncrementHover(true)}
              onMouseLeave={() => setIncrementHover(false)}
              style={{
                ...styles.quantityButton,
                ...(incrementHover ? styles.quantityButtonHover : {}),
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Remove action */}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          onMouseEnter={() => setRemoveHover(true)}
          onMouseLeave={() => setRemoveHover(false)}
          style={{
            ...styles.removeButton,
            ...(removeHover ? styles.removeButtonHover : {}),
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    gap: '18px', // Internal spacing (transactional state)
    padding: '18px',
    backgroundColor: '#ffffff',
    borderRadius: '0px', // Absolute Geometry
    border: '1px solid #e8e8e3',
  },
  imageContainer: {
    position: 'relative' as const,
    width: '120px',
    height: '120px',
    borderRadius: '0px', // Absolute Geometry
    overflow: 'hidden',
  },
  darkroomTag: {
    position: 'absolute' as const,
    top: '0.5rem',
    left: '0.5rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#f5f5f0',
    fontSize: '0.625rem',
    letterSpacing: '0.15em',
    fontWeight: 300,
    fontFamily: "'Inter', sans-serif",
    zIndex: 10,
  },
  details: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px', // Internal spacing
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  title: {
    fontSize: '1.25rem', // 20px (Body Large)
    fontWeight: 400,
    fontFamily: "'Crimson Pro', serif",
    color: '#1a1a1a',
    lineHeight: 1.3,
  },
  variant: {
    fontSize: '0.875rem', // 14px (Body Small)
    color: '#404040',
    fontFamily: "'Inter', sans-serif",
  },
  priceSection: {
    display: 'flex',
    alignItems: 'baseline',
  },
  price: {
    fontSize: '1.25rem', // 20px (Body Large)
    fontWeight: 300,
    color: '#8B7355', // Muted gold (antique-gold)
    fontFamily: "'Inter', sans-serif",
  },
  quantitySection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  quantityLabel: {
    fontSize: '0.75rem',
    color: '#404040',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontFamily: "'Inter', sans-serif",
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    backgroundColor: 'transparent',
    color: '#1a1a1a',
    border: '1px solid #e8e8e3',
    borderRadius: '0px', // Absolute Geometry
    fontSize: '1rem',
    fontWeight: 300,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 300ms ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonHover: {
    borderColor: '#6B1515', // Deep red (blood)
    color: '#6B1515',
  },
  quantityButtonDisabled: {
    borderColor: '#e8e8e3',
    color: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  quantityDisplay: {
    fontSize: '1rem',
    fontWeight: 400,
    color: '#1a1a1a',
    fontFamily: "'Inter', sans-serif",
    minWidth: '24px',
    textAlign: 'center' as const,
  },
  removeButton: {
    alignSelf: 'flex-start',
    padding: '0',
    backgroundColor: 'transparent',
    color: '#404040',
    border: 'none',
    fontSize: '0.875rem', // 14px (Body Small)
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'color 300ms ease-in-out',
    textDecoration: 'underline',
  },
  removeButtonHover: {
    color: '#6B1515', // Deep red (blood)
  },
} as const;
