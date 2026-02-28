'use client';

/**
 * AccentRevealCard - Product card with accent reveal hover states
 * Feature: product-discovery-threshold
 * 
 * Enforces:
 * - Deep red (#8B0000) hover for standard products
 * - Deep purple (#4B0082) hover for featured products
 * - 0px border radius (Absolute Geometry)
 * - Full color reveal (Darkroom complete)
 * - Dual Pricing Law (House pricing logic)
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UnifiedProduct } from '@/lib/products';
import { calculateHousePrice } from '@/lib/products-discovery';

interface AccentRevealCardProps {
  product: UnifiedProduct;
  isRecognized: boolean; // Auth state for pricing display
}

export function AccentRevealCard({ product, isRecognized }: AccentRevealCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Determine if product is featured
  const isFeatured = product.metadata?.is_featured || false;
  
  // Accent colors - The Accent Reveal System
  const accentColor = isFeatured ? '#4B0082' : '#8B0000'; // Deep purple : Deep red
  const defaultBorder = '#e8e8e3'; // Off-white-dim
  
  // Image source priority: darkroom_url → hero → placeholder
  const displayImage = product.metadata?.darkroom_url || product.images.hero;
  const hoverImage = product.images.hover || displayImage;
  
  // Pricing - Dual Pricing Law
  const standardPrice = product.price;
  const housePrice = calculateHousePrice(standardPrice);
  
  return (
    <Link
      href={`/product/${product.handle}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        border: `${isHovered ? '2px' : '1px'} solid ${isHovered ? accentColor : defaultBorder}`,
        borderRadius: '0px', // Absolute Geometry
        transition: 'border 200ms ease',
        backgroundColor: '#f5f5f0', // Off-white
        overflow: 'hidden',
      }}
    >
      {/* Image Container - 4:5 aspect ratio */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '4/5',
        overflow: 'hidden',
      }}>
        {!imageError ? (
          <Image
            src={isHovered && hoverImage ? hoverImage : displayImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            style={{
              objectFit: 'cover',
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <ImagePlaceholder title={product.title} />
        )}
      </div>
      
      {/* Product Metadata - Minimal */}
      <div style={{ padding: '1rem' }}>
        {/* Title */}
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 400,
          marginBottom: '0.5rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {product.title}
        </h3>
        
        {/* Pricing - Dual Pricing Law */}
        <div style={{
          fontSize: '1rem',
          color: '#1a1a1a',
          marginBottom: '0.5rem',
        }}>
          {isRecognized ? (
            // Recognized: House price only
            <span>${housePrice}</span>
          ) : (
            // Uninitiated: Side-by-side standard/House
            <>
              <span>${standardPrice}</span>
              <span style={{ marginLeft: '0.75rem', opacity: 0.7 }}>
                ${housePrice} House
              </span>
            </>
          )}
        </div>
        
        {/* Category */}
        {product.category && (
          <div style={{
            fontSize: '0.75rem',
            color: '#404040',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            {product.category}
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * Image Placeholder - Fallback for failed image loads
 */
function ImagePlaceholder({ title }: { title: string }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#e8e8e3',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '0.75rem',
        color: '#404040',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '0.5rem',
      }}>
        No Image
      </div>
      <div style={{
        fontSize: '0.875rem',
        color: '#1a1a1a',
      }}>
        {title}
      </div>
    </div>
  );
}
