export default function HomePage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Charmed & Dark</h1>
      <p style={styles.subtitle}>Luxury gothic-romantic ecommerce</p>

      <nav style={styles.nav}>
        <a href="/threshold/cart" style={styles.link}>
          Cart
        </a>
      </nav>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '96px 24px',
    backgroundColor: '#0A0A0A',
    minHeight: '100vh',
    color: '#E5E5E5',
    textAlign: 'center' as const,
  },
  heading: {
    fontSize: '48px',
    fontWeight: 400,
    marginBottom: '24px',
    color: '#E5E5E5',
  },
  subtitle: {
    fontSize: '20px',
    color: '#666',
    marginBottom: '72px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    alignItems: 'center',
  },
  link: {
    fontSize: '16px',
    color: '#8B7355', // Muted gold
    textDecoration: 'none',
  },
};
