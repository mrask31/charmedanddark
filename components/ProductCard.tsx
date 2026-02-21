'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UnifiedProduct } from '@/lib/products';
import { getPricingDisplay } from '@/lib/pricing';

interface ProductCardProps {
  product: UnifiedProduct;
  isRecognized: boolean;
}

export default function ProductCard({ product, isRecognized }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const pricing = getPricingDisplay(product.price);
  
  const displayImage = isHovered && product.images.hover 
    ? product.images.hover 
    : product.images.hero;

  // Debug logging
  if (typeof window !== 'undefined' && product.handle === 'celestial-taper-candles') {
    console.log('Product image path:', displayImage);
  }

  return (
    <Link href={`/product/${product.handle}`} style={styles.card}>
      <div
        style={styles.imageContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!imageError ? (
          <Image
            src={displayImage}
            alt={product.title}
            width={400}
            height={500}
            style={styles.image}
            unoptimized
            onError={() => {
              console.log('Image failed to load:', displayImage);
              setImageError(true);
            }}
          />
        ) : (
          <div style={styles.imagePlaceholder}>
            <span>No Image</span>
          </div>
        )}
        {!product.inStock && (
          <div style={styles.outOfStock}>Out of Stock</div>
        )}
      </div>
      
      <div style={styles.info}>
        <h3 style={styles.title}>{product.title}</h3>
        
        <div style={styles.pricing}>
          {isRecognized ? (
            <span style={styles.housePrice}>{pricing.formatted.house}</span>
          ) : (
            <>
              <span style={styles.standardPrice}>{pricing.formatted.standard}</span>
              <span style={styles.housePricePreview}>{pricing.formatted.house} House</span>
            </>
          )}
        </div>
        
        {product.category && (
          <span style={styles.category}>{product.category}</span>
        )}
      </div>
    </Link>
  );
}

const styles = {
  card: {
    display: 'block',
    backgroundColor: '#fff',
    border: '1px solid #e8e8e3',
    transition: 'border-color 0.2s',
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%',
    aspectRatio: '4 / 5',
    overflow: 'hidden',
    backgroundColor: '#f5f5f0',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  outOfStock: {
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#2d2d2d',
    color: '#f5f5f0',
    fontSize: '0.75rem',
    fontWeight: 400,
    letterSpacing: '0.05em',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8e8e3',
    color: '#404040',
    fontSize: '0.875rem',
  },
  info: {
    padding: '1rem',
  },
  title: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '1.1rem',
    fontWeight: 400,
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  pricing: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'baseline',
    marginBottom: '0.5rem',
  },
  standardPrice: {
    fontSize: '1rem',
    color: '#1a1a1a',
    fontWeight: 400,
  },
  housePricePreview: {
    fontSize: '0.9rem',
    color: '#404040',
    fontWeight: 300,
  },
  housePrice: {
    fontSize: '1rem',
    color: '#1a1a1a',
    fontWeight: 400,
  },
  category: {
    fontSize: '0.75rem',
    color: '#404040',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontWeight: 300,
  },
} as const;
