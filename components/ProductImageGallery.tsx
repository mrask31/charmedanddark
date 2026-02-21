'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productTitle: string;
}

export default function ProductImageGallery({ images, productTitle }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div style={styles.placeholder}>
        <p style={styles.placeholderText}>No images available</p>
      </div>
    );
  }

  const mainImage = images[selectedIndex];

  return (
    <div style={styles.container}>
      {/* Main Image */}
      <div style={styles.mainImageContainer}>
        <Image
          src={mainImage}
          alt={`${productTitle} - Image ${selectedIndex + 1}`}
          width={800}
          height={800}
          style={styles.mainImage}
          unoptimized
        />
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div style={styles.thumbnailContainer}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              style={{
                ...styles.thumbnail,
                ...(index === selectedIndex && styles.thumbnailActive),
              }}
            >
              <Image
                src={image}
                alt={`${productTitle} - Thumbnail ${index + 1}`}
                width={100}
                height={100}
                style={styles.thumbnailImage}
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
  },
  mainImageContainer: {
    width: '100%',
    aspectRatio: '1 / 1',
    backgroundColor: '#f5f5f0',
    border: '1px solid #e8e8e3',
    marginBottom: '1.5rem',
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
  },
  placeholder: {
    width: '100%',
    aspectRatio: '1 / 1',
    backgroundColor: '#2d2d2d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    color: '#f5f5f0',
    letterSpacing: '0.05em',
  },
  thumbnailContainer: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
  },
  thumbnail: {
    width: '80px',
    height: '80px',
    border: '1px solid #e8e8e3',
    backgroundColor: '#fff',
    cursor: 'pointer',
    padding: 0,
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  thumbnailActive: {
    borderColor: '#1a1a1a',
    borderWidth: '2px',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
} as const;
