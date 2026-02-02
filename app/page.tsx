'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [feeling, setFeeling] = useState('');
  const [showReading, setShowReading] = useState(false);

  const handleMirrorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feeling.trim()) {
      setShowReading(true);
      // TODO: Integrate actual Mirror AI experience
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <Link href="/threshold" style={styles.navLink}>
          Threshold
        </Link>
        <Link href="/drops" style={styles.navLink}>
          Drops
        </Link>
        <Link href="/about" style={styles.navLink}>
          About
        </Link>
        <Link href="/join" style={styles.navLink}>
          Join
        </Link>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.brandName}>Charmed & Dark</h1>
        <p style={styles.tagline}>The Sanctuary for the Modern Shadow</p>
        <p style={styles.positioning}>
          Elegant gothic for those who function in bright worlds but feel internally darker, quieter, more introspective.
        </p>
      </section>

      {/* The Mirror Section */}
      <section style={styles.mirrorSection}>
        <div style={styles.mirrorContainer}>
          <h2 style={styles.mirrorTitle}>The Mirror</h2>
          <p style={styles.mirrorDescription}>
            A quiet place to reflect. Enter what you're feeling.
          </p>

          {!showReading ? (
            <form onSubmit={handleMirrorSubmit} style={styles.mirrorForm}>
              <input
                type="text"
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="I am feeling..."
                style={styles.mirrorInput}
                autoFocus
              />
              <button type="submit" style={styles.mirrorButton}>
                Reflect
              </button>
            </form>
          ) : (
            <div style={styles.readingCard}>
              <p style={styles.readingText}>
                Your reading is being prepared. The Mirror sees you.
              </p>
              <p style={styles.readingNote}>
                Join the Sanctuary to save your readings and unlock deeper reflections.
              </p>
              <Link href="/join" style={styles.joinLink}>
                Enter the Sanctuary
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Invitation Section */}
      <section style={styles.invitationSection}>
        <div style={styles.invitationCard}>
          <h3 style={styles.invitationTitle}>Enter the Threshold</h3>
          <p style={styles.invitationText}>
            Discover objects for the quietly introspective. Apparel and décor that honor depth over display.
          </p>
          <Link href="/threshold" style={styles.primaryCTA}>
            Discover
          </Link>
        </div>

        <div style={styles.invitationCard}>
          <h3 style={styles.invitationTitle}>Join the Sanctuary</h3>
          <p style={styles.invitationText}>
            A private space for return visits. Sanctuary pricing, saved reflections, quiet presence.
          </p>
          <Link href="/join" style={styles.secondaryCTA}>
            Learn More
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Not loud. Not viral. Enduring.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0A0A0A',
    color: '#E5E5E5',
  },
  
  // Navigation
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '48px',
    padding: '24px',
    borderBottom: '1px solid #1A1A1A',
  },
  navLink: {
    fontSize: '14px',
    color: '#8B7355',
    textDecoration: 'none',
    transition: 'color 300ms ease-in-out',
  } as React.CSSProperties,

  // Hero Section
  hero: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '96px 24px',
    textAlign: 'center' as const,
  },
  brandName: {
    fontSize: '56px',
    fontWeight: 300,
    marginBottom: '24px',
    color: '#E5E5E5',
    letterSpacing: '0.02em',
  },
  tagline: {
    fontSize: '20px',
    color: '#8B7355',
    marginBottom: '24px',
    fontStyle: 'italic',
  },
  positioning: {
    fontSize: '16px',
    color: '#999',
    lineHeight: '1.8',
    maxWidth: '600px',
    margin: '0 auto',
  },

  // Mirror Section
  mirrorSection: {
    maxWidth: '600px',
    margin: '96px auto',
    padding: '0 24px',
  },
  mirrorContainer: {
    border: '1px solid #2D1B3D',
    padding: '48px',
    backgroundColor: '#0F0F0F',
  },
  mirrorTitle: {
    fontSize: '32px',
    fontWeight: 300,
    marginBottom: '16px',
    color: '#E5E5E5',
    textAlign: 'center' as const,
  },
  mirrorDescription: {
    fontSize: '16px',
    color: '#999',
    marginBottom: '32px',
    textAlign: 'center' as const,
  },
  mirrorForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  mirrorInput: {
    padding: '16px',
    fontSize: '16px',
    backgroundColor: '#1A1A1A',
    border: '1px solid #333',
    color: '#E5E5E5',
    outline: 'none',
    transition: 'border-color 300ms ease-in-out',
  },
  mirrorButton: {
    padding: '16px 32px',
    fontSize: '16px',
    backgroundColor: '#0A0A0A',
    border: '1px solid #8B7355',
    color: '#8B7355',
    cursor: 'pointer',
    transition: 'all 300ms ease-in-out',
  },
  readingCard: {
    padding: '24px',
    backgroundColor: '#1A1A1A',
    border: '1px solid #2D1B3D',
  },
  readingText: {
    fontSize: '16px',
    color: '#E5E5E5',
    marginBottom: '16px',
    lineHeight: '1.8',
  },
  readingNote: {
    fontSize: '14px',
    color: '#999',
    marginBottom: '24px',
    lineHeight: '1.6',
  },
  joinLink: {
    display: 'inline-block',
    fontSize: '14px',
    color: '#8B7355',
    textDecoration: 'none',
    borderBottom: '1px solid #8B7355',
    transition: 'color 300ms ease-in-out',
  } as React.CSSProperties,

  // Invitation Section
  invitationSection: {
    maxWidth: '1000px',
    margin: '96px auto',
    padding: '0 24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '48px',
  },
  invitationCard: {
    padding: '48px',
    border: '1px solid #1A1A1A',
    backgroundColor: '#0F0F0F',
    textAlign: 'center' as const,
  },
  invitationTitle: {
    fontSize: '24px',
    fontWeight: 300,
    marginBottom: '16px',
    color: '#E5E5E5',
  },
  invitationText: {
    fontSize: '14px',
    color: '#999',
    lineHeight: '1.8',
    marginBottom: '32px',
  },
  primaryCTA: {
    display: 'inline-block',
    padding: '12px 32px',
    fontSize: '14px',
    backgroundColor: '#4A0E0E',
    color: '#E5E5E5',
    textDecoration: 'none',
    transition: 'all 300ms ease-in-out',
    border: '1px solid #4A0E0E',
  } as React.CSSProperties,
  secondaryCTA: {
    display: 'inline-block',
    padding: '12px 32px',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: '#8B7355',
    textDecoration: 'none',
    transition: 'all 300ms ease-in-out',
    border: '1px solid #8B7355',
  } as React.CSSProperties,

  // Footer
  footer: {
    padding: '96px 24px 48px',
    textAlign: 'center' as const,
    borderTop: '1px solid #1A1A1A',
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
    fontStyle: 'italic',
  },
};
