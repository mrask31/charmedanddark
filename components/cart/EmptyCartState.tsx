'use client';

/**
 * EmptyCartState - Elegant empty cart messaging
 * Feature: cart
 * 
 * Enforces:
 * - Elegant language (NO aggressive "Start shopping now!")
 * - Deep red hover on discovery link
 * - Generous whitespace
 * - Gothic aesthetic
 */

import { useState } from 'react';
import Link from 'next/link';

export default function EmptyCartState() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.message}>Your collection awaits</div>
      
      <Link
        href="/shop"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...styles.link,
          ...(isHovered ? styles.linkHover : {}),
        }}
      >
        Explore threshold
      </Link>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
    padding: '6rem 2rem',
    textAlign: 'center' as const,
  },
  message: {
    fontSize: '1.5rem', // 24px (H3)
    fontWeight: 400,
    fontFamily: "'Crimson Pro', serif",
    color: '#1a1a1a',
    lineHeight: 1.4,
  },
  link: {
    fontSize: '1rem',
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    color: '#8B7355', // Muted gold
    textDecoration: 'none',
    transition: 'color 300ms ease-in-out',
  },
  linkHover: {
    color: '#6B1515', // Deep red (blood)
  },
} as const;
