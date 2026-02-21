'use client';

import Header from '@/components/Header';

export default function ArchivePage() {
  // Placeholder grid - will be populated with actual lifestyle imagery
  const placeholders = Array.from({ length: 12 }, (_, i) => i);

  return (
    <>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <header style={styles.header}>
            <h1 style={styles.title}>The Archive</h1>
            <p style={styles.subtitle}>Lookbook & Lifestyle</p>
          </header>

          <div style={styles.grid}>
            {placeholders.map((index) => (
              <div
                key={index}
                style={{
                  ...styles.gridItem,
                  height: index % 3 === 0 ? '500px' : index % 2 === 0 ? '400px' : '450px',
                }}
              >
                <div style={styles.placeholder}>
                  <span style={styles.placeholderText}>C&D</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f0',
    paddingTop: '3rem',
    paddingBottom: '4rem',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '4rem',
    paddingTop: '2rem',
  },
  title: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '2.5rem',
    fontWeight: 400,
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 300,
    color: '#404040',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  gridItem: {
    position: 'relative' as const,
    overflow: 'hidden',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2d2d2d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '2rem',
    fontWeight: 400,
    letterSpacing: '0.2em',
    color: '#404040',
  },
} as const;
