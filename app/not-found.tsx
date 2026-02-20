import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Not Found</h1>
      <p style={styles.text}>The page you're looking for doesn't exist.</p>
      <Link href="/" style={styles.link}>
        Return Home
      </Link>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    textAlign: 'center' as const,
  },
  title: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '2rem',
    fontWeight: 400,
    marginBottom: '1rem',
    color: '#1a1a1a',
  },
  text: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    color: '#404040',
    marginBottom: '2rem',
  },
  link: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1a1a1a',
    color: '#f5f5f0',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
} as const;
